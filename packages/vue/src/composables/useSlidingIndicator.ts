import { ref, watch, nextTick, useTemplateRef, type Ref } from 'vue'

export interface IndicatorStyle {
  left: number
  width: number
}

/**
 * Tracks a pill/segment control's active button and exposes the geometry needed
 * to slide a highlight underneath it. Generic over the key type so it works for
 * numeric window controls and string mode toggles alike.
 *
 * `barRefName` must match the `ref="..."` on the bar element in the calling
 * component's template. `deps` lets callers re-measure when something other than
 * the active key changes the button layout (e.g. the set of available windows).
 */
export function useSlidingIndicator<K>(
  barRefName: string,
  activeKey: () => K | null | undefined,
  deps: () => unknown = () => undefined,
): {
  setBtnRef: (key: K, el: HTMLElement | null) => void
  indicatorStyle: Ref<IndicatorStyle | null>
  measure: () => void
} {
  const barRef = useTemplateRef<HTMLElement>(barRefName)
  const btnRefs = new Map<K, HTMLElement>()
  const indicatorStyle = ref<IndicatorStyle | null>(null)

  const setBtnRef = (key: K, el: HTMLElement | null): void => {
    if (el) btnRefs.set(key, el)
    else btnRefs.delete(key)
  }

  const measure = (): void => {
    const key = activeKey()
    if (key == null) return
    const btn = btnRefs.get(key)
    const bar = barRef.value
    if (!btn || !bar) return
    const barRect = bar.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    indicatorStyle.value = { left: btnRect.left - barRect.left, width: btnRect.width }
  }

  watch([activeKey, deps], () => nextTick(measure), { immediate: true })

  return { setBtnRef, indicatorStyle, measure }
}
