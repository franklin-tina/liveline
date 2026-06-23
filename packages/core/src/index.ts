// Engine — the imperative, framework-agnostic core
export {
  createLivelineEngine,
  type LivelineEngineOptions,
  type LivelineEngineHandle,
  type EngineConfig,
} from './engine'

// Theme helpers — derive a full palette from a single accent color
export {
  resolveTheme,
  resolveSeriesPalettes,
  parseColorRgb,
  SERIES_COLORS,
} from './theme'

// Public types shared by every adapter
export type {
  LivelineBaseProps,
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
  LivelinePalette,
  ChartLayout,
} from './types'
