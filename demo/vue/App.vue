<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Liveline, LivelineTransition } from 'liveline-vue'
import type { ThemeMode, WindowStyle, BadgeVariant, Momentum, HoverPoint } from 'liveline-vue'
import { useDemoData } from './useDemoData'

type Demo = 'line' | 'multi' | 'candle' | 'orderbook'

const TIME_WINDOWS = [
  { label: '10s', secs: 10 },
  { label: '30s', secs: 30 },
  { label: '1m', secs: 60 },
  { label: '5m', secs: 300 },
]
// Candles read better over a wider window — open on 30s (~30 candles at 1s/candle).
const CANDLE_WINDOWS = [
  { label: '30s', secs: 30 },
  { label: '1m', secs: 60 },
  { label: '5m', secs: 300 },
]

const demo = ref<Demo>('line')
const lineMode = ref(false)
const chartType = computed(() => (lineMode.value ? 'line' : 'candle'))

const lastHover = ref<HoverPoint | null>(null)
const lastEvent = ref('—')

// Every Liveline prop is driven from here so the panel can exercise them all.
const cfg = reactive({
  theme: 'dark',
  color: '#3b82f6',
  lineWidth: 2,
  windowStyle: 'default',
  badgeVariant: 'default',
  momentum: 'on',
  cursor: 'crosshair',
  tooltipY: 14,
  windows: true,
  grid: true,
  badge: true,
  badgeTail: true,
  fill: true,
  pulse: true,
  scrub: true,
  exaggerate: false,
  showValue: true,
  valueMomentumColor: false,
  degen: false,
  paused: false,
  loading: false,
  empty: false,
  referenceLine: false,
  tooltipOutline: true,
  customFormat: false,
  widePadding: false,
  seriesToggleCompact: false,
})

const { data, value, series, candles, liveCandle, orderbook, candleWidth } =
  useDemoData(() => cfg.paused)

const momentumProp = computed<boolean | Momentum>(() =>
  cfg.momentum === 'on' ? true : cfg.momentum === 'off' ? false : (cfg.momentum as Momentum),
)

// Props shared by every demo; demo-specific data/series/candles are added per chart.
const common = computed(() => ({
  theme: cfg.theme as ThemeMode,
  color: cfg.color,
  lineWidth: cfg.lineWidth,
  grid: cfg.grid,
  badge: cfg.badge,
  badgeTail: cfg.badgeTail,
  badgeVariant: cfg.badgeVariant as BadgeVariant,
  momentum: momentumProp.value,
  fill: cfg.fill,
  pulse: cfg.pulse,
  scrub: cfg.scrub,
  exaggerate: cfg.exaggerate,
  showValue: cfg.showValue,
  valueMomentumColor: cfg.valueMomentumColor,
  degen: cfg.degen,
  paused: cfg.paused,
  loading: cfg.loading,
  windowStyle: cfg.windowStyle as WindowStyle,
  tooltipOutline: cfg.tooltipOutline,
  tooltipY: cfg.tooltipY,
  cursor: cfg.cursor,
  emptyText: 'No data — waiting for stream…',
  referenceLine: cfg.referenceLine ? { value: 100, label: 'ref' } : undefined,
  formatValue: cfg.customFormat ? (v: number) => '$' + v.toFixed(2) : undefined,
  formatTime: cfg.customFormat
    ? (t: number) => new Date(t * 1000).toLocaleTimeString()
    : undefined,
  padding: cfg.widePadding ? { top: 24, right: 100, bottom: 40, left: 24 } : undefined,
  onHover: (p: HoverPoint | null) => { lastHover.value = p },
  onWindowChange: (s: number) => { lastEvent.value = `window → ${s}s` },
}))

const winProp = computed(() =>
  cfg.windows ? (demo.value === 'candle' ? CANDLE_WINDOWS : TIME_WINDOWS) : undefined,
)

type ToggleKey =
  | 'windows' | 'grid' | 'badge' | 'badgeTail' | 'fill' | 'pulse' | 'scrub'
  | 'exaggerate' | 'showValue' | 'valueMomentumColor' | 'degen' | 'paused'
  | 'loading' | 'empty' | 'referenceLine' | 'tooltipOutline' | 'customFormat'
  | 'widePadding' | 'seriesToggleCompact'
type SelectKey = 'theme' | 'windowStyle' | 'badgeVariant' | 'momentum' | 'cursor'

