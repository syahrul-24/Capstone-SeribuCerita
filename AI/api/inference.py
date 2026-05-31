"""
SeribuCerita Emotion Classifier — Inference Module
Capstone Project CC26-PSU212 — AI Path

Downloads model from HF Model Hub on startup.
"""
import os
import json
import numpy as np
import tensorflow as tf
from transformers import BertTokenizer
from huggingface_hub import snapshot_download

# ============================================================
# CONFIG
# ============================================================
HF_MODEL_REPO = os.environ.get('HF_MODEL_REPO', 'syahrulw/seribucerita-model')
MAX_LENGTH = 128
TEMPERATURE = 1.5
ANGER_SAD_THRESHOLD = 0.15
NEGATION_WORDS = {'tidak', 'ga', 'gak', 'nggak', 'enggak', 'bukan', 'tak', 'belum', 'jangan', 'tanpa'}

ID2LABEL = {0: 'anger', 1: 'fear', 2: 'sad', 3: 'neutral', 4: 'happy'}
LABEL2ID = {v: k for k, v in ID2LABEL.items()}
LABEL_EMOJI = {
    'anger': '😠', 'fear': '😨', 'sad': '😢',
    'neutral': '😐', 'happy': '😄',
}


class EmotionPredictor:
    """Production-ready emotion predictor using IndoBERT SavedModel."""

    def __init__(self, hf_repo=None):
        self.hf_repo = hf_repo or HF_MODEL_REPO
        self.tokenizer = None
        self.infer_fn = None
        self.output_key = None
        self.results_data = None
        self._loaded = False

    def load(self):
        if self._loaded:
            return self

        print(f"Downloading model from HF Hub: {self.hf_repo}...")
        model_dir = snapshot_download(repo_id=self.hf_repo)
        print(f"Model downloaded to: {model_dir}")

        self.tokenizer = BertTokenizer.from_pretrained(
            os.path.join(model_dir, 'tokenizer')
        )
        model = tf.saved_model.load(os.path.join(model_dir, 'saved_model'))
        self.infer_fn = model.signatures['serving_default']
        self.output_key = list(self.infer_fn.structured_outputs.keys())[0]

        results_path = os.path.join(model_dir, 'results.json')
        if os.path.exists(results_path):
            with open(results_path) as f:
                self.results_data = json.load(f)

        self._loaded = True
        print("Model loaded!")
        return self

    def predict(self, text: str, calibrate: bool = True) -> dict:
        if not self._loaded:
            self.load()

        encoding = self.tokenizer(
            text, max_length=MAX_LENGTH, truncation=True,
            padding='max_length', return_tensors='np',
        )
        outputs = self.infer_fn(
            input_ids=tf.constant(encoding['input_ids'], dtype=tf.int32),
            attention_mask=tf.constant(encoding['attention_mask'], dtype=tf.int32),
        )
        logits = outputs[self.output_key].numpy()[0]

        notes = []

        # Raw probabilities (without temperature — for display)
        raw_probs = _softmax(logits)
        raw_pred_id = int(np.argmax(raw_probs))

        # Calibrated probabilities (with temperature — for corrections)
        scaled_logits = logits / TEMPERATURE if calibrate else logits
        probs = _softmax(scaled_logits)
        pred_id = int(np.argmax(probs))

        # --- Negation check FIRST (before other corrections) ---
        # Uses raw_probs (not temperature-scaled) so threshold is meaningful
        if calibrate:
            words = set(text.lower().split())
            if words & NEGATION_WORDS and ID2LABEL[pred_id] != 'neutral' and float(raw_probs[pred_id]) > 0.3:
                notes.append(f'negation detected, was {ID2LABEL[pred_id]}')
                pred_id = 3

        # --- anger→sad correction (only if negation didn't already fix it) ---
        if calibrate and pred_id == 0:
            gap = float(probs[0]) - float(probs[2])
            if gap < ANGER_SAD_THRESHOLD:
                pred_id = 2
                notes.append(f'anger→sad correction (gap={gap:.3f})')

        label = ID2LABEL[pred_id]
        scores = {ID2LABEL[i]: round(float(probs[i]), 4) for i in range(5)}

        result = {
            'label': label,
            'confidence': round(float(raw_probs[pred_id]), 4),
            'calibrated_confidence': round(float(probs[pred_id]), 4),
            'emoji': LABEL_EMOJI[label],
            'scores': dict(sorted(scores.items(), key=lambda x: x[1], reverse=True)),
        }
        if notes:
            result['notes'] = notes
        return result

    def predict_batch(self, texts: list, calibrate: bool = True) -> list:
        return [self.predict(t, calibrate=calibrate) for t in texts]

    def get_model_info(self) -> dict:
        info = {
            'model_name': 'SeribuCerita Emotion Classifier',
            'backbone': 'indobenchmark/indobert-base-p1',
            'task': '5-class Indonesian emotion classification',
            'classes': list(ID2LABEL.values()),
            'max_length': MAX_LENGTH,
        }
        if self.results_data:
            info['metrics'] = {
                'test_accuracy': self.results_data.get('test_accuracy'),
                'test_macro_f1': self.results_data.get('test_macro_f1'),
            }
        return info


def _softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()
