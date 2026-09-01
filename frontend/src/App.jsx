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
  Sparkles, MousePointer2, Waves, Repeat, Play, FileJson
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
  const dur  = tier === 'low' ? 0.25 : tier === 'medium' ? 0.45 : 0.65
  const ease = tier === 'low' ? 'easeOut' : [0.16, 1, 0.3, 1] // sleek easeOutQuint
  const dy   = tier === 'low' ? 12 : 40
  const dx   = tier === 'low' ? 16 : 40

  return {
    fadeUp: {
      hidden: { opacity: 0, y: dy },
      visible: (i = 0) => ({ opacity: 1, y: 0,
        transition: { duration: dur, delay: tier === 'low' ? 0 : i * 0.1, ease } })
    },
    scaleIn: {
      hidden: { opacity: 0, scale: tier === 'low' ? 0.96 : 0.9 },
      visible: (i = 0) => ({ opacity: 1, scale: 1,
        transition: { duration: dur,
                      delay: tier === 'low' ? 0 : i * 0.1,
                      ease } })
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
        transition: { staggerChildren: tier === 'low' ? 0.05 : 0.1,
                      delayChildren:   tier === 'low' ? 0 : 0.1 } }
    },
  }
}

/* ─────────────────────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────────────────────── */
const TOOLS = [
  { name: 'Framer Motion',  icon: <Move size={28} />, desc: 'Production-ready motion library for React with spring physics and gesture support.',
    tags: ['react', 'animation', 'spring'], 
    color: 'var(--accent-purple)', glow: 'rgba(168,85,247,0.4)' },
  { name: 'GSAP',           icon: <Zap size={28} />, desc: 'Ultra-high-performance JavaScript animation platform used by industry leaders.',
    tags: ['gsap', 'timeline', 'scroll'],  
    color: 'var(--accent-emerald)', glow: 'rgba(16,185,129,0.4)' },
  { name: 'React Spring',   icon: <Waves size={28} />, desc: 'Physics-based animation library bringing fluid and natural motion to React apps.',
    tags: ['physics', 'hooks', 'interpolate'], 
    color: 'var(--accent-cyan)', glow: 'rgba(6,182,212,0.4)' },
  { name: 'CSS Animations', icon: <Code2 size={28} />, desc: 'GPU-accelerated keyframes, transforms and transitions baked directly into the browser.',
    tags: ['keyframes', 'gpu', 'native'],  
    color: 'var(--accent-amber)', glow: 'rgba(245,158,11,0.4)' },
  { name: 'Three.js / R3F', icon: <Globe size={28} />, desc: '3D WebGL animations and immersive scenes powered by React Three Fiber.',
    tags: ['webgl', '3d', 'canvas'],       
    color: 'var(--accent-blue)', glow: 'rgba(59,130,246,0.4)' },
  { name: 'Lottie',         icon: <FileJson size={28} />, desc: 'Render Adobe After Effects animations as scalable vector graphics in real time.',
    tags: ['svg', 'json', 'aftereffects'], 
    color: 'var(--accent-rose)', glow: 'rgba(244,63,94,0.4)' },
]

const FEATURES = [
  { icon: <Cpu size={24} />, title:'GPU Accelerated',   desc:'Hardware-accelerated CSS transforms for buttery 60fps animations on any device.' },
  { icon: <MousePointer2 size={24} />, title:'Magnetic Effects',  desc:'Interactive magnetic cursor effects that respond to hover and mouse position.' },
  { icon: <Repeat size={24} />, title:'Spring Physics',    desc:'Realistic spring-based motion with mass, stiffness and damping controls.' },
  { icon: <Layers size={24} />, title:'Scroll Triggers',   desc:'Animate elements as they enter the viewport using Intersection Observer.' },
  { icon: <Waves size={24} />, title:'Fluid Transitions', desc:'Seamless page transitions with shared element animations and morphing.' },
  { icon: <Play size={24} />, title:'Gesture Driven',    desc:'Drag, swipe, pinch and gesture-controlled animations with physics rebound.' },
]

const PROGRESS = [
  { name:'Framer Motion',  pct:95, color:'var(--accent-purple)' },
  { name:'GSAP',           pct:88, color:'var(--accent-emerald)' },
  { name:'CSS Animations', pct:100,color:'var(--accent-cyan)' },
  { name:'React Spring',   pct:82, color:'var(--accent-blue)' },
  { name:'WebGL / R3F',    pct:75, color:'var(--accent-rose)' },
]

const STATS = [
  { num:'60', suffix:'fps', label:'Smooth Rate' },
  { num:'6',  suffix:'+',  label:'Anim Libs'   },
  { num:'∞',  suffix:'',   label:'Possibilities'},
  { num:'100',suffix:'%',  label:'GPU Powered'  },
]

