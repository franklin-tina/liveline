# liveline-core

The framework-agnostic engine powering Liveline — real-time, canvas-rendered line / candlestick / multi-series charts at 60fps.

No framework dependency. Unless you're building a new adapter, use a ready-made adapter package instead.

## Direct use

```ts
import { createLivelineEngine } from 'liveline-core'

const engine = createLivelineEngine({
  canvas,        // HTMLCanvasElement
  container,     // HTMLElement (sized; the canvas fills it)
  config: { data, value, palette, windowSecs: 30, /* …EngineConfig… */ },
})

engine.update(nextConfig) // cheap; applied on the next animation frame
engine.destroy()          // remove listeners, observers, rAF loop, badge DOM
```

`resolveTheme(color, mode)` builds a full `LivelinePalette` from a single accent color. See `EngineConfig` for the complete option set.

Derived from [`liveline`](https://github.com/benjitaylor/liveline) by Benji Taylor (MIT).
