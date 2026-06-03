import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import os

# CONFIG PAGE
st.set_page_config(
    page_title="Dashboard Analisis Emosi Tweet",
    page_icon="📊",
    layout="wide"
)

st.markdown("""
<style>

/* warna item yang dipilih di multiselect */
span[data-baseweb="tag"] {
    background-color: #DCEBFF !important;
    color: black !important;
    border-radius: 8px !important;
}

/* tombol close (x) */
span[data-baseweb="tag"] svg {
    fill: black !important;
}

</style>
""", unsafe_allow_html=True)

# CUSTOM FONT SIZE
st.markdown("""
<style>
/* isi paragraf */
p {
    font-size: 18px !important;
}

/* bullet list */
li {
    font-size: 18px !important;
}

/* tulisan bold */
strong {
    font-size: 18px !important;
}
</style>
""", unsafe_allow_html=True)

# LOAD DATA
@st.cache_data
def load_data():
    current_dir = os.path.dirname(__file__)
    file_path = os.path.join(
        current_dir,
        "output_data_final.csv"
    )
    return pd.read_csv(file_path)

data = load_data()

# SIDEBAR MENU
st.sidebar.title("📌 Menu")

page = st.sidebar.selectbox(
    "Pilih Halaman",
    ["Penjelasan Proyek", "Dashboard"]
)

st.sidebar.divider()

st.sidebar.info("""
Gunakan menu untuk berpindah halaman.

📄 Penjelasan Proyek  
📊 Dashboard
""")

# 📄 HALAMAN 1
if page == "Penjelasan Proyek":

    left, center, right = st.columns([1.2, 4, 1.2])

    with center:

        st.title("📄 Penjelasan Proyek")

        st.markdown("""
        ## 📊 Latar Belakang
        
        Media sosial menjadi salah satu platform utama bagi pengguna untuk mengekspresikan emosi melalui teks. Tweet yang diunggah sering kali mengandung berbagai emosi, seperti anger, fear, sad, happy, dan neutral. Kondisi ini menjadikan data teks dari media sosial sebagai sumber yang sangat kaya untuk dianalisis, terutama dalam memahami bagaimana emosi direpresentasikan dalam komunikasi digital sehari-hari.

        Analisis emosi pada data teks dapat membantu memahami pola perilaku pengguna serta memberikan gambaran mengenai kecenderungan emosi yang muncul dalam suatu periode atau topik tertentu. Selain itu, proses ini juga menjadi dasar penting dalam pengembangan sistem analisis teks berbasis Natural Language Processing (NLP), yang bertujuan untuk mengekstrak informasi emosional dari data tidak terstruktur agar dapat menghasilkan insight yang lebih bermakna.
        
        ## 🎯 Tujuan Proyek

        Proyek ini bertujuan untuk mengeksplorasi dan menganalisis data emosi pada tweet guna memperoleh insight yang relevan. Tujuan utama dari proyek ini meliputi:

        - Menganalisis distribusi jumlah data pada masing-masing kategori emosi
        - Mengidentifikasi proporsi emosi dominan dalam dataset
        - Menganalisis keseimbangan data antar label emosi yang dapat memengaruhi proses pelatihan model
        - Mengeksplorasi karakteristik teks melalui feature engineering seperti jumlah kata dan panjang karakter tweet
        - Membandingkan pola karakteristik tweet pada emosi happy dan sad

        ## ⚙️ Pendekatan

        Pendekatan yang digunakan dalam proyek ini dilakukan secara bertahap untuk memastikan alur analisis data berjalan sistematis dan dapat digunakan sebagai dasar pengembangan model Machine Learning berbasis NLP, yaitu:

        1. **Menentukan Pertanyaan Bisnis:** Menentukan permasalahan utama terkait analisis emosi pada teks serta potensi penerapannya dalam mendukung solusi kesehatan mental berbasis teknologi.

        2. **Data Wrangling:** Melakukan proses pengumpulan data (gathering data) dan evaluasi kualitas data (assessing data) untuk memahami struktur, kualitas, dan potensi permasalahan pada dataset.

        3. **Data Restructuring:** Melakukan penyesuaian struktur data agar lebih sesuai untuk kebutuhan analisis dan visualisasi.

        4. **Exploratory Data Analysis (EDA) Sebelum Preprocessing:** Menganalisis kondisi awal data untuk memahami distribusi label emosi, karakteristik teks, serta potensi noise dalam dataset.

        5. **Preprocessing Data:** Melakukan cleaning data untuk membersihkan teks dari karakter yang tidak diperlukan sehingga data menjadi lebih siap dianalisis.
       
        6. **Exploratory Data Analysis (EDA) Setelah Preprocessing:** Mengevaluasi perubahan karakteristik data setelah preprocessing serta membandingkan hasil sebelum dan sesudah proses pembersihan data.

        7. **Visualization & Explanatory Analysis:** Menyajikan hasil analisis dalam bentuk visualisasi untuk membantu interpretasi pola data dan insight yang ditemukan.

        8. **Feature Engineering:** Membentuk fitur tambahan seperti jumlah kata dan panjang karakter tweet guna memperoleh pemahaman lebih mendalam terhadap karakteristik data teks.

        9. **A/B Testing:** Membandingkan karakteristik antar kelompok emosi untuk mengetahui adanya perbedaan pola tertentu, misalnya jumlah kata pada kategori emosi tertentu.

        ## 🎯 Hasil yang Diharapkan

        Melalui proyek ini diharapkan diperoleh insight terkait pola emosi pada tweet, distribusi data antar label, serta karakteristik teks pada masing-masing kategori emosi. 
        Selain itu, dashboard interaktif yang dikembangkan diharapkan dapat membantu pengguna mengeksplorasi hasil analisis secara lebih mudah, intuitif, dan informatif untuk mendukung pemahaman terhadap data emosi teks.
        """)

