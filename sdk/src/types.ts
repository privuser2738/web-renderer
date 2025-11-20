/**
 * Type definitions for Web Rerender SDK
 */

/* ============================================
   Configuration Types
   ============================================ */

export interface ViewportConfig {
  mode?: 'adaptive';
  breakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    tv?: number;
  };
}

export interface PaginationControlsConfig {
  enabled?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left' | 'top-center';
  keyboard?: boolean;
}

export interface PaginationConfig {
  mode?: 'auto' | 'intelligent' | 'manual';
  breakpoints?: 'semantic' | 'viewport' | 'custom';
  containerSelector?: string | null;
  viewportMultiplier?: number;
  controls?: PaginationControlsConfig;
}

export interface ImageConfig {
  lazyLoad?: boolean;
  quality?: 'high' | 'medium' | 'low' | 'adaptive';
  userControl?: boolean;
  placeholder?: boolean;
  threshold?: number;
}

export interface EmergencyConfig {
  detectConflicts?: boolean;
  autoFix?: boolean;
  videoOptimization?: boolean;
}

export interface WebRerenderConfig {
  viewport?: ViewportConfig;
  pagination?: PaginationConfig;
  images?: ImageConfig;
  emergency?: EmergencyConfig;
  debug?: boolean;
}

/* ============================================
   Device Types
   ============================================ */

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'tv';
export type OSType = 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'tizen' | 'webos' | 'unknown';
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'ie' | 'unknown';
export type OrientationType = 'portrait' | 'landscape';
export type PerformanceTier = 'high' | 'medium' | 'low';

export interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  orientation: OrientationType | string;
  colorDepth: number;
}

export interface DeviceCapabilities {
  touch: boolean;
  pointer: boolean;
  mouse: boolean;
  pen: boolean;
  keyboard: boolean;
  hover: boolean;
  webgl: boolean;
  canvas: boolean;
  serviceWorker: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  mutationObserver: boolean;
}

export interface ConnectionInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export interface DeviceInfo {
  type: DeviceType;
  os: OSType;
  browser: BrowserType;
  screen: ScreenInfo;
  capabilities: DeviceCapabilities;
  pixelRatio: number;
  connection: ConnectionInfo | null;
  timestamp: number;
}

/* ============================================
   Input Types
   ============================================ */

export type InputType = 'mouse' | 'keyboard' | 'touch' | 'pen' | 'pointer';

export interface InputTypes {
  mouse: boolean;
  keyboard: boolean;
  touch: boolean;
  pen: boolean;
  pointer: boolean;
}

export interface InputInteraction {
  type: InputType;
  timestamp: number;
  target?: string;
}

export interface InputInfo {
  types: InputTypes;
  primary: InputType | null;
  recent: InputInteraction[];
  lastInteraction: InputInteraction | null;
}

export interface UIPreferences {
  showHover: boolean;
  largeTouchTargets: boolean;
  showFocus: boolean;
  enableDrag: boolean;
  enableSwipe: boolean;
  minTargetSize: number;
  showScrollbars: boolean;
}

/* ============================================
   Viewport Types
   ============================================ */

export type ViewportCategory = 'mobile' | 'tablet' | 'desktop' | 'desktop-large' | 'tv';

export interface ViewportInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  category: ViewportCategory;
  orientation: OrientationType;
  scrollHeight: number;
  scrollWidth: number;
  pixelRatio: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface ViewportSpacing {
  small: number;
  medium: number;
  large: number;
}

/* ============================================
   Pagination Types
   ============================================ */

export interface PaginationState {
  enabled: boolean;
  mode: 'auto' | 'intelligent' | 'manual';
  currentPage: number;
  totalPages: number;
  pages: HTMLElement[][];
  container: HTMLElement | null;
}

export interface PageChangeEvent {
  from: number;
  to: number;
  total: number;
}

/* ============================================
   Module Interfaces
   ============================================ */

export interface IModule {
  destroy(): void;
}

