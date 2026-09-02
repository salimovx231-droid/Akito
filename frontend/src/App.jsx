import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  motion, AnimatePresence,
  useScroll, useTransform,
  useMotionValue, useSpring,
  useInView, useReducedMotion
} from 'framer-motion'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  Zap, Code2, Layers, Cpu, Globe, Move,
  Sparkles, MousePointer2, Waves, Repeat, Play, FileJson,
  Sword, Shield, Gem, Package, Flame, Star, ChevronRight, Terminal
} from 'lucide-react'
import './App.css'

gsap.registerPlugin(useGSAP)

/* ─────────────────────────────────────────────────────────────
   PERFORMANCE TIER HOOK
   ───────────────────────────────────────────────────────────── */
function usePerformanceTier() {
  const [tier, setTier] = useState('high')
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) { setTier('low'); return }
    let score = 0
    const cores = navigator.hardwareConcurrency || 2
    const ram   = navigator.deviceMemory || 4
    const mob   = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    if (cores >= 8) score += 3; else if (cores >= 4) score += 2
    if (ram   >= 8) score += 3; else if (ram   >= 4) score += 2
    if (mob) score -= 2
    const conn = navigator.connection
    if (conn?.effectiveType === '2g' || conn?.saveData) score -= 3
    if (score >= 6) setTier('high')
    else if (score >= 3) setTier('medium')
    else setTier('low')
  }, [prefersReduced])

  return tier
}

/* ─────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
   ───────────────────────────────────────────────────────────── */
function makeV(tier) {
  const dur  = tier === 'low' ? 0.2 : tier === 'medium' ? 0.4 : 0.6
  const ease = tier === 'low' ? 'easeOut' : [0.16, 1, 0.3, 1]
  const dy   = tier === 'low' ? 10 : 36
  const dx   = tier === 'low' ? 14 : 36

  return {
    fadeUp: {
      hidden: { opacity: 0, y: dy },
      visible: (i = 0) => ({ opacity: 1, y: 0,
        transition: { duration: dur, delay: tier === 'low' ? 0 : i * 0.1, ease } })
    },
    scaleIn: {
      hidden: { opacity: 0, scale: tier === 'low' ? 0.97 : 0.88 },
      visible: (i = 0) => ({ opacity: 1, scale: 1,
        transition: { duration: dur, delay: tier === 'low' ? 0 : i * 0.1, ease } })
    },
    slideL: {
      hidden: { opacity: 0, x: -dx },
      visible: (i = 0) => ({ opacity: 1, x: 0,
        transition: { duration: dur, delay: tier === 'low' ? 0 : i * 0.1, ease } })
    },
    slideR: {
      hidden: { opacity: 0, x: dx },
      visible: (i = 0) => ({ opacity: 1, x: 0,
        transition: { duration: dur, delay: tier === 'low' ? 0 : i * 0.1, ease } })
    },
    stagger: {
      hidden: { opacity: 0 },
      visible: { opacity: 1,
        transition: { staggerChildren: tier === 'low' ? 0.04 : 0.09,
                      delayChildren:   tier === 'low' ? 0 : 0.08 } }
    },
  }
}

/* ─────────────────────────────────────────────────────────────
   DATA — Minecraft themed content
   ───────────────────────────────────────────────────────────── */
