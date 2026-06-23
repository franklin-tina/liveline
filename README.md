# Liveline

> [!NOTE]
> Original ideas derived from [`liveline`](https://github.com/benjitaylor/liveline) by [Benji Taylor](https://github.com/benjitaylor) (MIT).

Real-time animated charts — line, multi-series, and candlestick modes. Canvas-rendered, 60fps, no CSS imports.

A framework-agnostic rendering engine with thin adapters. The engine has no framework dependency.

| Package | What |
| --- | --- |
| [`liveline-core`](./packages/core) | The engine. Canvas draw loop, theming, math, line/candle/multi pipelines. No framework dependency. |
| [`liveline-vue`](./packages/vue) | Ready-to-use chart component. See its [README](./packages/vue/README.md). |

## Quick start

Drive the engine directly with a canvas and a config:

```ts
import { createLivelineEngine, resolveTheme } from 'liveline-core'

const engine = createLivelineEngine({
  canvas,                    // <canvas> element
  container,                 // sized parent element
  config: {
    data,                    // [{ time: unixSeconds, value: number }]
    value,
    palette: resolveTheme('#3b82f6', 'dark'),
    windowSecs: 60,
    mode: 'line',
    // …rest of EngineConfig
  },
})

engine.update(nextConfig)
engine.destroy()
```

Prefer a ready-made component? See the adapter packages.

## Develop

```bash
pnpm install
pnpm -r build        # build all packages (topological order)
pnpm -r typecheck    # typecheck the workspace
pnpm -r test         # engine math unit tests
pnpm demo:vue        # adapter demo  (alias: pnpm dev)
pnpm demo:vanilla    # plain HTML/CSS/JS demo on the bare engine
```

Both demos alias the packages straight to source for instant HMR.

- **`demo/vue/`** streams live data across line / multi-series / candle / orderbook modes with a control panel that exercises every prop — feature flags, badge/window styles, reference line, loading/empty states, custom formatters, and the hover/window/series callbacks.
- **`demo/vanilla/`** drives `liveline-core` directly with `createLivelineEngine` — no framework, no build step beyond Vite — a minimal proof that the engine stands alone.

## Credit

The engine is derived from [`liveline`](https://github.com/benjitaylor/liveline) by Benji Taylor (MIT). The original prop semantics documented there apply unchanged; see each package's README for usage. Original license retained in [`LICENSE`](./LICENSE).
