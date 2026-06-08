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

/** Indikator sudut — dekorasi HUD */
function CornerBracket({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: 16, height: 16,
    borderColor: 'var(--border2)',
    borderStyle: 'solid',
    borderWidth: 0,
    ...(pos === 'tl' && { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 }),
    ...(pos === 'tr' && { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2 }),
    ...(pos === 'bl' && { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2 }),
    ...(pos === 'br' && { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 }),
  }
  return <span style={style} />
}

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
    <div className="acc-wrap">
      <div className="acc-labels">
        <span className="mono muted">AKURASI</span>
        <span className={`mono acc-value acc-value--${kategori}`}>{skor}</span>
      </div>
      <div className="acc-track">
        <div
          className={`acc-fill acc-fill--${kategori}`}
          style={{ width: `${pct}%` }}
        />
        {/* Threshold marker di 85% */}
        <div className="acc-threshold" style={{ left: '85%' }} title="Threshold 85%" />
      </div>
      <div className="acc-sub mono muted">threshold deteksi: 85%</div>
    </div>
  )
}

/** Counter badge */
function Counter({ label, value, kategori }: {
  label: string; value: number; kategori: Kategori
}) {
  return (
    <div className={`counter counter--${kategori}`}>
      <CornerBracket pos="tl" />
      <CornerBracket pos="tr" />
      <CornerBracket pos="bl" />
      <CornerBracket pos="br" />
      <span className={`counter__num counter__num--${kategori}`}>{value}</span>
      <span className="counter__label mono">{label}</span>
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
      <div className="panel-label mono muted">// LOG DETEKSI</div>
      <div className="log-scroll" ref={ref}>
        {log.length === 0 && (
          <div className="log-empty mono muted">Menunggu deteksi pertama...</div>
        )}
        {log.map((entry, i) => (
          <div key={i} className="log-entry mono">{entry}</div>
        ))}
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
      {/* ── HEADER ── */}
      <header className="header">
        <div className="header__brand">
          <div className="header__logo mono">
            <span className="logo-bracket">[</span>
            ECO
            <span className="logo-green">BIN</span>
            <span className="logo-bracket">]</span>
          </div>
          <div className="header__sub mono muted">SMKN 13 BANDUNG · AI WASTE CLASSIFIER v1.0</div>
        </div>

        <div className="header__indicators">
          <div className={`indicator ${connected ? 'indicator--on' : 'indicator--off'}`}>
            <span className="indicator__dot" />
            <span className="mono">{connected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
          <div className="indicator">
            <span className="mono muted">FLASK :5000</span>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <main className="body">

        {/* KIRI — KAMERA */}
        <section className="cam-section">
          <div className="cam-wrap">
            <CornerBracket pos="tl" />
            <CornerBracket pos="tr" />
            <CornerBracket pos="bl" />
            <CornerBracket pos="br" />

            <img
              src="/video_feed"
              alt="Camera Feed"
              className="cam-img"
            />

            {/* HUD overlay atas */}
            <div className="cam-hud cam-hud--top">
              <span className="mono muted cam-hud__text">CAM · 640×480 · LIVE</span>
              <span className={`mono cam-hud__kat cam-hud__kat--${kategori}`}>
                {LABEL_MAP[kategori]}
              </span>
            </div>

            {/* Scan line animasi */}
            <div className={`scan-line scan-line--${kategori} ${skorNum > 50 ? 'scan-line--active' : ''}`} />
          </div>

          {/* Akurasi bar di bawah kamera */}
          <AccuracyBar skor={state.skor} kategori={kategori} />
        </section>

        {/* KANAN — INFO PANEL */}
        <aside className="info-panel">

          {/* Status utama */}
          <div className={`status-card status-card--${kategori}`}>
            <CornerBracket pos="tl" />
            <CornerBracket pos="tr" />
            <CornerBracket pos="bl" />
            <CornerBracket pos="br" />

            <div className="status-card__top">
              <span className="mono muted panel-label">// STATUS</span>
              <CategoryRing kategori={kategori} />
            </div>

            <div className={`status-card__label status-card__label--${kategori}`}>
              {LABEL_MAP[kategori]}
            </div>
            <div className="status-card__desc mono muted">
              {DESC_MAP[kategori]}
            </div>
          </div>

          {/* Counter */}
          <div className="counters-wrap">
            <div className="panel-label mono muted">// TOTAL SESI INI</div>
            <div className="counters-grid">
              <Counter label="ORGANIK"   value={counts.organik}   kategori="organik" />
              <Counter label="ANORGANIK" value={counts.anorganik} kategori="anorganik" />
              <Counter label="B3"        value={counts.b3}        kategori="b3" />
            </div>
          </div>

          {/* Log */}
          <DetectionLog log={log} />

        </aside>
      </main>

      {/* ── FOOTER ── */}
      <footer className="footer mono muted">
        <span>SMKN 13 BANDUNG</span>
        <span className="footer__sep">·</span>
        <span>AI SMART WASTE BIN</span>
        <span className="footer__sep">·</span>
        <span>ESP32 VIA WIFI</span>
        <span className="footer__sep">·</span>
        <span className={connected ? 'text-green' : 'text-red'}>
          {connected ? '● CONNECTED' : '● DISCONNECTED'}
        </span>
      </footer>
    </div>
  )
}
