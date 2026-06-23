# Liveline

> [!NOTE]
> Original ideas derived from [`liveline`](https://github.com/benjitaylor/liveline) by [Benji Taylor](https://github.com/benjitaylor) (MIT).

Real-time animated charts — line, multi-series, and candlestick modes. Canvas-rendered, 60fps, no CSS imports.

A framework-agnostic rendering engine with thin per-framework adapters. Today there's a **Vue 3** adapter; the engine itself has no framework dependency.

| Package | What |
| --- | --- |
| [`liveline-core`](./packages/core) | The engine. Canvas draw loop, theming, math, line/candle/multi pipelines. No framework dependency. |
| [`liveline-vue`](./packages/vue) | **Vue 3** adapter — the `<Liveline>` component and controls. |

## Quick start (Vue)

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
pnpm dev             # interactive demo (alias: pnpm demo:vue)
```

The demo (`demo/vue/`) aliases the packages straight to source for instant HMR. It streams live data across line / multi-series / candle / orderbook modes and exposes a control panel that exercises every `<Liveline>` prop — feature flags, badge/window styles, reference line, loading/empty states, custom formatters, and the hover/window/series callbacks.

## Credit

The engine is derived from [`liveline`](https://github.com/benjitaylor/liveline) by Benji Taylor (MIT). The original prop semantics documented there apply unchanged; see [`packages/vue/README.md`](./packages/vue/README.md) for Vue usage. Original license retained in [`LICENSE`](./LICENSE).
