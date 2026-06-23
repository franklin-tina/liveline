# liveline-vue

Real-time animated charts for **Vue 3** — line, multi-series, and candlestick modes. Canvas-rendered, 60fps, no CSS imports. Powered by [`liveline-core`](../core).

Peer dependency: `vue ^3.5.0`.

## Quick start

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Liveline } from 'liveline-vue'
import type { LivelinePoint } from 'liveline-vue'

const data = ref<LivelinePoint[]>([])  // { time: unixSeconds, value: number }
const value = ref(0)
// Feed data from a WebSocket, polling, etc.
</script>

<template>
  <div style="height: 300px">
    <Liveline :data="data" :value="value" color="#3b82f6" theme="dark" />
  </div>
</template>
```

## Props

Callback props are plain prop functions (`:on-window-change`, `:on-mode-change`, `:on-series-toggle`, `:on-hover`):

```vue
<Liveline
  :data="data"
  :value="value"
  :windows="[{ label: '30s', secs: 30 }, { label: '1m', secs: 60 }]"
  :on-window-change="(secs) => activeWindow = secs"
  :series="series"
  :on-series-toggle="(id, visible) => {}"
/>
```

Native `class` and `style` pass through to the chart container.

### Candlestick + line/candle toggle

```vue
<Liveline
  mode="candle"
  :candles="candles"
  :candle-width="5"
  :live-candle="liveCandle"
  :data="data"
  :value="value"
  :on-mode-change="(m) => lineMode = m === 'line'"
/>
```

## Cross-fade between charts

```vue
<script setup lang="ts">
import { Liveline, LivelineTransition } from 'liveline-vue'
</script>

<template>
  <LivelineTransition :active="chartType">
    <Liveline v-if="chartType === 'line'" :data="data" :value="value" />
    <Liveline v-else mode="candle" :candles="candles" :candle-width="5" :data="data" :value="value" />
  </LivelineTransition>
</template>
```

## Full API

Every option documented in the upstream [`liveline`](https://github.com/benjitaylor/liveline) README applies unchanged — theme, grid, badge, momentum, fill, loading, paused, scrub, exaggerate, degen, orderbook, reference lines, multi-series, and candlestick mode.

---

Derived from [`liveline`](https://github.com/benjitaylor/liveline) by Benji Taylor (MIT).