# 📊 HALAMAN 2
elif page == "Dashboard":

    # FILTER EMOSI
    st.sidebar.header("⚙️ Filter Emosi")

    emotion_options = ["Semua"] + sorted(
        data["label"].unique()
    )

    selected_emotion = st.sidebar.multiselect(
        "Pilih Emosi",
        emotion_options,
        default=["Semua"]
    )

    # FILTER DATA
    if (
        "Semua" in selected_emotion
        or len(selected_emotion) == 0
    ):
        filtered_data = data.copy()

    else:
        filtered_data = data[
            data["label"].isin(selected_emotion)
        ]

    # CENTER LAYOUT
    left, center, right = st.columns([1.2, 4, 1.2])

    with center:

        st.title("📊 Dashboard Analisis Emosi Tweet")

        st.write("""
        Dashboard interaktif untuk menampilkan insight
        dan kesimpulan hasil preprocessing,
        feature engineering, dan analisis emosi tweet.
        """)

        # METRICS
        st.subheader("📌 Ringkasan Dataset")

        col1, col2, col3 = st.columns(3)

        col1.metric(
            "Jumlah Data",
            len(filtered_data)
        )

        col2.metric(
            "Jumlah Label Emosi",
            filtered_data["label"].nunique()
        )

        col3.metric(
            "Rata-rata Jumlah Kata",
            round(
                filtered_data["jumlah_kata"].mean(),
                2
            )
        )

        st.divider()

        # DISTRIBUSI EMOSI

        col_left, col_right = st.columns(2)

        with col_left:

            st.subheader(
                "1️⃣ Distribusi Jumlah Tweet per Emosi"
            )

            emotion_counts = (
                filtered_data["label"]
                .value_counts()
            )

            fig, ax = plt.subplots(
                figsize=(6, 4)
            )

            emotion_counts.plot(
                kind="bar",
                ax=ax
            )

            ax.set_xlabel(
                "Label Emosi"
            )

            ax.set_ylabel(
                "Jumlah Tweet"
            )

            ax.set_title(
                "Distribusi Tweet Berdasarkan Label Emosi"
            )

            st.pyplot(fig)

            dominant = emotion_counts.idxmax()

            st.info(f"""
            **Insight:**

            Berdasarkan distribusi jumlah tweet pada masing-masing label emosi,
            emosi **{dominant}** menjadi kategori yang paling dominan dengan
            jumlah **{emotion_counts.max()} tweet**.

            Hal ini menunjukkan bahwa sebagian besar tweet dalam dataset
            lebih banyak merepresentasikan emosi **{dominant}**
            dibandingkan kategori emosi lainnya. Perbedaan jumlah data ini
            dapat memberikan gambaran awal mengenai pola ekspresi emosi
            yang paling sering muncul.
            """)

        with col_right:

            st.subheader(
                "2️⃣ Persentase Distribusi Emosi"
            )

            persentase = (
                filtered_data["label"]
                .value_counts(normalize=True)
                * 100
            )

            fig2, ax2 = plt.subplots(
                figsize=(6, 4)
            )

            ax2.pie(
                persentase,
                labels=persentase.index,
                autopct="%1.1f%%"
            )

            ax2.set_title(
                "Persentase Label Emosi"
            )

            st.pyplot(fig2)

            st.info("""
            **Insight:**

            Visualisasi persentase membantu menunjukkan proporsi
            masing-masing emosi dalam dataset. Terlihat bahwa setiap
            kategori memiliki jumlah representasi yang berbeda sehingga
            distribusi data tidak sepenuhnya sama.

            Kondisi ini penting diperhatikan karena dapat memengaruhi
            hasil analisis, terutama saat membandingkan karakteristik
            antar emosi dalam dataset.
            """)

        st.divider()


        col_left, col_right = st.columns(2)

        with col_left:

            st.subheader(
                "3️⃣ Analisis Ketidakseimbangan Dataset"
            )

            fig3, ax3 = plt.subplots(
                figsize=(6, 4)
            )

            filtered_data["label"]\
                .value_counts()\
                .plot(kind="bar", ax=ax3)

            ax3.set_xlabel(
                "Label Emosi"
            )

            ax3.set_ylabel(
                "Jumlah Data"
            )

            ax3.set_title(
                "Perbandingan Jumlah Data Antar Label"
            )

            st.pyplot(fig3)

            jumlah_label = (
                filtered_data["label"]
                .value_counts()
            )

            rasio = (
                jumlah_label.max()
                / jumlah_label.min()
            )

            st.write(
                f"**Rasio ketidakseimbangan data:** {rasio:.2f}"
            )

            if rasio < 2:

                st.info(f"""
                **Insight:**

                Nilai rasio ketidakseimbangan sebesar
                **{rasio:.2f}** menunjukkan bahwa jumlah
                data antar label emosi masih relatif seimbang.

                Dengan kondisi ini, setiap kategori emosi
                memiliki representasi data yang cukup baik
                sehingga hasil analisis antar emosi dapat
                dibandingkan dengan lebih proporsional.
                """)

            else:

                st.info(f"""
                **Insight:**

                Nilai rasio ketidakseimbangan sebesar
                **{rasio:.2f}** menunjukkan adanya perbedaan
                jumlah data yang cukup terlihat antar label emosi.

                Kondisi ini mengindikasikan bahwa beberapa emosi
                memiliki jumlah data lebih dominan dibandingkan
                kategori lainnya sehingga hasil analisis perlu
                diinterpretasikan dengan mempertimbangkan
                distribusi data tersebut.
                """)

        with col_right:

            st.subheader(
                "4️⃣ Statistik Feature Engineering"
            )

            fitur = [
                "jumlah_kata",
                "panjang_karakter"
            ]

            st.dataframe(
                filtered_data[fitur]
                .describe()
            )

            st.info(f"""
            **Insight:**

            Hasil statistik deskriptif memberikan
            gambaran mengenai karakteristik tweet
            berdasarkan jumlah kata dan panjang karakter.

            Rata-rata jumlah kata pada tweet adalah
            **{filtered_data['jumlah_kata'].mean():.2f} kata**,
            sedangkan rata-rata panjang tweet mencapai
            **{filtered_data['panjang_karakter'].mean():.2f} karakter**.

            Informasi ini membantu memahami pola
            penulisan tweet dalam dataset serta melihat
            kecenderungan panjang teks yang digunakan
            pengguna dalam mengekspresikan emosi.
            """)

        st.divider()

        # A/B TESTING
        st.subheader(
            "5️⃣ A/B Testing (Happy vs Sad)"
        )

        happy = filtered_data[
            filtered_data["label"] == "happy"
        ]["jumlah_kata"]

        sad = filtered_data[
            filtered_data["label"] == "sad"
        ]["jumlah_kata"]

        if len(happy) > 0 and len(sad) > 0:

            col1, col2 = st.columns(2)

            col1.metric(
                "Rata-rata Happy",
                round(happy.mean(), 2)
            )

            col2.metric(
                "Rata-rata Sad",
                round(sad.mean(), 2)
            )

            if sad.mean() > happy.mean():

                st.info(f"""
                **Insight:**

                Hasil perbandingan menunjukkan bahwa rata-rata jumlah kata
                pada emosi **happy** sebesar **{happy.mean():.2f} kata**,
                sedangkan pada emosi **sad** sebesar
                **{sad.mean():.2f} kata**.

                Hal ini menunjukkan bahwa tweet dengan emosi **sad**
                cenderung memiliki isi yang lebih panjang dibandingkan
                tweet dengan emosi **happy**. Kondisi ini dapat
                mengindikasikan bahwa pengguna mengekspresikan emosi sedih
                dengan penjelasan yang lebih detail atau lebih panjang.
                """)

        else:
            st.warning(
                "Pilih label happy dan sad "
                "untuk melihat hasil A/B Testing."
            )

        st.divider()

        # KESIMPULAN
        st.subheader(
            "📌 Kesimpulan Dashboard"
        )

        st.write("""
        - Distribusi emosi menunjukkan adanya perbedaan jumlah tweet pada tiap kategori.
        - Tingkat keseimbangan data dapat memengaruhi performa model klasifikasi.
        - Feature engineering membantu memahami pola teks melalui jumlah kata dan panjang karakter.
        - Tweet dengan emosi sad cenderung memiliki jumlah kata lebih panjang dibandingkan happy.
        """)