const TOOLS = [
  { name: 'Framer Motion',  icon: <Move size={26} />, desc: 'Production-ready motion library for React with spring physics and gesture support.',
    tags: ['react', 'spring', 'gestures'],
    color: 'var(--mc-amethyst)', glow: 'rgba(155,89,245,0.3)' },
  { name: 'GSAP',           icon: <Zap size={26} />, desc: 'Ultra-high-performance JavaScript animation platform used by industry leaders.',
    tags: ['timeline', 'scroll', 'tween'],
    color: 'var(--mc-emerald)', glow: 'rgba(23,221,98,0.3)' },
  { name: 'React Spring',   icon: <Waves size={26} />, desc: 'Physics-based animation library bringing fluid and natural motion to React apps.',
    tags: ['physics', 'hooks', 'fluid'],
    color: 'var(--mc-diamond)', glow: 'rgba(79,224,255,0.3)' },
  { name: 'CSS Animations', icon: <Code2 size={26} />, desc: 'GPU-accelerated keyframes, transforms and transitions baked directly into the browser.',
    tags: ['keyframes', 'gpu', 'native'],
    color: 'var(--mc-gold)', glow: 'rgba(247,201,72,0.3)' },
  { name: 'Three.js / R3F', icon: <Globe size={26} />, desc: '3D WebGL animations and immersive scenes powered by React Three Fiber.',
    tags: ['webgl', '3d', 'canvas'],
    color: 'var(--mc-diamond)', glow: 'rgba(79,224,255,0.25)' },
  { name: 'Lottie',         icon: <FileJson size={26} />, desc: 'Render Adobe After Effects animations as scalable vector graphics in real time.',
    tags: ['svg', 'json', 'aftereffects'],
    color: 'var(--mc-lava)', glow: 'rgba(255,100,0,0.3)' },
]

const FEATURES = [
  { icon: <Cpu size={22} />,          title: 'GPU Accelerated',   desc: 'Hardware-accelerated CSS transforms for buttery 60fps animations on any device.' },
  { icon: <MousePointer2 size={22} />, title: 'Magnetic Effects',  desc: 'Interactive magnetic cursor effects that respond to hover and mouse position.' },
  { icon: <Repeat size={22} />,        title: 'Spring Physics',    desc: 'Realistic spring-based motion with mass, stiffness and damping controls.' },
  { icon: <Layers size={22} />,        title: 'Scroll Triggers',   desc: 'Animate elements as they enter the viewport using Intersection Observer.' },
  { icon: <Waves size={22} />,         title: 'Fluid Transitions', desc: 'Seamless page transitions with shared element animations and morphing.' },
  { icon: <Play size={22} />,          title: 'Gesture Driven',    desc: 'Drag, swipe, pinch and gesture-controlled animations with physics rebound.' },
]

const PROGRESS = [
  { name: 'Framer Motion',  pct: 95,  color: 'var(--mc-amethyst)' },
  { name: 'GSAP',           pct: 88,  color: 'var(--mc-emerald)' },
  { name: 'CSS Animations', pct: 100, color: 'var(--mc-diamond)' },
  { name: 'React Spring',   pct: 82,  color: 'var(--mc-gold)' },
  { name: 'WebGL / R3F',    pct: 75,  color: 'var(--mc-lava)' },
]

const STATS = [
  { num: '60',  suffix: 'fps', label: 'Smooth Rate'   },
  { num: '6',   suffix: '+',   label: 'Anim Libs'     },
  { num: '∞',   suffix: '',    label: 'Possibilities' },
  { num: '100', suffix: '%',   label: 'GPU Powered'   },
]

const TICKER = [
  '⚡ Framer Motion', '◆ GSAP Timelines', '⬡ Spring Physics', '▣ CSS Keyframes',
  '◈ WebGL 3D', '⚙ Lottie SVG', '▲ Scroll Triggers', '◉ Morphing',
  '▸ Intersection API', '● 60fps', '◐ Canvas API', '✦ Particle Systems',
]

const TERMINAL = [
  { type: 'cmd', prompt: '❯', text: 'npm install framer-motion gsap react-spring' },
  { type: 'out', text: '  ✓  added 14 packages in 2.1s', cls: 'terminal-success' },
  { type: 'cmd', prompt: '❯', text: 'npm install @gsap/react react-intersection-observer' },
  { type: 'out', text: '  ✓  added 3 packages in 0.8s',  cls: 'terminal-success' },
  { type: 'cmd', prompt: '❯', text: 'npm run dev' },
  { type: 'out', text: '  ▲  VITE v8.2.2  ready in 312ms', cls: 'terminal-output' },
  { type: 'out', text: '  ➜  Local:  http://localhost:5173/', cls: 'terminal-success' },
]

/* ─────────────────────────────────────────────────────────────
   MINECRAFT BLOCK COMPONENT
   ───────────────────────────────────────────────────────────── */
