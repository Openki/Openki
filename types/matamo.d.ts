// Mark this as an ES module
// oxlint-disable-next-line unicorn/require-module-specifiers
export {};

declare global {
  interface Window {
    AnalyticsTracker: any;
  }
}