const selects: { key: SelectKey; opts: string[] }[] = [
  { key: 'theme', opts: ['dark', 'light'] },
  { key: 'windowStyle', opts: ['default', 'rounded', 'text'] },
  { key: 'badgeVariant', opts: ['default', 'minimal'] },
  { key: 'momentum', opts: ['on', 'off', 'up', 'down', 'flat'] },
  { key: 'cursor', opts: ['crosshair', 'pointer', 'default', 'none'] },
]
const checks: { key: ToggleKey; label: string }[] = [
  { key: 'windows', label: 'window btns' },
  { key: 'grid', label: 'grid' },
  { key: 'badge', label: 'badge' },
  { key: 'badgeTail', label: 'badge tail' },
  { key: 'fill', label: 'fill' },
  { key: 'pulse', label: 'pulse' },
  { key: 'scrub', label: 'scrub' },
  { key: 'exaggerate', label: 'exaggerate' },
  { key: 'showValue', label: 'value' },
  { key: 'valueMomentumColor', label: 'value color' },
  { key: 'degen', label: 'degen' },
  { key: 'paused', label: 'paused' },
  { key: 'loading', label: 'loading' },
  { key: 'empty', label: 'empty' },
  { key: 'referenceLine', label: 'ref line' },
  { key: 'tooltipOutline', label: 'tooltip outline' },
  { key: 'customFormat', label: 'custom format' },
  { key: 'widePadding', label: 'wide padding' },
  { key: 'seriesToggleCompact', label: 'series compact (multi)' },
]

const bg = computed(() => (cfg.theme === 'dark' ? '#0a0a0a' : '#fafafa'))
const fg = computed(() => (cfg.theme === 'dark' ? '#e5e5e5' : '#171717'))
watch(() => cfg.theme, () => { document.body.style.background = bg.value }, { immediate: true })
</script>

<template>
  <div class="page" :style="{ background: bg, color: fg }">
    <h1>liveline-vue · dev harness</h1>

    <div class="demos">
      <button
        v-for="d in (['line', 'multi', 'candle', 'orderbook'] as Demo[])"
        :key="d"
        :class="{ active: demo === d }"
        @click="demo = d"
      >{{ d }}</button>
      <button
        v-if="demo === 'candle'"
        :class="{ active: lineMode }"
        @click="lineMode = !lineMode"
      >lineMode</button>
    </div>

    <div class="panel">
      <label v-for="s in selects" :key="s.key" class="sel">
        <span>{{ s.key }}</span>
        <select v-model="cfg[s.key]">
          <option v-for="o in s.opts" :key="o" :value="o">{{ o }}</option>
        </select>
      </label>
      <label class="sel"><span>color</span><input type="color" v-model="cfg.color" /></label>
      <label class="sel">
        <span>lineWidth</span>
        <input type="number" min="1" max="6" step="0.5" v-model.number="cfg.lineWidth" />
      </label>
      <label class="sel"><span>tooltipY</span><input type="number" v-model.number="cfg.tooltipY" /></label>
    </div>

    <div class="panel">
      <label v-for="c in checks" :key="c.key" class="chk">
        <input type="checkbox" v-model="cfg[c.key]" />{{ c.label }}
      </label>
    </div>

    <div class="chart">
      <Liveline
        v-if="demo === 'line'"
        v-bind="common"
        :data="cfg.empty ? [] : data"
        :value="value"
        :windows="winProp"
        :window="30"
      />

      <Liveline
        v-else-if="demo === 'multi'"
        v-bind="common"
        :data="data"
        :value="value"
        :series="cfg.empty ? [] : series"
        :series-toggle-compact="cfg.seriesToggleCompact"
        :windows="winProp"
        :window="30"
        :on-series-toggle="(id, vis) => (lastEvent = `${id} → ${vis ? 'shown' : 'hidden'}`)"
      />

      <LivelineTransition v-else-if="demo === 'candle'" :active="chartType">
        <Liveline
          v-bind="common"
          mode="candle"
          :data="data"
          :value="value"
          :candles="cfg.empty ? [] : candles"
          :candle-width="candleWidth"
          :live-candle="liveCandle"
          :line-mode="lineMode"
          :line-data="data"
          :line-value="value"
          :windows="winProp"
          :window="60"
          :on-mode-change="(m: 'line' | 'candle') => (lineMode = m === 'line')"
        />
      </LivelineTransition>

      <Liveline
        v-else
        v-bind="common"
        :data="cfg.empty ? [] : data"
        :value="value"
        :orderbook="orderbook"
        :windows="winProp"
        :window="30"
      />
    </div>

    <div class="readout">
      <span>hover: {{ lastHover ? `${lastHover.value.toFixed(2)} @ ${new Date(lastHover.time * 1000).toLocaleTimeString()}` : '—' }}</span>
      <span>last event: {{ lastEvent }}</span>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  padding: 24px;
}
h1 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px;
  opacity: 0.7;
}
.demos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.demos button {
  padding: 5px 11px;
  border-radius: 6px;
  border: 1px solid rgba(128, 128, 128, 0.3);
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}
.demos button.active {
  background: #3b82f6;
  border-color: transparent;
  color: #fff;
}
.panel {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
}
.sel {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  opacity: 0.85;
}
.sel select,
.sel input {
  font: inherit;
  font-size: 12px;
  color: inherit;
  background: transparent;
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 5px;
  padding: 2px 4px;
}
.sel input[type='number'] {
  width: 52px;
}
.chk {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  opacity: 0.85;
}
.chart {
  height: 360px;
  max-width: 760px;
  margin-top: 6px;
}
.readout {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  font-size: 12px;
  font-family: 'SF Mono', Menlo, monospace;
  opacity: 0.6;
}
</style>
