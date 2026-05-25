/// <reference types="vite/client" />

// Build-time defines from vite.config.ts. Vite's define plugin
// resolves these at compile and inlines them as string literals.
declare const __APP_VERSION__: string;
declare const __BUILD_COMMIT__: string;
declare const __BUILD_TIME__: string;
