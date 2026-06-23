<script setup lang="ts">
import { ref, computed, useTemplateRef, type CSSProperties } from 'vue'
import {
  resolveTheme,
  resolveSeriesPalettes,
  SERIES_COLORS,
  type EngineConfig,
  type LivelineBaseProps,
  type Momentum,
  type DegenOptions,
} from 'liveline-core'
import { useSlidingIndicator, type IndicatorStyle } from './composables/useSlidingIndicator'
import { useSeriesToggle } from './composables/useSeriesToggle'
import { useLivelineEngine } from './composables/useLivelineEngine'

defineOptions({ inheritAttrs: false })

const {
  data,
  value,
  series,
  theme = 'dark',
  color = '#3b82f6',
  window = 30,
  grid = true,
  badge = true,
  momentum = true,
  fill = true,
  scrub = true,
  loading = false,
  paused = false,
  exaggerate = false,
  badgeTail = true,
  badgeVariant = 'default',
  showValue = false,
  valueMomentumColor = false,
  tooltipY = 14,
  tooltipOutline = true,
  lerpSpeed = 0.08,
  cursor = 'crosshair',
  pulse = true,
  mode = 'line',
  seriesToggleCompact = false,
  windowStyle,
  windows,
  padding,
  degen,
  referenceLine,
  lineWidth,
  formatValue,
  formatTime,
  onHover,
  onWindowChange,
  onModeChange,
  onSeriesToggle,
  orderbook,
  emptyText,
  candles,
  candleWidth,
  liveCandle,
  lineMode,
  lineData,
  lineValue,
  className,
} = defineProps<LivelineBaseProps>()

