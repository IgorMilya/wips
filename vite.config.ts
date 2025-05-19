import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST

// https://vitejs.dev/config/
// @ts-ignore
export default defineConfig(async () => ({
  plugins: [react(), svgr()],
  base: '/',
  resolve: {
    alias: {
      assets: '/src/assets/',
      components: '/src/components/',
      hooks: '/src/hooks/',
      routes: '/src/routes/',
      pages: '/src/pages/',
      theme: '/src/theme/',
      store: '/src/store/',
      types: '/src/types/',
      UI: '/src/UI/',
      utils: '/src/utils/',
      style: '/src/style/',
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: 'ws',
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
}))
//import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import svgr from 'vite-plugin-svgr'
//
// export default defineConfig({
//   plugins: [react(), svgr()],
//   base: '/',
//   resolve: {
//     alias: {
//       assets: '/src/assets/',
//       components: '/src/components/',
//       hooks: '/src/hooks/',
//       routes: '/src/routes/',
//       pages: '/src/pages/',
//       theme: '/src/theme/',
//       store: '/src/store/',
//       types: '/src/types/',
//       UI: '/src/UI/',
//       utils: '/src/utils/',
//     },
//   },
//   css: {
//     modules: {
//       localsConvention: 'camelCaseOnly',
//     },
//   },
// })