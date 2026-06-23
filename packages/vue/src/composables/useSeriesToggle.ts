import { ref, computed, watch, type ComputedRef, type Ref } from 'vue'
import type { LivelineSeries } from 'liveline-core'

/**
 * Owns the show/hide state for multi-series charts. Keeps the last non-empty
 * series list so the toggle chips can fade out gracefully when series go away,
 * and refuses to hide the final visible series.
 */
export function useSeriesToggle(
  series: () => LivelineSeries[] | undefined,
  onToggle?: (id: string, visible: boolean) => void,
): {
  hiddenSeries: Ref<Set<string>>
  lastSeriesProp: Ref<LivelineSeries[] | undefined>
  showSeriesToggle: ComputedRef<boolean>
  toggle: (id: string) => void
} {
  const hiddenSeries = ref<Set<string>>(new Set())
  const lastSeriesProp = ref<LivelineSeries[] | undefined>(series())

  watch(
    series,
    (s) => {
      if (s && s.length > 0) lastSeriesProp.value = s
    },
    { immediate: true },
  )

  const showSeriesToggle = computed(() => (lastSeriesProp.value?.length ?? 0) > 1)

  const toggle = (id: string): void => {
    const next = new Set(hiddenSeries.value)
    if (next.has(id)) {
      next.delete(id)
      onToggle?.(id, true)
    } else {
      const total = series()?.length ?? 0
      const visibleCount = total - next.size
      if (visibleCount <= 1) return
      next.add(id)
      onToggle?.(id, false)
    }
    hiddenSeries.value = next
  }

  return { hiddenSeries, lastSeriesProp, showSeriesToggle, toggle }
}
