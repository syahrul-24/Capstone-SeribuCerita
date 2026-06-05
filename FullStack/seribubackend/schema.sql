-- ============================================================
--  SeribuCerita — PostgreSQL Schema
--  CC26-PSU212
--
--  Kategori artikel sesuai 5 emosi model AI:
--  happy, neutral, sad, fear, anger
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL    PRIMARY KEY,
  name          TEXT         NOT NULL,
  email         TEXT         NOT NULL UNIQUE,
  password      TEXT         NOT NULL,
  bio           TEXT,
  avatar_id     TEXT         DEFAULT 'luna',
  avatar_config JSONB,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── JOURNALS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journals (
  id         BIGSERIAL    PRIMARY KEY,
  user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood       TEXT         NOT NULL DEFAULT 'neutral',
  title      TEXT         NOT NULL DEFAULT '',
  content    TEXT         NOT NULL,
  date       DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS journals_user_id_idx ON journals(user_id);

-- ─── HIGHLIGHTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS highlights (
  id            BIGSERIAL    PRIMARY KEY,
  user_id       BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chat_id       TEXT,
  article_id    TEXT,
  article_title TEXT,
  text          TEXT         NOT NULL,
  color         TEXT         NOT NULL DEFAULT '#A78BFA',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS highlights_user_id_idx ON highlights(user_id);

-- ─── SUPERADMINS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS superadmins (
  id             BIGSERIAL    PRIMARY KEY,
  username       TEXT         NOT NULL UNIQUE,
  password_hash  TEXT         NOT NULL,
  last_login     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- SUPERADMIN DEFAULT: username=superadmin, password=Admin@1234
-- Hash bcrypt dari "Admin@1234" (cost 10) — dibuat saat build
INSERT INTO superadmins (username, password_hash)
VALUES ('superadmin', '$2b$10$36P1XZI2F.D20ZVHWZvzEeZBiZ1767oER3UDduptNaSRzW6r7DNqm')
ON CONFLICT (username) DO NOTHING;

-- ─── ARTICLES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id          BIGSERIAL    PRIMARY KEY,
  title       TEXT         NOT NULL,
  excerpt     TEXT,
  category    TEXT         NOT NULL,   -- nilai: happy | neutral | sad | fear | anger
  tag         TEXT,
  tag_bg      TEXT,
  tag_color   TEXT,
  emoji       TEXT,
  read_time   TEXT,
  date        TEXT,
  author      TEXT,
  author_role TEXT,
  image       TEXT,
  hero_image  TEXT,
  content     JSONB,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── CHAT CONVERSATIONS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_conversations (
  id            TEXT         PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id       TEXT         NOT NULL,
  title         TEXT         NOT NULL DEFAULT 'Percakapan Baru',
  emotion       TEXT         NOT NULL DEFAULT 'neutral',
  message_count INTEGER      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_convos_user_id ON chat_conversations (user_id);

-- ─── CHAT MESSAGES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id               BIGSERIAL    PRIMARY KEY,
  conversation_id  TEXT         NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role             TEXT         NOT NULL CHECK (role IN ('user','bot')),
  text             TEXT         NOT NULL,
  emotion          TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_convo_id ON chat_messages (conversation_id);

-- ─── SEED ARTIKEL ─────────────────────────────────────────────────────────────
-- Kategori = nilai emosi dari model AI: happy, neutral, sad, fear, anger
-- Chatbot.jsx fetch: GET /api/articles?category={emotionLabel}&limit=3

-- Seed artikel hanya jika tabel masih kosong (idempotent)
DO $seed$
BEGIN
  IF (SELECT COUNT(*) FROM articles) = 0 THEN
    INSERT INTO articles (title, excerpt, category, tag, tag_bg, tag_color, emoji, read_time, date, author, author_role, image, hero_image, content) VALUES

-- ── HAPPY (3 artikel) ────────────────────────────────────────────────────────
(
  'Merayakan Kebahagiaan Kecil: Cara Menghargai Momen Positif',
  'Kebahagiaan sejati tidak selalu datang dari pencapaian besar. Pelajari cara mengenali dan merayakan momen-momen kecil yang bermakna setiap harinya.',
  'happy','Bahagia','rgba(187,247,208,0.50)','#166534','😊','4 menit',
  '10 Mei 2025','Dr. Amira Santoso','Psikolog Klinis',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Kita sering menunggu momen besar untuk merasa bahagia — promosi kerja, liburan panjang, atau pencapaian hidup. Padahal kebahagiaan sejati justru tersembunyi di momen kecil sehari-hari."},{"type":"quote","text":"Kebahagiaan bukan tujuan akhir perjalanan. Ia adalah cara kita berjalan setiap harinya."},{"type":"heading","text":"Latihan Syukur Harian"},{"type":"paragraph","text":"Setiap malam sebelum tidur, tuliskan tiga hal kecil yang membuatmu tersenyum hari ini. Secangkir kopi hangat, pesan dari sahabat, atau langit sore yang indah — semuanya layak dirayakan."},{"type":"heading","text":"Bagikan Kebahagiaan"},{"type":"paragraph","text":"Kebahagiaan bertambah saat dibagikan. Ceritakan momen menyenangkanmu kepada orang terdekat, atau cukup tersenyum kepada orang asing di jalan."}]'
),
(
  'Mempertahankan Energi Positif di Tengah Kesibukan',
  'Saat hidup terasa penuh tekanan, menjaga semangat dan energi positif bisa menjadi tantangan. Temukan strategi praktis untuk tetap bersemangat setiap hari.',
  'happy','Bahagia','rgba(187,247,208,0.50)','#166534','✨','5 menit',
  '02 Mei 2025','Latifah Nurazizah, S.Psi','Psikolog',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Energi positif bukan berarti selalu tersenyum atau pura-pura bahagia. Ini tentang bagaimana kita mengisi ulang diri dan memilih respons yang konstruktif terhadap kehidupan."},{"type":"quote","text":"Energimu adalah sumber daya terbatasmu. Investasikan pada hal-hal yang benar-benar bermakna."},{"type":"heading","text":"Rutinitas Pagi yang Menguatkan"},{"type":"paragraph","text":"Mulai hari dengan 10 menit gerakan tubuh ringan, minum segelas air putih, dan satu afirmasi positif. Rutinitas kecil ini menciptakan fondasi emosional yang kuat untuk melewati hari."}]'
),
(
  'Hubungan Sosial dan Kebahagiaan: Mengapa Koneksi Itu Penting',
  'Riset menunjukkan bahwa kualitas hubungan sosial adalah prediktor kebahagiaan terkuat. Pelajari cara membangun dan merawat koneksi yang bermakna.',
  'happy','Bahagia','rgba(187,247,208,0.50)','#166534','❤️','6 menit',
  '25 April 2025','Novia Lestari, M.Psi','Konselor Kesehatan Mental',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Studi Harvard selama 80 tahun menemukan bahwa kualitas hubungan — bukan kekayaan, ketenaran, atau pencapaian — adalah faktor terkuat yang menentukan kebahagiaan dan kesehatan seseorang."},{"type":"quote","text":"Kita bukan makhluk yang bisa hidup sendiri. Koneksi yang tulus adalah kebutuhan dasar jiwa."},{"type":"heading","text":"Kualitas vs Kuantitas"},{"type":"paragraph","text":"Tidak perlu punya banyak teman. Satu atau dua hubungan yang dalam dan tulus jauh lebih berharga daripada ratusan kenalan permukaan."}]'
),

-- ── NEUTRAL (3 artikel) ───────────────────────────────────────────────────────
(
  'Mindfulness Sehari-hari: Hadir Penuh di Setiap Momen',
  'Kesadaran penuh tidak membutuhkan meditasi berjam-jam. Temukan cara sederhana untuk mempraktikkan mindfulness di tengah rutinitas harian.',
  'neutral','Netral','rgba(226,232,240,0.60)','#475569','🧘','5 menit',
  '15 Mei 2025','Dr. Amira Santoso','Psikolog Klinis',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Mindfulness bukan tentang mengosongkan pikiran atau mencapai ketenangan sempurna. Ini tentang hadir sepenuhnya pada apa yang sedang terjadi, tanpa menghakimi."},{"type":"quote","text":"Satu-satunya waktu yang benar-benar kita miliki adalah saat ini. Masa lalu sudah lewat, masa depan belum tentu. Yang ada hanya sekarang."},{"type":"heading","text":"Mulai dari 3 Napas"},{"type":"paragraph","text":"Tidak perlu 30 menit meditasi. Coba jeda 3 napas dalam setiap kali kamu merasa tertekan atau tergesa-gesa. Rasakan udara masuk dan keluar. Itu sudah cukup."}]'
),
(
  'Journaling untuk Kesehatan Mental: Panduan Memulai',
  'Menulis jurnal adalah salah satu alat self-care paling powerful yang bisa dilakukan siapa saja, kapan saja, tanpa biaya.',
  'neutral','Netral','rgba(226,232,240,0.60)','#475569','📓','5 menit',
  '08 Mei 2025','Latifah Nurazizah, S.Psi','Psikolog',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Menulis tentang pikiran dan perasaan terbukti secara ilmiah dapat mengurangi stres, meningkatkan pemahaman diri, dan memperkuat sistem imun."},{"type":"quote","text":"Menulis adalah cara berpikir yang lebih pelan, lebih dalam, dan lebih jujur."},{"type":"heading","text":"Tidak Ada Aturan Baku"},{"type":"paragraph","text":"Tidak perlu tulisan yang bagus atau terstruktur. Tulis saja apa yang ada di kepala. Bisa berupa kalimat utuh, kata-kata acak, atau bahkan gambar. Yang penting adalah prosesnya, bukan hasilnya."}]'
),
(
  'Mengenal Diri Sendiri: Fondasi Kesehatan Mental yang Kokoh',
  'Self-awareness atau kesadaran diri adalah kunci untuk membuat keputusan yang lebih baik, membangun hubungan yang sehat, dan mengelola emosi dengan bijak.',
  'neutral','Netral','rgba(226,232,240,0.60)','#475569','🪞','6 menit',
  '01 Mei 2025','Novia Lestari, M.Psi','Konselor Kesehatan Mental',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Self-awareness adalah kemampuan untuk mengamati pikiran, perasaan, dan perilaku diri sendiri secara objektif. Ini adalah fondasi dari semua pertumbuhan pribadi."},{"type":"quote","text":"Mengenal diri sendiri adalah awal dari semua kebijaksanaan."},{"type":"heading","text":"Pertanyaan untuk Refleksi Diri"},{"type":"paragraph","text":"Coba tanyakan pada dirimu: Apa yang benar-benar penting bagimu? Nilai apa yang ingin kamu junjung tinggi? Situasi apa yang membuatmu merasa paling hidup? Jawaban jujur atas pertanyaan ini adalah peta menuju diri yang lebih utuh."}]'
),

-- ── SAD (3 artikel) ───────────────────────────────────────────────────────────
(
  'Menghadapi Kesedihan: Mengapa Kita Perlu Merasa Sedih',
  'Kesedihan bukan kelemahan. Ia adalah respons alami yang sehat terhadap kehilangan dan kekecewaan. Pelajari cara melewatinya dengan bijak.',
  'sad','Sedih','rgba(196,181,253,0.40)','#5b21b6','😢','6 menit',
  '12 Mei 2025','Dr. Amira Santoso','Psikolog Klinis',
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Budaya kita sering mengajarkan bahwa kita harus selalu kuat dan bahagia. Akibatnya, banyak orang merasa bersalah saat merasa sedih. Padahal, kesedihan adalah bagian penting dari pengalaman manusia."},{"type":"quote","text":"Kamu tidak bisa menyembuhkan apa yang tidak kamu izinkan untuk dirasakan."},{"type":"heading","text":"Berikan Ruang untuk Merasakan"},{"type":"paragraph","text":"Daripada melawan atau menekan kesedihan, coba berikan ia ruang. Menangis itu boleh. Duduk dengan rasa sakit itu untuk beberapa waktu, tanpa harus langsung mencari solusi."},{"type":"heading","text":"Kapan Butuh Bantuan Profesional"},{"type":"paragraph","text":"Jika kesedihan terasa sangat berat dan berlangsung lebih dari dua minggu, atau mengganggu fungsi sehari-harimu, pertimbangkan untuk berbicara dengan psikolog atau konselor."}]'
),
(
  'Pulih dari Patah Hati: Langkah-langkah Menuju Penyembuhan',
  'Kehilangan hubungan yang bermakna bisa terasa menghancurkan. Tapi penyembuhan itu nyata dan mungkin. Ini adalah panduan untuk melewatinya.',
  'sad','Sedih','rgba(196,181,253,0.40)','#5b21b6','💔','7 menit',
  '05 Mei 2025','Latifah Nurazizah, S.Psi','Psikolog',
  'https://images.unsplash.com/photo-1473081556163-2a17de81fc97?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1473081556163-2a17de81fc97?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Patah hati adalah salah satu pengalaman paling menyakitkan yang bisa dialami manusia. Riset neurosains bahkan menunjukkan bahwa rasa sakit emosional aktif di area otak yang sama dengan rasa sakit fisik."},{"type":"quote","text":"Penyembuhan tidak berjalan lurus. Ada hari-hari baik dan buruk. Yang penting adalah terus melangkah maju, satu hari dalam satu waktu."},{"type":"heading","text":"Izinkan Diri Berduka"},{"type":"paragraph","text":"Jangan terburu-buru untuk bangkit. Biarkan dirimu merasakan dan memproses rasa sakit itu. Menekannya hanya akan memperlambat penyembuhan."},{"type":"heading","text":"Bangun Kembali Dirimu"},{"type":"paragraph","text":"Gunakan waktu ini untuk kembali mengenal dirimu sendiri di luar hubungan tersebut. Apa yang kamu sukai? Apa mimpi-mimpimu? Siapa kamu ketika kamu hanya menjadi dirimu sendiri?"}]'
),
(
  'Depresi vs Kesedihan Biasa: Mengenali Perbedaannya',
  'Semua orang pernah merasa sedih. Tapi kapan perasaan itu menjadi tanda yang membutuhkan perhatian lebih? Kenali perbedaannya di sini.',
  'sad','Sedih','rgba(196,181,253,0.40)','#5b21b6','🌧️','8 menit',
  '28 April 2025','Novia Lestari, M.Psi','Konselor Kesehatan Mental',
  'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Kesedihan normal biasanya dipicu oleh peristiwa tertentu dan mereda seiring waktu. Depresi berbeda — ia bisa datang tanpa pemicu yang jelas dan bertahan berminggu-minggu atau berbulan-bulan."},{"type":"quote","text":"Depresi bukan tentang tidak bersyukur atau tidak berusaha cukup keras. Ia adalah kondisi kesehatan yang nyata dan dapat diobati."},{"type":"heading","text":"Tanda-tanda yang Perlu Diperhatikan"},{"type":"paragraph","text":"Kehilangan minat pada hal yang dulu disukai, perubahan pola tidur atau makan yang signifikan, kesulitan berkonsentrasi, perasaan tidak berharga, atau pikiran tentang kematian adalah tanda-tanda yang perlu ditindaklanjuti dengan profesional."}]'
),

-- ── FEAR (3 artikel) ──────────────────────────────────────────────────────────
(
  'Mengatasi Kecemasan: Teknik Pernapasan yang Terbukti Efektif',
  'Saat kecemasan menyerang, tubuh masuk ke mode fight-or-flight. Teknik pernapasan sederhana ini dapat membantu menenangkan sistem saraf dalam hitungan menit.',
  'fear','Takut & Cemas','rgba(253,230,138,0.50)','#92400e','😰','5 menit',
  '14 Mei 2025','Dr. Amira Santoso','Psikolog Klinis',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Kecemasan adalah respons alami otak terhadap ancaman yang dirasakan. Masalahnya, otak kita tidak selalu bisa membedakan ancaman nyata dari ancaman yang hanya kita bayangkan."},{"type":"quote","text":"Kamu tidak bisa menghentikan gelombang, tapi kamu bisa belajar berselancar di atasnya."},{"type":"heading","text":"Teknik 4-7-8"},{"type":"paragraph","text":"Hirup napas selama 4 hitungan, tahan selama 7 hitungan, hembuskan perlahan selama 8 hitungan. Ulangi 4 kali. Teknik ini mengaktifkan sistem saraf parasimpatik yang menenangkan tubuh secara alami."},{"type":"heading","text":"Box Breathing"},{"type":"paragraph","text":"Hirup 4 hitungan, tahan 4 hitungan, hembuskan 4 hitungan, tahan 4 hitungan. Teknik yang digunakan oleh Navy SEAL ini sangat efektif untuk menenangkan pikiran yang racing."}]'
),
(
  'Fobia dan Ketakutan: Memahami dan Menghadapinya',
  'Ketakutan adalah emosi yang melindungi kita. Tapi ketika ketakutan menjadi tidak proporsional dan mengganggu kehidupan, ia menjadi sesuatu yang perlu ditangani.',
  'fear','Takut & Cemas','rgba(253,230,138,0.50)','#92400e','😨','7 menit',
  '06 Mei 2025','Latifah Nurazizah, S.Psi','Psikolog',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Ketakutan adalah salah satu emosi paling primitif dan paling penting untuk kelangsungan hidup manusia. Namun ketika ketakutan menjadi tidak proporsional dengan ancaman nyata, ia berubah menjadi fobia."},{"type":"quote","text":"Keberanian bukan berarti tidak takut. Keberanian adalah mengambil tindakan meskipun kamu takut."},{"type":"heading","text":"Exposure Therapy yang Bertahap"},{"type":"paragraph","text":"Salah satu pendekatan yang terbukti efektif adalah paparan bertahap terhadap objek atau situasi yang ditakuti, dimulai dari yang paling ringan hingga yang paling menakutkan, sambil mempraktikkan teknik relaksasi."}]'
),
(
  'Kecemasan Sosial: Strategi Praktis untuk Kehidupan Sehari-hari',
  'Kecemasan sosial bisa terasa melumpuhkan, tapi dengan pendekatan yang tepat, kamu bisa membangun kepercayaan diri dan menikmati interaksi sosial.',
  'fear','Takut & Cemas','rgba(253,230,138,0.50)','#92400e','🫣','6 menit',
  '29 April 2025','Novia Lestari, M.Psi','Konselor Kesehatan Mental',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Kecemasan sosial lebih dari sekadar malu. Ini adalah ketakutan intens terhadap situasi sosial di mana kamu merasa mungkin akan dinilai, dipermalukan, atau dihakimi."},{"type":"quote","text":"Orang lain jauh lebih sibuk memikirkan diri mereka sendiri daripada memikirkan kekuranganmu."},{"type":"heading","text":"Ubah Fokus dari Diri Sendiri"},{"type":"paragraph","text":"Dalam situasi sosial, coba alihkan fokus dari apa yang orang pikirkan tentangmu ke apa yang bisa kamu pelajari tentang mereka. Ajukan pertanyaan, dengarkan dengan sungguh-sungguh, dan tunjukkan ketertarikan tulus."}]'
),

-- ── ANGER (3 artikel) ─────────────────────────────────────────────────────────
(
  'Mengelola Amarah: Dari Reaksi ke Respons yang Bijak',
  'Amarah adalah emosi yang valid. Yang penting bukan menghindarinya, tapi bagaimana kita memilih untuk meresponsnya agar tidak merusak diri dan hubungan.',
  'anger','Marah','rgba(254,202,202,0.50)','#991b1b','😠','6 menit',
  '13 Mei 2025','Dr. Amira Santoso','Psikolog Klinis',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Amarah sering dianggap sebagai emosi negatif yang harus ditekan. Padahal, amarah adalah sinyal penting yang memberi tahu kita bahwa sesuatu yang kita nilai sedang terancam atau dilanggar."},{"type":"quote","text":"Amarah adalah api yang bisa menghangatkan atau membakar. Kamu yang menentukan mana yang terjadi."},{"type":"heading","text":"Teknik STOP"},{"type":"paragraph","text":"S - Stop: berhenti sejenak. T - Take a breath: ambil napas dalam. O - Observe: amati apa yang kamu rasakan dan pikirkan. P - Proceed: lanjutkan dengan respons yang dipilih secara sadar, bukan reaksi otomatis."},{"type":"heading","text":"Identifikasi Pemicu"},{"type":"paragraph","text":"Catat situasi, pikiran, dan sensasi fisik yang muncul sebelum kamu merasa marah. Pola ini akan membantumu mengenali dan mencegah ledakan amarah sebelum terjadi."}]'
),
(
  'Amarah yang Terpendam: Mengapa Menekan Emosi Berbahaya',
  'Banyak orang berpikir bahwa memendam amarah berarti menjadi orang yang lebih baik. Nyatanya, amarah yang tidak diproses bisa berubah menjadi masalah kesehatan yang serius.',
  'anger','Marah','rgba(254,202,202,0.50)','#991b1b','😤','7 menit',
  '07 Mei 2025','Latifah Nurazizah, S.Psi','Psikolog',
  'https://images.unsplash.com/photo-1559589689-577aabd1db4f?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559589689-577aabd1db4f?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Amarah yang ditekan tidak hilang begitu saja. Ia tersimpan di dalam tubuh dan jiwa, dan seringkali muncul kembali dalam bentuk lain — sakit kepala kronis, kelelahan, depresi, atau ledakan amarah yang tidak terduga."},{"type":"quote","text":"Kamu tidak bisa menekan satu emosi tanpa meredam semua emosi lainnya, termasuk kebahagiaan."},{"type":"heading","text":"Cara Sehat Melepaskan Amarah"},{"type":"paragraph","text":"Olahraga intens, menulis surat yang tidak dikirim, berbicara dengan orang terpercaya, atau berteriak di tempat yang aman — ini adalah cara-cara sehat untuk melepaskan energi amarah tanpa menyakiti diri atau orang lain."}]'
),
(
  'Konflik dalam Hubungan: Cara Bertengkar yang Konstruktif',
  'Konflik tidak bisa dihindari dalam hubungan apapun. Yang membedakan hubungan yang sehat adalah bagaimana konflik dikelola, bukan apakah konflik terjadi atau tidak.',
  'anger','Marah','rgba(254,202,202,0.50)','#991b1b','🤝','6 menit',
  '30 April 2025','Novia Lestari, M.Psi','Konselor Kesehatan Mental',
  'https://images.unsplash.com/photo-1521316730702-829a8e3a6a6c?w=700&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1521316730702-829a8e3a6a6c?w=720&h=400&fit=crop&q=80',
  '[{"type":"paragraph","text":"Penelitian Dr. John Gottman menemukan bahwa bukan jumlah konflik yang menentukan keberhasilan hubungan, melainkan rasio interaksi positif vs negatif. Hubungan yang sehat mempertahankan rasio 5:1."},{"type":"quote","text":"Tujuan dalam konflik bukan untuk menang, tapi untuk saling memahami."},{"type":"heading","text":"Gunakan Pernyataan-I"},{"type":"paragraph","text":"Daripada menyerang (Kamu selalu..., Kamu tidak pernah...), gunakan pernyataan-I: Aku merasa... ketika... karena aku butuh... Pendekatan ini mengekspresikan kebutuhan tanpa menyudutkan pihak lain."},{"type":"heading","text":"Ambil Jeda Saat Emosi Memuncak"},{"type":"paragraph","text":"Jika diskusi mulai memanas, sepakati untuk berhenti sejenak selama 20-30 menit. Ini bukan menghindari masalah, tapi memberi sistem saraf waktu untuk kembali ke kondisi tenang sehingga diskusi bisa berlanjut lebih produktif."}]'
);
  END IF;
END
$seed$;