const MC_BLOCK_COLORS = {
  grass:    { top: '#5d9e30', side: '#6b7c42', dark: '#4a7a24' },
  diamond:  { top: '#4fe0ff', side: '#38c5e3', dark: '#2aaabf' },
  gold:     { top: '#f7c948', side: '#d4a832', dark: '#b08920' },
  amethyst: { top: '#9b59f5', side: '#7c42d4', dark: '#5f2fa8' },
  obsidian: { top: '#2a1a4a', side: '#1e1234', dark: '#140b24' },
}

function MCBlock({ type = 'grass', size = 32, style = {}, className = '' }) {
  const c = MC_BLOCK_COLORS[type] || MC_BLOCK_COLORS.grass
  return (
    <div
      className={className}
      style={{
        width: size, height: size,
        position: 'relative',
        imageRendering: 'pixelated',
        background: c.top,
        borderTop: `${Math.max(2, size/12)}px solid ${c.top}`,
        borderLeft: `${Math.max(2, size/12)}px solid rgba(255,255,255,0.25)`,
        borderRight: `${Math.max(2, size/12)}px solid ${c.dark}`,
        borderBottom: `${Math.max(3, size/9)}px solid ${c.dark}`,
        boxShadow: `inset 0 0 ${size/4}px rgba(0,0,0,0.2), 0 0 ${size/2}px rgba(0,0,0,0.4)`,
        flexShrink: 0,
        ...style,
      }}
    />
  )
}

/* ─────────────────────────────────────────────────────────────
   FLOATING PIXEL BLOCKS
   ───────────────────────────────────────────────────────────── */
function FloatingBlocks({ tier }) {
  const blocks = useMemo(() => {
    if (tier === 'low') return []
    const types = ['grass', 'diamond', 'gold', 'amethyst', 'obsidian']
    const count = tier === 'high' ? 10 : 5
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      type: types[Math.floor(Math.random() * types.length)],
      x: Math.random() * 90 + 5,
      y: Math.random() * 80 + 5,
      size: Math.floor(Math.random() * 3) * 8 + 16, // 16, 24, or 32
      dur: Math.random() * 8 + 7,
      delay: Math.random() * -10,
      rotate: Math.random() * 20 - 10,
    }))
  }, [tier])

  if (!blocks.length) return null

  return (
    <div className="particle-field" aria-hidden="true">
      {blocks.map(b => (
        <motion.div
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.x}vw`,
            top: `${b.y}vh`,
            opacity: 0.12,
            rotate: b.rotate,
          }}
          animate={{
            y: [0, -20, 0, 10, 0],
            rotate: [b.rotate, b.rotate + 8, b.rotate - 5, b.rotate],
            opacity: [0.1, 0.18, 0.1],
          }}
          transition={{
            duration: b.dur,
            delay: b.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <MCBlock type={b.type} size={b.size} />
        </motion.div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   NAVBAR
   ───────────────────────────────────────────────────────────── */
function Navbar({ tier }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = ['Tech Stack', 'Features', 'Demo', 'Performance', 'Get Started']

  return (
    <motion.nav
      className={`navbar${scrolled ? ' scrolled' : ''}`}
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: tier === 'low' ? 0.3 : 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="nav-logo"
        whileHover={tier !== 'low' ? { scale: 1.03 } : {}}
        whileTap={{ scale: 0.97 }}
      >
        <div className="nav-logo-icon">⛏</div>
        <span className="nav-logo-text">NovaMC</span>
      </motion.div>

      <ul className="nav-links">
        {links.map((lnk, i) => (
          <motion.li key={lnk}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            {lnk === 'Get Started'
              ? <motion.a href="#get-started" className="nav-cta"
                  whileHover={tier !== 'low' ? { scale: 1.05 } : {}}
                  whileTap={{ scale: 0.96 }}>
                  {lnk}
                </motion.a>
              : <a href={`#${lnk.toLowerCase().replace(' ', '-')}`}>{lnk}</a>
            }
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  )
}

/* ─────────────────────────────────────────────────────────────
   ANIMATED COUNTER
   ───────────────────────────────────────────────────────────── */
