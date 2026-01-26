import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: 'manifest.json',
                    dest: '.',
                },
                {
                    src: 'public/*',
                    dest: '.',
                },
            ],
        }),
    ],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'index.html'),
                background: resolve(__dirname, 'src/background/index.ts'),
                content: resolve(__dirname, 'src/content/index.ts'),
            },
            output: {
                entryFileNames: (chunk) => {
                    if (chunk.name === 'background' || chunk.name === 'content') {
                        return 'src/[name]/index.js';
                    }
                    return 'assets/[name]-[hash].js';
                },
            },
        },
    },
});