const TICKER = [
  '✦ Framer Motion', '✦ GSAP Timelines', '✦ Spring Physics', '✦ CSS Keyframes',
  '✦ WebGL 3D', '✦ Lottie SVG', '✦ Scroll Triggers', '✦ Morphing',
  '✦ IntersectionObserver', '✦ 60fps', '✦ Canvas API', '✦ Particle Systems',
]

const TERMINAL = [
  { type:'cmd', prompt:'~', text:'npm install framer-motion gsap react-spring' },
  { type:'out', text:'added 14 packages ✓', cls:'terminal-success' },
  { type:'cmd', prompt:'~', text:'npm install @gsap/react react-intersection-observer' },
  { type:'out', text:'added 3 packages ✓',  cls:'terminal-success' },
  { type:'cmd', prompt:'~', text:'npm run dev' },
  { type:'out', text:'  VITE v8.2.2  ready in 312 ms', cls:'terminal-output' },
  { type:'out', text:'  ➜  Local: http://localhost:5173/', cls:'terminal-success' },
]

/* ─────────────────────────────────────────────────────────────
   AMBIENT ORBS
   ───────────────────────────────────────────────────────────── */
function AmbientOrbs({ tier }) {
  const count = tier === 'high' ? 12 : tier === 'medium' ? 6 : 0
  const orbs = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 150 + 50,
    dur: Math.random() * 20 + 15,
    delay: Math.random() * -20,
    color: ['#06b6d4', '#a855f7', '#10b981', '#f43f5e'][Math.floor(Math.random() * 4)]
  })), [count])

  if (!count) return null

  return (
    <div className="particle-field">
      {orbs.map(o => (
        <motion.div
          key={o.id}
          className="glow-orb"
          style={{ 
            left: `${o.x}vw`, 
            top: `${o.y}vh`, 
            width: o.size, 
            height: o.size, 
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)` 
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: o.dur,
            delay: o.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   NAVBAR
   ───────────────────────────────────────────────────────────── */
function Navbar({ tier }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = ['Tech Stack','Features','Demo','Performance','Get Started']

  return (
    <motion.nav
      className={`navbar${scrolled ? ' scrolled' : ''}`}
      initial={{ y:-70, opacity:0 }}
      animate={{ y:0, opacity:1 }}
      transition={{ duration: tier==='low'?0.3:0.65, ease:[0.16,1,0.3,1] }}
    >
      <motion.div
        className="nav-logo"
        whileHover={tier!=='low'?{ scale:1.02 }:{}}
        whileTap={{ scale:0.98 }}
      >
        <Sparkles size={24} className="logo-accent" />
        NOVA
      </motion.div>

      <ul className="nav-links">
        {links.map((lnk, i) => (
          <motion.li key={lnk}
            initial={{ opacity:0, y:-10 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: 0.1 + i*0.05 }}
          >
            {lnk === 'Get Started'
              ? <motion.a href="#get-started" className="nav-cta"
                  whileHover={tier!=='low'?{ scale:1.05 }:{}} whileTap={{ scale:0.96 }}>
                  {lnk}
                </motion.a>
              : <a href={`#${lnk.toLowerCase().replace(' ','-')}`}>{lnk}</a>
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
  const inView = useInView(ref, { once:true })
  const isNum  = !isNaN(Number(target))
  const [val, setVal] = useState(tier==='low' ? target : (isNum?0:target))

  useEffect(() => {
    if (tier==='low' || !inView || !isNum) { setVal(target); return }
    const end = Number(target), steps = tier==='medium'?22:40
    let cur = 0
    const iv = setInterval(() => {
      cur += end / steps
      if (cur >= end) { setVal(end); clearInterval(iv) }
      else setVal(Math.floor(cur))
    }, tier==='medium'?35:20)
    return () => clearInterval(iv)
  }, [inView, target, isNum, tier])

  return (
    <motion.div ref={ref} className="stat-number"
      animate={inView?{ opacity:1, y:0 }:{ opacity:0, y:14 }}
      transition={{ duration: tier==='low'?0:0.5 }}
    >
      {isNum ? val : target}{suffix}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   HERO
   ───────────────────────────────────────────────────────────── */
function HeroSection({ tier }) {
  const v = useMemo(() => makeV(tier), [tier])

  // Parallax / tilt
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx,{ stiffness:55, damping:28 })
  const sy = useSpring(my,{ stiffness:55, damping:28 })
  const rX = useTransform(sy, [-300,300], [5,-5])
  const rY = useTransform(sx, [-300,300], [-5,5])

  const onMove = useCallback(e => {
    if (tier !== 'high') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(e.clientX - r.left - r.width/2)
    my.set(e.clientY - r.top  - r.height/2)
  }, [tier, mx, my])
  const onLeave = useCallback(() => { mx.set(0); my.set(0) }, [mx, my])

  return (
    <section className="hero-section" onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div className="hero-badge"
        variants={v.fadeUp} initial="hidden" animate="visible" custom={0}
      >
        <div className="badge-dot" />
        Framer Motion + GSAP + CSS
      </motion.div>

      <motion.div style={tier==='high' ? { rotateX:rX, rotateY:rY, transformStyle:'preserve-3d' } : {}}>
        <motion.h1 className="hero-title" variants={v.stagger} initial="hidden" animate="visible">
          <motion.span style={{display:'block'}} variants={v.fadeUp} custom={1}>Interactive &</motion.span>
          <motion.span style={{display:'block'}} variants={v.fadeUp} custom={2} className="title-gradient">
            Fluid Experiences
          </motion.span>
        </motion.h1>
      </motion.div>

      <motion.p className="hero-subtitle"
        variants={v.fadeUp} initial="hidden" animate="visible" custom={3}
      >
        Elevate your UI with professional-grade animations using Framer Motion, GSAP, and React Spring. Seamless, performant, and completely breathtaking.
      </motion.p>

      <motion.div className="hero-buttons" variants={v.stagger} initial="hidden" animate="visible">
        {[
          { label:'Get Started', cls:'btn-primary', icon: <Zap size={18} /> },
          { label:'Documentation', cls:'btn-secondary', icon: <Code2 size={18} /> },
        ].map(({ label, cls, icon }, i) => (
          <motion.button key={label} className={cls}
            variants={v.scaleIn} custom={i+4}
            whileHover={tier!=='low' ? { scale:1.04 } : {}}
            whileTap={{ scale:0.98 }}
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
            whileHover={tier!=='low' ? { backgroundColor: 'rgba(255,255,255,0.03)' } : {}}
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
          <div key={i} className="ticker-item">
            {t}
          </div>
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
  const inView = useInView(ref, { once:true, margin:'-50px' })

  return (
    <motion.div ref={ref}
      className="tool-card"
      style={{ '--card-color': tool.color, '--card-glow-color': tool.glow }}
      initial={{ opacity:0, y: tier==='low'?10:40 }}
      animate={inView ? { opacity:1, y:0 } : {}}
      transition={{ duration: tier==='low'?0.3:0.6, delay: tier==='low'?0:index*0.1, ease:[0.16,1,0.3,1] }}
    >
      <motion.div className="tool-icon-wrap"
        style={{ color: tool.color }}
      >
        {tool.icon}
      </motion.div>

      <h3 className="tool-card-title">{tool.name}</h3>
      <p  className="tool-card-desc">{tool.desc}</p>

      <div className="tool-tags">
        {tool.tags.map((tg, i) => (
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
  const inView = useInView(ref, { once:true, margin:'-100px' })
  const v      = useMemo(() => makeV(tier), [tier])

  return (
    <section className="section" id="tech-stack" ref={ref}>
      <motion.div className="section-header"
        initial="hidden" animate={inView?'visible':'hidden'} variants={v.stagger}
      >
        <motion.span className="section-eyebrow" variants={v.fadeUp}>Ecosystem</motion.span>
        <motion.h2  className="section-title"   variants={v.fadeUp} custom={1}>
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
  const inView = useInView(ref, { once:true, margin:'-100px' })
  const delay  = tier==='low' ? 0 : tier==='medium' ? 300 : 400

  useEffect(() => {
    if (!inView) return
    if (tier==='low') { setLines(TERMINAL); return }
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
          initial={{ opacity:0, y:14 }} animate={inView?{ opacity:1, y:0 }:{}}
          transition={{ duration:0.5 }}
        >Developer Experience</motion.span>
        <motion.h2 className="section-title"
          initial={{ opacity:0, y:20 }} animate={inView?{ opacity:1, y:0 }:{}}
          transition={{ duration:0.5, delay:0.1 }}
        >Built for Developers</motion.h2>
      </div>

      <div className="demo-grid">
        <motion.div className="terminal-section"
          initial={{ opacity:0, y: tier==='low'?0:30 }}
          animate={inView?{ opacity:1, y:0 }:{}}
          transition={{ duration:0.6, delay:0.2, ease:[0.16,1,0.3,1] }}
        >
          <div className="terminal-header">
            <div className="terminal-dots">
              <div className="terminal-dot red"    />
              <div className="terminal-dot yellow" />
              <div className="terminal-dot green"  />
            </div>
            <span className="terminal-title">bash — ~</span>
            <div style={{width:44}} />
          </div>
          <div className="terminal-body">
            <AnimatePresence>
              {lines.map((ln, i) => (
                <motion.div key={i} className="terminal-line"
                  initial={{ opacity:0, x: -10 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ duration:0.3 }}
                >
                  {ln.type==='cmd' && <>
                    <span className="terminal-prompt">{ln.prompt}</span>
                    <span className="terminal-command">{ln.text}</span>
                  </>}
                  {ln.type==='out' && <span className={ln.cls}>{ln.text}</span>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div className="code-block"
          initial={{ opacity:0, y: tier==='low'?0:30 }}
          animate={inView?{ opacity:1, y:0 }:{}}
          transition={{ duration:0.6, delay:0.3, ease:[0.16,1,0.3,1] }}
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
  const inView = useInView(ref, { once:true, margin:'-100px' })
  const v      = useMemo(() => makeV(tier), [tier])

  return (
    <section className="section" id="features" ref={ref}>
      <motion.div className="section-header"
        initial="hidden" animate={inView?'visible':'hidden'} variants={v.stagger}
      >
        <motion.span className="section-eyebrow" variants={v.fadeUp}>Capabilities</motion.span>
        <motion.h2  className="section-title"   variants={v.fadeUp} custom={1}>
          Powerful Features
        </motion.h2>
      </motion.div>

      <div className="feat-grid">
        {FEATURES.map((f, i) => (
          <motion.div key={f.title} className="feature-item"
            initial={{ opacity:0, y: 30 }}
            animate={inView?{ opacity:1, y:0 }:{}}
            transition={{ duration: 0.5, delay: i*0.1, ease:[0.16,1,0.3,1] }}
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
  const inView   = useInView(ref, { once:true, margin:'-100px' })
  const v        = useMemo(() => makeV(tier), [tier])
  const fillRefs = useRef([])

  useEffect(() => {
    if (!inView) return
    PROGRESS.forEach((item, i) => {
      const el = fillRefs.current[i]
      if (!el) return
      setTimeout(() => { el.style.transform = \`scaleX(\${item.pct/100})\` }, i*150 + 300)
    })
  }, [inView])

  return (
    <section className="section" id="performance" ref={ref}>
      <div className="perf-grid">
        <motion.div
          initial="hidden" animate={inView?'visible':'hidden'} variants={v.stagger}
        >
          <motion.span className="section-eyebrow" variants={v.slideL}>Mastery</motion.span>
          <motion.h2 className="section-title" variants={v.slideL} custom={1} style={{ textAlign:'left', marginBottom: 16 }}>
            Level Up Your<br/>Animation Skills
          </motion.h2>
          <motion.p variants={v.slideL} custom={2} style={{ marginBottom: 32 }}>
            Track your progress as you master the most powerful animation libraries in the React ecosystem. Guaranteed 60fps performance across all devices.
          </motion.p>
          <motion.div variants={v.slideL} custom={3}>
            <button className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14 }}>
              View Curriculum
            </button>
          </motion.div>
        </motion.div>

        <motion.div className="progress-section"
          initial="hidden" animate={inView?'visible':'hidden'} variants={v.stagger}
        >
          {PROGRESS.map((item, i) => (
            <motion.div key={item.name} className="progress-item" variants={v.slideR} custom={i}>
              <div className="progress-label">
                <span className="progress-name">{item.name}</span>
                <span className="progress-pct">{item.pct}%</span>
              </div>
              <div className="progress-track">
                <div ref={el => fillRefs.current[i] = el}
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
  const inView = useInView(ref, { once:true, margin:'-100px' })

  return (
    <section className="section" id="get-started" ref={ref}>
      <motion.div className="spotlight-card"
        initial={{ opacity:0, y: 40 }}
        animate={inView?{ opacity:1, y: 0 }:{}}
        transition={{ duration: 0.8, ease:[0.16,1,0.3,1] }}
      >
        <div className="spotlight-glow" />

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, color: 'var(--accent-purple)' }}>
          <Sparkles size={48} />
        </div>

        <h2 className="section-title" style={{ marginBottom: 16 }}>
          Ready to Animate?
        </h2>
        <p style={{ fontSize: 16, marginBottom: 40, color: 'var(--text-muted)' }}>
          Join thousands of developers building fluid, interactive experiences with our tech stack.
        </p>

        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <button className="btn-primary">Get Started</button>
          <button className="btn-secondary">Read Docs</button>
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
    <footer style={{ padding: '40px 32px', textAlign: 'center', borderTop: '1px solid var(--border-light)' }}>
      <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
        © {new Date().getFullYear()} Nova Platform. All rights reserved.
      </p>
    </footer>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN APP COMPONENT
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
      <AmbientOrbs tier={tier} />

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