export interface IDeviceDetector extends IModule {
  getInfo(): DeviceInfo;
  is(type: DeviceType): boolean;
  has(capability: keyof DeviceCapabilities): boolean;
  getPerformanceTier(): PerformanceTier;
}

export interface IInputDetector extends IModule {
  getInfo(): InputInfo;
  getPrimary(): InputType | null;
  has(type: InputType): boolean;
  wasRecentlyUsed(type: InputType, withinMs?: number): boolean;
  getUIPreferences(): UIPreferences;
}

export interface IViewportManager extends IModule {
  init(deviceInfo: DeviceInfo): ViewportInfo;
  getViewport(): ViewportInfo;
  getDimensions(): ViewportDimensions;
  getCategory(): ViewportCategory;
  isAtLeast(category: ViewportCategory): boolean;
  getOptimalContentWidth(): number;
  getOptimalColumns(minColumnWidth?: number): number;
  getUsableHeight(): number;
  contentFitsInViewport(element: HTMLElement): boolean;
  getSpacing(): ViewportSpacing;
  calculatePagesNeeded(contentHeight: number): number;
}

export interface IPaginationEngine extends IModule {
  init(viewport: ViewportInfo): Promise<IPaginationEngine>;
  goToPage(pageNumber: number): boolean;
  nextPage(): boolean;
  prevPage(): boolean;
  getCurrentPage(): number;
  getTotalPages(): number;
  recalculate(): Promise<void>;
  handleViewportChange(viewport: any): void;
  handleInputChange(input: any): void;
  setEmergencyMode(enabled: boolean): void;
}

export interface IImageOptimizer extends IModule {
  init(deviceInfo: DeviceInfo): IImageOptimizer;
  setEnabled(enabled: boolean): void;
  setEmergencyMode(enabled: boolean): void;
  handlePageChange(pageInfo: any): void;
}

export interface ICoreEngine extends IModule {
  start(): Promise<ICoreEngine>;
  stop(): void;
  getState(): EngineState;
  log(...args: any[]): void;
}

export interface EngineState {
  running: boolean;
  ready: boolean;
  emergency: boolean;
}

export interface Modules {
  device: IDeviceDetector;
  input: IInputDetector;
  viewport: IViewportManager;
  pagination: IPaginationEngine;
  images: IImageOptimizer;
  core: ICoreEngine;
}

/* ============================================
   Event Types
   ============================================ */

export interface WebRerenderEventMap {
  'initialized': { config: WebRerenderConfig };
  'destroyed': {};
  'pagination:calculated': { mode: string; totalPages: number };
  'pagination:pagechanged': PageChangeEvent;
  'images:optimized': { images: number; videos: number };
  'images:toggled': { enabled: boolean };
  'viewport:changed': { old: ViewportInfo; new: ViewportInfo };
  'device:orientationchange': DeviceInfo;
  'device:resize': DeviceInfo;
  'device:connectionchange': DeviceInfo;
  'input:changed': { from: InputType | null; to: InputType | null; info: InputInfo };
  'input:interaction': InputInteraction;
  'engine:ready': {};
  'engine:emergency': { issues: string[] };
  'engine:stopped': {};
}

export type WebRerenderEventType = keyof WebRerenderEventMap;

export type EventCallback<T extends WebRerenderEventType> = (
  event: CustomEvent<WebRerenderEventMap[T]>
) => void;

export type UnsubscribeFn = () => void;

/* ============================================
   Main SDK Interface
   ============================================ */

export interface IWebRerender {
  version: string;
  initialized: boolean;
  config: WebRerenderConfig | null;
  modules: Partial<Modules>;

  init(config?: WebRerenderConfig): Promise<IWebRerender>;
  destroy(): void;
  getCurrentPage(): number;
  goToPage(pageNumber: number): boolean;
  getTotalPages(): number;
  setImageOptimization(enabled: boolean): void;
  getDeviceInfo(): DeviceInfo;
  getInputInfo(): InputInfo;
  on<T extends WebRerenderEventType>(event: T, callback: EventCallback<T>): UnsubscribeFn;
}