function Counter({ target, suffix, tier }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true })
  const isNum  = !isNaN(Number(target))
  const [val, setVal] = useState(tier === 'low' ? target : (isNum ? 0 : target))

  useEffect(() => {
    if (tier === 'low' || !inView || !isNum) { setVal(target); return }
    const end = Number(target), steps = tier === 'medium' ? 22 : 40
    let cur = 0
    const iv = setInterval(() => {
      cur += end / steps
      if (cur >= end) { setVal(end); clearInterval(iv) }
      else setVal(Math.floor(cur))
    }, tier === 'medium' ? 35 : 20)
    return () => clearInterval(iv)
  }, [inView, target, isNum, tier])

  return (
    <motion.div ref={ref} className="stat-number"
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: tier === 'low' ? 0 : 0.5 }}
    >
      {isNum ? val : target}{suffix}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   HERO SECTION
   ───────────────────────────────────────────────────────────── */
function HeroSection({ tier }) {
  const v = useMemo(() => makeV(tier), [tier])

  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 50, damping: 25 })
  const sy = useSpring(my, { stiffness: 50, damping: 25 })
  const rX = useTransform(sy, [-300, 300], [4, -4])
  const rY = useTransform(sx, [-300, 300], [-4, 4])

  const onMove = useCallback(e => {
    if (tier !== 'high') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(e.clientX - r.left - r.width / 2)
    my.set(e.clientY - r.top  - r.height / 2)
  }, [tier, mx, my])
  const onLeave = useCallback(() => { mx.set(0); my.set(0) }, [mx, my])

  return (
    <section className="hero-section" id="home" onMouseMove={onMove} onMouseLeave={onLeave}>
      {/* Decorative corner blocks */}
      {tier !== 'low' && (
        <>
          <motion.div
            style={{ position: 'absolute', top: 100, left: 60, opacity: 0.15 }}
            animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MCBlock type="grass" size={40} />
          </motion.div>
          <motion.div
            style={{ position: 'absolute', top: 140, right: 80, opacity: 0.12 }}
            animate={{ y: [0, -18, 0], rotate: [0, -6, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          >
            <MCBlock type="diamond" size={32} />
          </motion.div>
          <motion.div
            style={{ position: 'absolute', bottom: 120, left: 100, opacity: 0.1 }}
            animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <MCBlock type="gold" size={28} />
          </motion.div>
          <motion.div
            style={{ position: 'absolute', bottom: 160, right: 120, opacity: 0.12 }}
            animate={{ y: [0, -15, 0], rotate: [0, -4, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          >
            <MCBlock type="amethyst" size={36} />
          </motion.div>
        </>
      )}

      <motion.div className="hero-badge"
        variants={v.fadeUp} initial="hidden" animate="visible" custom={0}
      >
        <div className="badge-dot" />
        ⚡ ONLAYN: 1,420+ O'YINCHILAR · NOVAMC.UZ
      </motion.div>

      <motion.div style={tier === 'high' ? { rotateX: rX, rotateY: rY, transformStyle: 'preserve-3d' } : {}}>
        <motion.h1 className="hero-title" variants={v.stagger} initial="hidden" animate="visible">
          <motion.span className="title-plain" style={{ display: 'block' }} variants={v.fadeUp} custom={1}>
            NovaMc.uz — Craft Your
          </motion.span>
          <motion.span style={{ display: 'block' }} variants={v.fadeUp} custom={2} className="title-gradient">
            Minecraft Legend
          </motion.span>
        </motion.h1>
      </motion.div>

      <motion.p className="hero-subtitle"
        variants={v.fadeUp} initial="hidden" animate="visible" custom={3}
      >
        O'zbekistondagi eng zamonaviy, ultra-sifatli va yuqori unumdorlikka ega Minecraft serveri. O'z imperiyangizni quring va afsonaga aylaning!
      </motion.p>

      <motion.div className="hero-buttons" variants={v.stagger} initial="hidden" animate="visible">
        {[
          { label: 'Start Building', cls: 'btn-primary',   icon: <Sword size={17} /> },
          { label: 'View Docs',      cls: 'btn-secondary', icon: <Code2 size={17} /> },
        ].map(({ label, cls, icon }, i) => (
          <motion.button key={label} className={cls}
            variants={v.scaleIn} custom={i + 4}
            whileHover={tier !== 'low' ? { scale: 1.04 } : {}}
            whileTap={{ scale: 0.97 }}
          >
            {icon} {label}
          </motion.button>
        ))}
      </motion.div>

      <motion.div className="stats-bar"
        variants={v.fadeUp} initial="hidden" animate="visible" custom={6}
      >
        {STATS.map(s => (
          <motion.div key={s.label} className="stat-item"
            whileHover={tier !== 'low' ? { backgroundColor: 'rgba(23,221,98,0.04)' } : {}}
          >
            <Counter target={s.num} suffix={s.suffix} tier={tier} />
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   TICKER
   ───────────────────────────────────────────────────────────── */
function Ticker() {
  const doubled = [...TICKER, ...TICKER]
  return (
    <div className="ticker-wrapper" aria-hidden="true">
      <div className="ticker-track">
        {doubled.map((t, i) => (
          <div key={i} className="ticker-item">{t}</div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   TOOL CARD
   ───────────────────────────────────────────────────────────── */
function ToolCard({ tool, index, tier }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div ref={ref}
      className="tool-card"
      style={{ '--card-color': tool.color, '--card-glow-color': tool.glow }}
      initial={{ opacity: 0, y: tier === 'low' ? 8 : 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: tier === 'low' ? 0.25 : 0.55, delay: tier === 'low' ? 0 : index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      whileHover={tier !== 'low' ? { scale: 1.015 } : {}}
    >
      {/* Shimmer element */}
      <div className="tool-card-shimmer" />

      <motion.div className="tool-icon-wrap" style={{ color: tool.color }}>
        {tool.icon}
      </motion.div>

      <h3 className="tool-card-title">{tool.name}</h3>
      <p  className="tool-card-desc">{tool.desc}</p>

      <div className="tool-tags">
        {tool.tags.map(tg => (
          <span key={tg} className="tag">{tg}</span>
        ))}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   TOOLS SECTION
   ───────────────────────────────────────────────────────────── */
function ToolsSection({ tier }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const v      = useMemo(() => makeV(tier), [tier])

  return (
    <section className="section" id="tech-stack" ref={ref}>
      <motion.div className="section-header"
        initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={v.stagger}
      >
        <motion.span className="section-eyebrow" variants={v.fadeUp}>⬡ Ecosystem</motion.span>
        <motion.h2 className="section-title" variants={v.fadeUp} custom={1}>
          The Animation Stack
        </motion.h2>
        <motion.p className="section-desc" variants={v.fadeUp} custom={2}>
          Everything you need to create performant, 60fps animations for the modern web.
        </motion.p>
      </motion.div>

      <div className="tools-grid">
        {TOOLS.map((t, i) => <ToolCard key={t.name} tool={t} index={i} tier={tier} />)}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   TERMINAL SECTION
   ───────────────────────────────────────────────────────────── */
const CODE_EXAMPLE = `<span class="cm">// Framer Motion + React ⚡</span>
<span class="kw">import</span> { <span class="cls">motion</span>, <span class="fn">useScroll</span> } <span class="kw">from</span> <span class="str">'framer-motion'</span>

<span class="kw">export function</span> <span class="fn">AnimatedCard</span>() {
  <span class="kw">const</span> { <span class="fn">scrollY</span> } <span class="op">=</span> <span class="fn">useScroll</span>()
  <span class="kw">const</span> y <span class="op">=</span> <span class="fn">useTransform</span>(scrollY, [<span class="num">0</span>, <span class="num">500</span>], [<span class="num">0</span>, <span class="num">-100</span>])

  <span class="kw">return</span> (
    <span class="op">&lt;</span><span class="cls">motion.div</span>
      style<span class="op">={{</span> y <span class="op">}}</span>
      initial<span class="op">={{</span> opacity:<span class="num">0</span>, scale:<span class="num">0.9</span> <span class="op">}}</span>
      animate<span class="op">={{</span> opacity:<span class="num">1</span>, scale:<span class="num">1</span> <span class="op">}}</span>
      transition<span class="op">={{</span> type:<span class="str">'spring'</span>, damping:<span class="num">20</span> <span class="op">}}</span>
      whileHover<span class="op">={{</span> y:<span class="num">-10</span> <span class="op">}}</span>
    <span class="op">/&gt;</span>
  )
}`

function TerminalSection({ tier }) {
  const [lines, setLines] = useState([])
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const delay  = tier === 'low' ? 0 : tier === 'medium' ? 280 : 380

  useEffect(() => {
    if (!inView) return
    if (tier === 'low') { setLines(TERMINAL); return }
    let i = 0
    const iv = setInterval(() => {
      if (i < TERMINAL.length) { setLines(prev => [...prev, TERMINAL[i]]); i++ }
      else clearInterval(iv)
    }, delay)
    return () => clearInterval(iv)
  }, [inView, delay, tier])

  return (
    <section className="section" id="demo">
      <div className="section-header" ref={ref}>
        <motion.span className="section-eyebrow"
          initial={{ opacity: 0, y: 14 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >◈ Developer Experience</motion.span>
        <motion.h2 className="section-title"
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >Built for Developers</motion.h2>
      </div>

      <div className="demo-grid">
        <motion.div className="terminal-section"
          initial={{ opacity: 0, y: tier === 'low' ? 0 : 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="terminal-header">
            <div className="terminal-dots">
              <div className="terminal-dot red"    />
              <div className="terminal-dot yellow" />
              <div className="terminal-dot green"  />
            </div>
            <span className="terminal-title">bash — novamc ~/project</span>
            <div style={{ width: 56 }} />
          </div>
          <div className="terminal-body">
            <AnimatePresence>
              {lines.map((ln, i) => (
                <motion.div key={i} className="terminal-line"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {ln.type === 'cmd' && <>
                    <span className="terminal-prompt">{ln.prompt}</span>
                    <span className="terminal-command">{ln.text}</span>
                  </>}
                  {ln.type === 'out' && <span className={ln.cls}>{ln.text}</span>}
                </motion.div>
              ))}
            </AnimatePresence>
            {/* Blinking cursor */}
            <motion.div
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}
              animate={{ opacity: [1, 1, 0, 0] }}
              transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
            >
              <span className="terminal-prompt">❯</span>
              <span style={{ color: 'var(--mc-emerald)', fontFamily: 'var(--font-mono)' }}>█</span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div className="code-block"
          initial={{ opacity: 0, y: tier === 'low' ? 0 : 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="code-header">
            <span className="code-lang">AnimatedCard.jsx</span>
            <button className="code-copy-btn">Copy</button>
          </div>
          <div className="code-content" dangerouslySetInnerHTML={{ __html: CODE_EXAMPLE }} />
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   FEATURES SECTION
   ───────────────────────────────────────────────────────────── */
function FeaturesSection({ tier }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const v      = useMemo(() => makeV(tier), [tier])

  return (
    <section className="section" id="features" ref={ref}>
      <motion.div className="section-header"
        initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={v.stagger}
      >
        <motion.span className="section-eyebrow" variants={v.fadeUp}>◆ Capabilities</motion.span>
        <motion.h2 className="section-title" variants={v.fadeUp} custom={1}>
          Powerful Features
        </motion.h2>
      </motion.div>

      <div className="feat-grid">
        {FEATURES.map((f, i) => (
          <motion.div key={f.title} className="feature-item"
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p className="text-muted">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   PERFORMANCE SECTION
   ───────────────────────────────────────────────────────────── */
function PerformanceSection({ tier }) {
  const ref      = useRef(null)
  const inView   = useInView(ref, { once: true, margin: '-80px' })
  const v        = useMemo(() => makeV(tier), [tier])
  const fillRefs = useRef([])

  useEffect(() => {
    if (!inView) return
    PROGRESS.forEach((item, i) => {
      const el = fillRefs.current[i]
      if (!el) return
      setTimeout(() => { el.style.transform = `scaleX(${item.pct / 100})` }, i * 160 + 300)
    })
  }, [inView])

  return (
    <section className="section" id="performance" ref={ref}>
      <div className="perf-grid">
        <motion.div
          initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={v.stagger}
        >
          <motion.span className="section-eyebrow" variants={v.slideL}>▲ Mastery</motion.span>
          <motion.h2 className="section-title" variants={v.slideL} custom={1}
            style={{ textAlign: 'left', marginBottom: 16 }}>
            Level Up Your<br />Animation Skills
          </motion.h2>
          <motion.p variants={v.slideL} custom={2}
            style={{ marginBottom: 36, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Track your progress as you master the most powerful animation libraries in the React ecosystem. Guaranteed 60fps performance across all devices.
          </motion.p>
          <motion.div variants={v.slideL} custom={3}>
            <motion.button className="btn-secondary"
              style={{ padding: '12px 24px', fontSize: 13 }}
              whileHover={tier !== 'low' ? { scale: 1.04 } : {}}
              whileTap={{ scale: 0.97 }}
            >
              <ChevronRight size={16} /> View Curriculum
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div className="progress-section"
          initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={v.stagger}
        >
          {PROGRESS.map((item, i) => (
            <motion.div key={item.name} className="progress-item" variants={v.slideR} custom={i}>
              <div className="progress-label">
                <span className="progress-name">{item.name}</span>
                <span className="progress-pct">{item.pct}%</span>
              </div>
              <div className="progress-track">
                <div
                  ref={el => fillRefs.current[i] = el}
                  className="progress-fill"
                  style={{ background: item.color }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   CTA SECTION
   ───────────────────────────────────────────────────────────── */
function CTASection({ tier }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section" id="get-started" ref={ref}>
      <motion.div className="spotlight-card"
        initial={{ opacity: 0, y: 36 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="spotlight-glow" />

        {/* Decorative blocks inside CTA */}
        {tier !== 'low' && (
          <>
            <motion.div style={{ position: 'absolute', top: 24, right: 48, opacity: 0.2 }}
              animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}>
              <MCBlock type="diamond" size={24} />
            </motion.div>
            <motion.div style={{ position: 'absolute', bottom: 28, left: 52, opacity: 0.15 }}
              animate={{ y: [0, -6, 0], rotate: [0, -4, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: 1.5 }}>
              <MCBlock type="gold" size={20} />
            </motion.div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, color: 'var(--mc-emerald)', position: 'relative', zIndex: 1 }}>
          <motion.div
            animate={tier !== 'low' ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sword size={52} />
          </motion.div>
        </div>

        <h2 className="section-title" style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
          Ready to Build?
        </h2>
        <p style={{ fontSize: 16, marginBottom: 44, color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
          Join thousands of developers crafting fluid, interactive experiences with our animation stack.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <motion.button className="btn-primary"
            whileHover={tier !== 'low' ? { scale: 1.05 } : {}}
            whileTap={{ scale: 0.97 }}
          >
            <Sword size={16} /> Get Started
          </motion.button>
          <motion.button className="btn-secondary"
            whileHover={tier !== 'low' ? { scale: 1.05 } : {}}
            whileTap={{ scale: 0.97 }}
          >
            <Code2 size={16} /> Read Docs
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-logo">
        <MCBlock type="grass" size={22} />
        NovaMC
      </div>

      <ul className="footer-links">
        {['Docs', 'GitHub', 'Discord', 'Blog'].map(l => (
          <li key={l}><a href="#">{l}</a></li>
        ))}
      </ul>

      <p className="footer-copy">
        © {new Date().getFullYear()} NovaMC Platform. All rights reserved.
      </p>
    </footer>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN APP
   ───────────────────────────────────────────────────────────── */
export default function App() {
  const tier = usePerformanceTier()

  useEffect(() => {
    document.body.className = `tier-${tier}`
  }, [tier])

  return (
    <>
      {tier !== 'low' && (
        <>
          <div className="ambient-glow top-left" />
          <div className="ambient-glow bottom-right" />
        </>
      )}

      <FloatingBlocks tier={tier} />
      <Navbar tier={tier} />

      <main>
        <HeroSection tier={tier} />
        <Ticker />
        <ToolsSection tier={tier} />
        <TerminalSection tier={tier} />
        <FeaturesSection tier={tier} />
        <PerformanceSection tier={tier} />
        <CTASection tier={tier} />
      </main>

      <Footer />
    </>
  )
}
