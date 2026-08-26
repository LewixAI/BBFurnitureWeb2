import { defineConfig } from 'vite';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

/** Re-renders the static HTML whenever a template or content file changes. */
function renderPlugin() {
  const render = () => execFileSync('node', ['scripts/render.mjs'], { cwd: ROOT, stdio: 'inherit' });
  return {
    name: 'bb-render',
    buildStart() { render(); },
    configureServer(server) {
      server.watcher.add(path.join(ROOT, 'src'));
      server.watcher.on('change', (file) => {
        if (/src[/\\](templates|content\.js|library\.js|image\.js)/.test(file)) {
          try { render(); } catch { /* the error already printed */ }
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}

const BASE = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');

export default defineConfig({
  base: BASE ? `${BASE}/` : '/',
  plugins: [renderPlugin()],
  server: { port: 5191, host: true },
  preview: { port: 5191, host: true },
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        globSync('**/*.html', { cwd: ROOT, ignore: ['node_modules/**', 'dist/**', '_research/**'] })
          .map((file) => [file.replace(/\.html$/, '').replace(/\//g, '-'), path.resolve(ROOT, file)])
      ),
    },
  },
});
