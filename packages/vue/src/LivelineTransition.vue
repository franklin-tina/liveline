<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
/**
 * Cross-fade between charts (e.g. line ↔ candlestick). Change `active` to swap;
 * the outgoing and incoming charts briefly overlap and fade.
 *
 * @example
 * ```vue
 * <LivelineTransition :active="chartType">
 *   <Liveline v-if="chartType === 'line'" :data="data" :value="value" />
 *   <Liveline v-else mode="candle" :candles="candles" :candle-width="5" :data="data" :value="value" />
 * </LivelineTransition>
 * ```
 */
const { active, duration = 300 } = defineProps<{
  active: string | number
  duration?: number
}>()

// Track pending fade timers so they can be cancelled if the element is
// cancelled/removed mid-transition (avoids `done` firing on a stale node).
const timers = new Map<Element, number>()
const schedule = (el: Element, done: () => void, ms: number): void => {
  const prev = timers.get(el)
  if (prev !== undefined) window.clearTimeout(prev)
  timers.set(el, window.setTimeout(() => { timers.delete(el); done() }, ms))
}

const onEnter = (el: Element, done: () => void): void => {
  const node = el as HTMLElement
  node.style.opacity = '0'
  // Force a reflow so the browser paints opacity:0 before the transition starts.
  void node.offsetWidth
  node.style.transition = `opacity ${duration}ms ease`
  node.style.opacity = '1'
  schedule(el, done, duration)
}

const onLeave = (el: Element, done: () => void): void => {
  const node = el as HTMLElement
  node.style.transition = `opacity ${duration}ms ease`
  node.style.opacity = '0'
  node.style.pointerEvents = 'none'
  schedule(el, done, duration + 50)
}

onBeforeUnmount(() => {
  for (const id of timers.values()) window.clearTimeout(id)
  timers.clear()
})
</script>

<template>
  <div :style="{ position: 'relative', width: '100%', height: '100%' }">
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
      <div :key="active" :style="{ position: 'absolute', inset: '0' }">
        <slot />
      </div>
    </Transition>
  </div>
</template>
