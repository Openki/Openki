// Hack: only needed for React-Markdown v8, may be can be removed after upgrade
declare namespace JSX {
  type IntrinsicElements = React.JSX.IntrinsicElements;
}

// Silence TypeScript errors for SCSS imports.
declare module "*.scss";
