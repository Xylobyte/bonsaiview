import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"
import dts from "unplugin-dts/vite"
import path from "node:path" // https://vite.dev/config/

// https://vite.dev/config/
export default defineConfig({
    build: {
        cssCodeSplit: false,
        lib: {
            entry: path.resolve(__dirname, "index.ts"),
            name: "bonsaiview",
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: ["react", "react-dom"],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                },
            },
        },
        sourcemap: false,
        emptyOutDir: true,
    },
    plugins: [react(), dts({ tsconfigPath: "./tsconfig.build.json", insertTypesEntry: true }), cssInjectedByJsPlugin()],
})
