import { createLivelineEngine, resolveTheme } from 'liveline-core'

const container = document.querySelector('#chart-container')
const canvas = document.querySelector('#chart')
const valueEl = document.querySelector('#value')

let theme = 'dark'
let paused = false

const now = () => Date.now() / 1000
const step = (v) => v + (Math.random() - 0.48) * 0.8

// Seed ~5 minutes of half-second ticks.
let value = 100
const data = []
for (let i = 600; i >= 0; i--) {
  value = step(value)
  data.push({ time: now() - i * 0.5, value })
}

// The raw engine takes a complete config — adapters are what supply these
// defaults. Spelling them out here is the whole point of the demo.
const config = () => ({
  data,
  value,
  palette: resolveTheme('#3b82f6', theme),
  windowSecs: 60,
  lerpSpeed: 0.08,
  showGrid: true,
  showBadge: true,
  showMomentum: true,
  showFill: true,
  showPulse: true,
  scrub: true,
  exaggerate: false,
  badgeTail: true,
  badgeVariant: 'default',
  tooltipY: 14,
  tooltipOutline: true,
  valueMomentumColor: true,
  mode: 'line',
  padding: { top: 12, right: 80, bottom: 28, left: 12 },
  formatValue: (v) => v.toFixed(2),
  formatTime: (t) => new Date(t * 1000).toLocaleTimeString(),
  valueDisplay: valueEl,
})

const engine = createLivelineEngine({ canvas, container, config: config() })

setInterval(() => {
  if (paused) return
  value = step(value)
  data.push({ time: now(), value })
  if (data.length > 600) data.shift()
  engine.update(config())
}, 200)

document.querySelector('#theme').addEventListener('click', (e) => {
  theme = theme === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme
  e.target.textContent = `theme: ${theme}`
  engine.update(config())
})

document.querySelector('#pause').addEventListener('click', (e) => {
  paused = !paused
  e.target.textContent = paused ? 'resume' : 'pause'
})

window.addEventListener('beforeunload', () => engine.destroy())
