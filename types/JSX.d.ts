// Hack: only needed for React-Markdown v8, may be can be removed after upgrade
declare namespace JSX {
  type IntrinsicElements = React.JSX.IntrinsicElements;
}

// backwards compatibility: Silence TypeScript errors for HTML (Blaze) imports.
declare module "*.html";

// Silence TypeScript errors for SCSS imports.
declare module "*.scss";

// Silence TypeScript errors for CSS imports.
declare module "*.css";
