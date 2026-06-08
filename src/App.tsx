import { useState, useEffect, useRef } from 'react'
import './App.css'

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
interface EcobinState {
  objek: string
  skor: string
  status: string
}

type Kategori = 'organik' | 'anorganik' | 'b3' | 'background' | 'standby'
type Page = 'dashboard' | 'about'

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
function getKategori(objek: string): Kategori {
  const up = objek.toUpperCase()
  if (up.includes('ORGANIK') && !up.includes('ANORGANIK')) return 'organik'
  if (up.includes('ANORGANIK')) return 'anorganik'
  if (up.includes('B3'))        return 'b3'
  if (up.includes('BACKGROUND')) return 'background'
  return 'standby'
}

function getSkorNumber(skor: string): number {
  return parseFloat(skor.replace('%', '')) || 0
}

const LABEL_MAP: Record<Kategori, string> = {
  organik:    'ORGANIK',
  anorganik:  'ANORGANIK',
  b3:         'B3 / LIMBAH',
  background: 'BACKGROUND',
  standby:    'STANDBY',
}

const ICON_MAP: Record<Kategori, string> = {
  organik:    '🌿',
  anorganik:  '♻️',
  b3:         '⚠️',
  background: '○',
  standby:    '◌',
}

const DESC_MAP: Record<Kategori, string> = {
  organik:    'Sampah dapat terurai secara alami',
  anorganik:  'Sampah tidak mudah terurai',
  b3:         'Bahan berbahaya & beracun',
  background: 'Tidak ada objek terdeteksi',
  standby:    'Arahkan kamera ke sampah',
}

// ═══════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════

/** Ring animasi kategori */
function CategoryRing({ kategori }: { kategori: Kategori }) {
  return (
    <div className={`cat-ring cat-ring--${kategori}`}>
      <div className="cat-ring__icon">{ICON_MAP[kategori]}</div>
      <div className={`cat-ring__pulse cat-ring__pulse--${kategori}`} />
    </div>
  )
}

/** Bar akurasi */
function AccuracyBar({ skor, kategori }: { skor: string; kategori: Kategori }) {
  const pct = getSkorNumber(skor)
  return (
    <div className="acc-card">
      <div className="acc-labels">
        <span className="acc-label-text">Akurasi Deteksi</span>
        <span className={`mono acc-value acc-value--${kategori}`} style={{ fontWeight: 700 }}>{skor}</span>
      </div>
      <div className="acc-track">
        <div
          className={`acc-fill acc-fill--${kategori}`}
          style={{ width: `${pct}%` }}
        />
        <div className="acc-threshold" style={{ left: '85%' }} title="Threshold 85%" />
      </div>
      <div className="acc-sub">Threshold deteksi: 85%</div>
    </div>
  )
}

/** Counter badge */
function Counter({ label, value, kategori }: {
  label: string; value: number; kategori: Kategori
}) {
  return (
    <div className={`counter counter--${kategori}`}>
      <span className={`counter__num counter__num--${kategori}`}>{value}</span>
      <span className="counter__label">{label}</span>
    </div>
  )
}

/** Ticker log deteksi */
function DetectionLog({ log }: { log: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [log])

  return (
    <div className="log-panel">
      <div className="section-title">📋 Log Deteksi</div>
      <div className="log-scroll" ref={ref}>
        {log.length === 0 && (
          <div className="log-empty">Menunggu deteksi pertama...</div>
        )}
        {log.map((entry, i) => (
          <div key={i} className="log-entry">{entry}</div>
        ))}
      </div>
    </div>
  )
}

