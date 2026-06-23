import type { LivelineBaseProps } from 'liveline-core'

export { default as Liveline } from './Liveline.vue'
export { default as LivelineTransition } from './LivelineTransition.vue'

export type LivelineProps = LivelineBaseProps

export type {
  LivelinePoint,
  LivelineSeries,
  CandlePoint,
  ReferenceLine,
  HoverPoint,
  Padding,
  WindowOption,
  WindowStyle,
  BadgeVariant,
  Momentum,
  ThemeMode,
  OrderbookData,
  DegenOptions,
} from 'liveline-core'
