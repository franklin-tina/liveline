import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'
import type { LivelinePoint, LivelineSeries, CandlePoint, OrderbookData } from 'liveline-vue'

const CANDLE_WIDTH = 1
const step = (prev: number, scale = 0.8): number => prev + (Math.random() - 0.48) * scale

const makeOrderbook = (mid: number): OrderbookData => {
  const bids: [number, number][] = []
  const asks: [number, number][] = []
  for (let i = 1; i <= 14; i++) {
    const depth = 1 - i / 18
    bids.push([mid - i * 0.2, Math.max(1, Math.round(Math.random() * 45 * depth))])
    asks.push([mid + i * 0.2, Math.max(1, Math.round(Math.random() * 45 * depth))])
  }
  return { bids, asks }
}

/**
 * Drives every stream the dev harness can render — single line, multi-series,
 * OHLC candles (with a live candle), and a churning orderbook — off one shared
 * 200ms tick. `paused` is read live so toggling it freezes all streams at once.
 */
export function useDemoData(paused: () => boolean): {
  data: Ref<LivelinePoint[]>
  value: Ref<number>
  series: Ref<LivelineSeries[]>
  candles: Ref<CandlePoint[]>
  liveCandle: Ref<CandlePoint | undefined>
  orderbook: Ref<OrderbookData>
  candleWidth: number
} {
  const data = ref<LivelinePoint[]>([])
  const value = ref(100)
  const series = ref<LivelineSeries[]>([])
  const candles = ref<CandlePoint[]>([])
  const liveCandle = ref<CandlePoint | undefined>(undefined)
  const orderbook = ref<OrderbookData>({ bids: [], asks: [] })

  const seed = (): void => {
    const now = Date.now() / 1000

    const pts: LivelinePoint[] = []
    let v = 100
    for (let i = 600; i >= 0; i--) { v = step(v); pts.push({ time: now - i * 0.5, value: v }) }
    data.value = pts
    value.value = v
    orderbook.value = makeOrderbook(v)

    const ids = ['alpha', 'beta', 'gamma']
    const colors = ['#3b82f6', '#ec4899', '#10b981']
    series.value = ids.map((id, k) => {
      let sv = 100 + k * 8
      const sd: LivelinePoint[] = []
      for (let i = 600; i >= 0; i--) { sv = step(sv, 0.6); sd.push({ time: now - i * 0.5, value: sv }) }
      return { id, label: id, color: colors[k], data: sd, value: sv }
    })

    // Bucket the single-series seed into OHLC candles.
    const cs: CandlePoint[] = []
    let bucketStart = Math.floor((now - 600 * 0.5) / CANDLE_WIDTH) * CANDLE_WIDTH
    let o = pts[0].value, h = o, l = o, c = o
    for (const p of pts) {
      const b = Math.floor(p.time / CANDLE_WIDTH) * CANDLE_WIDTH
      if (b !== bucketStart) {
        cs.push({ time: bucketStart, open: o, high: h, low: l, close: c })
        bucketStart = b; o = p.value; h = p.value; l = p.value; c = p.value
      } else {
        h = Math.max(h, p.value); l = Math.min(l, p.value); c = p.value
      }
    }
    candles.value = cs
    liveCandle.value = { time: bucketStart, open: o, high: h, low: l, close: c }
  }

  const tick = (): void => {
    if (paused()) return
    const now = Date.now() / 1000

    const nv = step(value.value)
    value.value = nv
    data.value = [...data.value.slice(-600), { time: now, value: nv }]
    orderbook.value = makeOrderbook(nv)

    series.value = series.value.map((s) => {
      const sv = step(s.value, 0.6)
      return { ...s, value: sv, data: [...s.data.slice(-600), { time: now, value: sv }] }
    })

    const lc = liveCandle.value
    if (lc) {
      const b = Math.floor(now / CANDLE_WIDTH) * CANDLE_WIDTH
      if (b !== lc.time) {
        candles.value = [...candles.value.slice(-300), lc]
        liveCandle.value = { time: b, open: nv, high: nv, low: nv, close: nv }
      } else {
        liveCandle.value = { ...lc, high: Math.max(lc.high, nv), low: Math.min(lc.low, nv), close: nv }
      }
    }
  }

  let timer = 0
  onMounted(() => { seed(); timer = window.setInterval(tick, 200) })
  onBeforeUnmount(() => clearInterval(timer))

  return { data, value, series, candles, liveCandle, orderbook, candleWidth: CANDLE_WIDTH }
}