/** About / Tentang EcoBin page */
function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <img src="/logo-smkn13.png" alt="Logo SMKN 13 Bandung" className="about-hero__logo" />
        <h1 className="about-hero__title">Smart EcoBin</h1>
        <p className="about-hero__desc">
          Smart EcoBin adalah tempat sampah cerdas yang menggunakan teknologi 
          <strong> Artificial Intelligence (AI) </strong> untuk mengklasifikasikan jenis sampah 
          secara otomatis. Dikembangkan oleh siswa-siswi SMKN 13 Bandung sebagai 
          solusi inovatif untuk pengelolaan sampah yang lebih baik.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <span className="about-card__icon">🤖</span>
          <h3 className="about-card__title">AI Classification</h3>
          <p className="about-card__text">
            Menggunakan model machine learning yang dilatih untuk mengenali 
            dan mengklasifikasikan sampah ke dalam kategori Organik, Anorganik, dan B3 
            secara real-time melalui kamera.
          </p>
        </div>

        <div className="about-card">
          <span className="about-card__icon">📷</span>
          <h3 className="about-card__title">Computer Vision</h3>
          <p className="about-card__text">
            Memanfaatkan computer vision untuk mendeteksi objek sampah yang diarahkan 
            ke kamera, kemudian menganalisis dan menentukan jenis sampahnya 
            dengan tingkat akurasi tinggi.
          </p>
        </div>

        <div className="about-card">
          <span className="about-card__icon">⚡</span>
          <h3 className="about-card__title">ESP32 IoT</h3>
          <p className="about-card__text">
            Terhubung dengan mikrokontroler ESP32 melalui WiFi untuk mengontrol 
            mekanisme pembukaan tutup tempat sampah sesuai kategori yang terdeteksi 
            secara otomatis.
          </p>
        </div>

        <div className="about-card">
          <span className="about-card__icon">🌱</span>
          <h3 className="about-card__title">Eco-Friendly</h3>
          <p className="about-card__text">
            Mendukung program pengelolaan sampah berkelanjutan dengan membantu 
            pemilahan sampah yang tepat, mengurangi kontaminasi, dan meningkatkan 
            efisiensi daur ulang.
          </p>
        </div>

        <div className="about-card">
          <span className="about-card__icon">📊</span>
          <h3 className="about-card__title">Dashboard Real-time</h3>
          <p className="about-card__text">
            Menyediakan dashboard monitoring real-time yang menampilkan feed kamera, 
            hasil klasifikasi, tingkat akurasi, dan statistik jumlah sampah 
            yang telah terdeteksi.
          </p>
        </div>

        <div className="about-card">
          <span className="about-card__icon">🏫</span>
          <h3 className="about-card__title">SMKN 13 Bandung</h3>
          <p className="about-card__text">
            Proyek ini dikembangkan sebagai bagian dari pembelajaran dan inovasi 
            di jurusan TKJ & RPL, SMKN 13 Bandung, menggabungkan ilmu teknologi 
            dengan kepedulian lingkungan.
          </p>
        </div>
      </div>

      <div className="about-team">
        <h3 className="about-team__title">🎓 Tentang Proyek</h3>
        <p className="about-team__text">
          Smart EcoBin merupakan proyek inovasi siswa SMKN 13 Bandung yang bertujuan 
          untuk membantu pengelolaan sampah secara cerdas. Sistem ini menggunakan 
          Flask sebagai backend, React untuk dashboard, dan ESP32 sebagai pengontrol 
          perangkat keras.<br />
          Dibuat dengan ❤️ oleh siswa-siswi SMKN 13 Bandung.
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [state, setState] = useState<EcobinState>({
    objek: '-', skor: '0%', status: 'Menunggu sistem...'
  })
  const [counts, setCounts] = useState({ organik: 0, anorganik: 0, b3: 0 })
  const [log, setLog] = useState<string[]>([])
  const [connected, setConnected] = useState(false)
  const [tick, setTick] = useState(0)
  const [page, setPage] = useState<Page>('dashboard')
  const prevObjek = useRef('-')

  // Poll /state tiap 400ms
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch('/state')
        const data: EcobinState = await res.json()
        setState(data)
        setConnected(true)
        setTick(t => t + 1)

        // Tambah ke log & counter jika kelas berubah
        const kat = getKategori(data.objek)
        if (
          data.objek !== prevObjek.current &&
          data.objek !== '-' &&
          kat !== 'standby' &&
          kat !== 'background'
        ) {
          const now = new Date().toLocaleTimeString('id-ID')
          setLog(l => [...l.slice(-49), `[${now}] ${LABEL_MAP[kat]} — ${data.skor}`])
          setCounts(c => ({
            ...c,
            [kat]: (c[kat as keyof typeof c] ?? 0) + 1,
          }))
          prevObjek.current = data.objek
        }
        if (kat === 'standby' || kat === 'background') {
          prevObjek.current = data.objek
        }
      } catch {
        setConnected(false)
      }
    }, 400)
    return () => clearInterval(id)
  }, [])

  const kategori = getKategori(state.objek)
  const skorNum  = getSkorNumber(state.skor)

  return (
    <div className="layout">
      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="navbar__left">
          <img src="/logo-smkn13.png" alt="Logo SMKN 13" className="navbar__logo-img" />
          <div className="navbar__brand">
            <div className="navbar__title">
              Smart <span className="navbar__title-accent">EcoBin</span>
            </div>
            <div className="navbar__subtitle">SMKN 13 Bandung</div>
          </div>
        </div>

        <div className="navbar__nav">
          <button
            className={`navbar__link ${page === 'dashboard' ? 'navbar__link--active' : ''}`}
            onClick={() => setPage('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`navbar__link ${page === 'about' ? 'navbar__link--active' : ''}`}
            onClick={() => setPage('about')}
          >
            Tentang EcoBin
          </button>
        </div>

        <div className="navbar__right">
          <div className={`navbar__status ${connected ? 'navbar__status--on' : 'navbar__status--off'}`}>
            <span className="navbar__status-dot" />
            <span>{connected ? 'Connected' : 'Offline'}</span>
          </div>
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      {page === 'about' ? (
        <AboutPage />
      ) : (
        <main className="dashboard">
          <div className="dashboard__grid">

            {/* KIRI — KAMERA */}
            <section className="cam-section">
              <div className="cam-card">
                <div className="cam-card__header">
                  <div className="cam-card__title">
                    <span className={`cam-card__title-dot ${connected ? 'cam-card__title-dot--live' : ''}`} />
                    Live Camera Feed
                  </div>
                  <span className={`cam-card__badge cam-card__badge--${kategori}`}>
                    {LABEL_MAP[kategori]}
                  </span>
                </div>
                <div className="cam-card__feed">
                  <img
                    src="/video_feed"
                    alt="Camera Feed"
                    className="cam-img"
                  />
                  {/* Scan line animasi */}
                  <div className={`scan-line scan-line--${kategori} ${skorNum > 50 ? 'scan-line--active' : ''}`} />
                </div>
              </div>

              {/* Akurasi bar di bawah kamera */}
              <AccuracyBar skor={state.skor} kategori={kategori} />
            </section>

            {/* KANAN — INFO PANEL */}
            <aside className="info-panel">

              {/* Status utama */}
              <div className={`status-card status-card--${kategori}`}>
                <div className="status-card__top">
                  <span className="section-title">📌 Status Klasifikasi</span>
                  <CategoryRing kategori={kategori} />
                </div>

                <div className={`status-card__label status-card__label--${kategori}`}>
                  {LABEL_MAP[kategori]}
                </div>
                <div className="status-card__desc">
                  {DESC_MAP[kategori]}
                </div>
              </div>

              {/* Counter */}
              <div className="counters-wrap">
                <div className="section-title">📈 Total Sesi Ini</div>
                <div className="counters-grid">
                  <Counter label="ORGANIK"   value={counts.organik}   kategori="organik" />
                  <Counter label="ANORGANIK" value={counts.anorganik} kategori="anorganik" />
                  <Counter label="B3"        value={counts.b3}        kategori="b3" />
                </div>
              </div>

              {/* Log */}
              <DetectionLog log={log} />

            </aside>
          </div>
        </main>
      )}

      {/* ── FOOTER ── */}
      <footer className="footer">
        <span>SMKN 13 Bandung</span>
        <span className="footer__sep">·</span>
        <span>AI Smart Waste Bin</span>
        <span className="footer__sep">·</span>
        <span>ESP32 via WiFi</span>
        <span className="footer__sep">·</span>
        <span style={{ color: connected ? 'var(--success)' : 'var(--danger)' }}>
          {connected ? '● Connected' : '● Disconnected'}
        </span>
      </footer>
    </div>
  )
}
