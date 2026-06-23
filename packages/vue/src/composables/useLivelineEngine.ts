import { onMounted, onBeforeUnmount, watchEffect, type Ref } from 'vue'
import { createLivelineEngine, type EngineConfig } from 'liveline-core'

/**
 * Drives the imperative core engine from Vue's lifecycle: creates it once the
 * canvas/container are mounted, pushes the latest config on every reactive change
 * (read next frame by the engine), and tears it down on unmount.
 */
export function useLivelineEngine(
  canvasRef: Readonly<Ref<HTMLCanvasElement | null>>,
  containerRef: Readonly<Ref<HTMLElement | null>>,
  buildConfig: () => EngineConfig,
): void {
  let engine: ReturnType<typeof createLivelineEngine> | null = null

  onMounted(() => {
    if (!canvasRef.value || !containerRef.value) return
    engine = createLivelineEngine({
      canvas: canvasRef.value,
      container: containerRef.value,
      config: buildConfig(),
    })
  })

  watchEffect(() => {
    const cfg = buildConfig()
    engine?.update(cfg)
  })

  onBeforeUnmount(() => {
    engine?.destroy()
    engine = null
  })
}