const defaultFormatValue = (v: number): string => v.toFixed(2)
const defaultFormatTime = (t: number): string => {
  const d = new Date(t * 1000)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const s = d.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
const formatValueFn = computed(() => formatValue ?? defaultFormatValue)
const formatTimeFn = computed(() => formatTime ?? defaultFormatTime)

const canvasRef = useTemplateRef('canvas')
const containerRef = useTemplateRef('container')
const valueDisplayRef = useTemplateRef('valueDisplay')

const { hiddenSeries, lastSeriesProp, showSeriesToggle, toggle: handleSeriesToggle } =
  useSeriesToggle(
    () => series,
    (id, visible) => onSeriesToggle?.(id, visible),
  )

const palette = computed(() => {
  const p = resolveTheme(color, theme)
  if (lineWidth != null) p.lineWidth = lineWidth
  return p
})
const isDark = computed(() => theme === 'dark')
const isMultiSeries = computed(() => series != null && series.length > 0)

const seriesPalettes = computed(() => {
  if (!series || series.length === 0) return null
  return resolveSeriesPalettes(series, theme)
})

const multiSeries = computed(() => {
  if (!series || !seriesPalettes.value) return undefined
  return series.map((s, i) => ({
    id: s.id,
    data: s.data,
    value: s.value,
    palette: seriesPalettes.value!.get(s.id)
      ?? resolveTheme(s.color || SERIES_COLORS[i % SERIES_COLORS.length], theme),
    label: s.label,
  }))
})

const showMomentum = computed(() => momentum !== false)
const momentumOverride = computed<Momentum | undefined>(() =>
  typeof momentum === 'string' ? momentum : undefined,
)

const pad = computed(() => {
  const defaultRight = badge ? 80 : grid ? 54 : 12
  return {
    top: padding?.top ?? 12,
    right: padding?.right ?? defaultRight,
    bottom: padding?.bottom ?? 28,
    left: padding?.left ?? 12,
  }
})

const degenOptions = computed<DegenOptions | undefined>(() => {
  const enabled = degen != null ? degen !== false : false
  if (!enabled) return undefined
  return typeof degen === 'object' ? degen : {}
})

const activeWindowSecs = ref(
  windows && windows.length > 0 ? windows[0].secs : window,
)
const effectiveWindowSecs = computed(() => (windows ? activeWindowSecs.value : window))

const {
  setBtnRef: setWindowBtnRef,
  indicatorStyle,
} = useSlidingIndicator<number>('windowBar', () => activeWindowSecs.value, () => windows)

const onWindowClick = (secs: number): void => {
  activeWindowSecs.value = secs
  onWindowChange?.(secs)
}

const activeMode = computed(() => (lineMode ? 'line' : 'candle'))
const {
  setBtnRef: setModeBtnRef,
  indicatorStyle: modeIndicatorStyle,
} = useSlidingIndicator<string>('modeBar', () => activeMode.value, () => onModeChange)

const ws = computed(() => windowStyle ?? 'default')
const cursorStyle = computed(() => (scrub ? cursor : 'default'))
const activeColor = computed(() => (isDark.value ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)'))
const inactiveColor = computed(() => (isDark.value ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'))

const barBackground = computed(() =>
  ws.value === 'text' ? 'transparent' : isDark.value ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
)
const indicatorBackground = computed(() => (isDark.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.035)'))

// Shared wrapper for the window / mode / series segment bars.
const barWrapperStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  display: 'inline-flex',
  gap: ws.value === 'text' ? '4px' : '2px',
  background: barBackground.value,
  borderRadius: ws.value === 'rounded' ? '999px' : '6px',
  padding: ws.value === 'text' ? '0' : ws.value === 'rounded' ? '3px' : '2px',
}))

// Sliding highlight shared by the window and mode segment bars.
const indicatorBarStyle = (s: IndicatorStyle): CSSProperties => ({
  position: 'absolute',
  top: ws.value === 'rounded' ? '3px' : '2px',
  left: s.left + 'px',
  width: s.width + 'px',
  height: ws.value === 'rounded' ? 'calc(100% - 6px)' : 'calc(100% - 4px)',
  background: indicatorBackground.value,
  borderRadius: ws.value === 'rounded' ? '999px' : '4px',
  transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  pointerEvents: 'none',
})

const showControlsRow = computed(() =>
  (windows != null && windows.length > 0) || onModeChange != null || showSeriesToggle.value,
)

const valueDisplayStyle = computed<CSSProperties>(() => ({
  display: 'block',
  fontSize: '20px',
  fontWeight: 500,
  fontFamily: '"SF Mono", Menlo, monospace',
  color: isDark.value ? 'rgba(255,255,255,0.85)' : '#111',
  transition: 'color 0.3s',
  letterSpacing: '-0.01em',
  marginBottom: '8px',
  paddingTop: '4px',
  paddingLeft: pad.value.left + 'px',
}))

const buildConfig = (): EngineConfig => ({
  data,
  value,
  palette: palette.value,
  windowSecs: effectiveWindowSecs.value,
  lerpSpeed,
  showGrid: grid,
  showBadge: isMultiSeries.value ? false : badge,
  showMomentum: isMultiSeries.value ? false : showMomentum.value,
  momentumOverride: momentumOverride.value,
  showFill: isMultiSeries.value ? false : fill,
  referenceLine,
  formatValue: formatValueFn.value,
  formatTime: formatTimeFn.value,
  padding: pad.value,
  onHover,
  showPulse: pulse,
  scrub,
  exaggerate,
  degenOptions: isMultiSeries.value ? undefined : degenOptions.value,
  badgeTail,
  badgeVariant,
  tooltipY,
  tooltipOutline,
  valueMomentumColor,
  valueDisplay: showValue ? valueDisplayRef.value : null,
  orderbookData: orderbook,
  loading,
  paused,
  emptyText,
  mode,
  candles,
  candleWidth,
  liveCandle,
  lineMode,
  lineData,
  lineValue,
  multiSeries: multiSeries.value,
  isMultiSeries: isMultiSeries.value,
  hiddenSeriesIds: hiddenSeries.value,
})

useLivelineEngine(canvasRef, containerRef, buildConfig)

defineExpose({ /* reserved for future imperative API */ })
</script>

<template>
  <span
    v-if="showValue"
    ref="valueDisplay"
    :style="valueDisplayStyle"
  />

  <div
    v-if="showControlsRow"
    :style="{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', marginLeft: pad.left + 'px' }"
  >
    <div
      v-if="windows && windows.length > 0"
      ref="windowBar"
      :style="barWrapperStyle"
    >
      <div
        v-if="ws !== 'text' && indicatorStyle"
        :style="indicatorBarStyle(indicatorStyle)"
      />
      <button
        v-for="w in windows"
        :key="w.secs"
        :ref="(el) => setWindowBtnRef(w.secs, el as HTMLButtonElement | null)"
        @click="onWindowClick(w.secs)"
        :style="{
          position: 'relative',
          zIndex: 1,
          fontSize: '11px',
          padding: ws === 'text' ? '2px 6px' : '3px 10px',
          borderRadius: ws === 'rounded' ? '999px' : '4px',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: w.secs === activeWindowSecs ? 600 : 400,
          background: 'transparent',
          color: w.secs === activeWindowSecs ? activeColor : inactiveColor,
          transition: 'color 0.2s, background 0.15s',
          lineHeight: '16px',
        }"
      >
        {{ w.label }}
      </button>
    </div>

    <!-- Mode toggle -->
    <div
      v-if="onModeChange"
      ref="modeBar"
      :style="barWrapperStyle"
    >
      <div
        v-if="ws !== 'text' && modeIndicatorStyle"
        :style="indicatorBarStyle(modeIndicatorStyle)"
      />
      <button
        :ref="(el) => setModeBtnRef('line', el as HTMLButtonElement | null)"
        @click="onModeChange('line')"
        :style="{
          position: 'relative', zIndex: 1, padding: '5px 7px',
          borderRadius: ws === 'rounded' ? '999px' : '4px',
          border: 'none', cursor: 'pointer', background: 'transparent',
          display: 'flex', alignItems: 'center',
        }"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M1 8.5C2.5 8.5 3 4 5.5 4S7.5 7 8.5 7C9.5 7 10 3.5 11 3.5"
            :stroke="activeMode === 'line' ? activeColor : inactiveColor"
            :stroke-width="activeMode === 'line' ? 1.5 : 1.2"
            stroke-linecap="round"
            fill="none"
          />
        </svg>
      </button>
      <button
        :ref="(el) => setModeBtnRef('candle', el as HTMLButtonElement | null)"
        @click="onModeChange('candle')"
        :style="{
          position: 'relative', zIndex: 1, padding: '5px 7px',
          borderRadius: ws === 'rounded' ? '999px' : '4px',
          border: 'none', cursor: 'pointer', background: 'transparent',
          display: 'flex', alignItems: 'center',
        }"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <line x1="3.5" y1="1" x2="3.5" y2="11" :stroke="activeMode === 'candle' ? activeColor : inactiveColor" stroke-width="1" />
          <rect x="2" y="3" width="3" height="5" rx="0.5" :fill="activeMode === 'candle' ? activeColor : inactiveColor" />
          <line x1="8.5" y1="2" x2="8.5" y2="10" :stroke="activeMode === 'candle' ? activeColor : inactiveColor" stroke-width="1" />
          <rect x="7" y="4" width="3" height="4" rx="0.5" :fill="activeMode === 'candle' ? activeColor : inactiveColor" />
        </svg>
      </button>
    </div>

    <div
      v-if="showSeriesToggle"
      :style="[barWrapperStyle, {
        opacity: isMultiSeries ? 1 : 0,
        transition: 'opacity 0.4s',
        pointerEvents: isMultiSeries ? 'auto' : 'none',
      }]"
    >
      <button
        v-for="(s, si) in (lastSeriesProp ?? [])"
        :key="s.id"
        @click="handleSeriesToggle(s.id)"
        :style="{
          position: 'relative',
          zIndex: 1,
          fontSize: '11px',
          padding: seriesToggleCompact
            ? (ws === 'text' ? '2px 4px' : '5px 7px')
            : (ws === 'text' ? '2px 6px' : '3px 8px'),
          borderRadius: ws === 'rounded' ? '999px' : '4px',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 500,
          background: hiddenSeries.has(s.id)
            ? 'transparent'
            : (ws === 'text' ? 'transparent' : indicatorBackground),
          color: hiddenSeries.has(s.id) ? inactiveColor : activeColor,
          opacity: hiddenSeries.has(s.id) ? 0.4 : 1,
          transition: 'opacity 0.2s, background 0.15s, color 0.2s',
          lineHeight: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: seriesToggleCompact ? '0' : '4px',
        }"
      >
        <span
          :style="{
            width: seriesToggleCompact ? '8px' : '6px',
            height: seriesToggleCompact ? '8px' : '6px',
            borderRadius: '50%',
            background: s.color || SERIES_COLORS[si % SERIES_COLORS.length],
            flexShrink: 0,
            opacity: hiddenSeries.has(s.id) ? 0.4 : 1,
            transition: 'opacity 0.2s',
          }"
        />
        <template v-if="!seriesToggleCompact">{{ s.label ?? s.id }}</template>
      </button>
    </div>
  </div>

  <div
    ref="container"
    v-bind="$attrs"
    :class="className"
    :style="{ width: '100%', height: '100%', position: 'relative' }"
  >
    <canvas ref="canvas" :style="{ display: 'block', cursor: cursorStyle }" />
  </div>
</template>
