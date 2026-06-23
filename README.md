# Liveline (Vue)

Real-time animated charts for **Vue 3** — line, multi-series, and candlestick modes. Canvas-rendered, 60fps, no CSS imports.

Two packages: a framework-agnostic engine and a thin Vue adapter.

| Package | npm | What |
| --- | --- | --- |
| [`liveline-core`](./packages/core) | `liveline-core` | The engine. Canvas draw loop, theming, math, line/candle/multi pipelines. No framework dependency. |
| [`liveline-vue`](./packages/vue) | `liveline-vue` | **Vue 3** adapter — the `<Liveline>` component and controls. |

The split keeps the rendering core independent of Vue, so it stays unit-testable on its own and a future adapter (Svelte, Solid, …) could reuse it without touching engine code.

## Quick start

```bash
pnpm add liveline-vue
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Liveline } from 'liveline-vue'
import type { LivelinePoint } from 'liveline-vue'

const data = ref<LivelinePoint[]>([])  // { time: unixSeconds, value: number }
const value = ref(0)
</script>

<template>
  <div style="height: 300px">
    <Liveline :data="data" :value="value" color="#3b82f6" theme="dark" />
  </div>
</template>
```

## Develop

```bash
pnpm install
pnpm -r build        # build both packages (core first, then vue)
pnpm -r typecheck    # tsc + vue-tsc across the workspace
pnpm -r test         # engine math unit tests
pnpm dev             # interactive demo (alias: pnpm demo)
```

The demo (`demo/vue/`) aliases the packages straight to source for instant HMR. It streams live data across line / multi-series / candle / orderbook modes and exposes a control panel that exercises every `<Liveline>` prop — feature flags, badge/window styles, reference line, loading/empty states, custom formatters, and the hover/window/series callbacks.

## Credit

The engine is derived from [`liveline`](https://github.com/benjitaylor/liveline) by Benji Taylor (MIT). The original prop semantics documented there apply unchanged; see [`packages/vue/README.md`](./packages/vue/README.md) for Vue usage. Original license retained in [`LICENSE`](./LICENSE).
