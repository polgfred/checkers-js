import Bun from 'bun';
import reactSvgPlugin from './src/bun-plugin-svg.js';

await Bun.build({
  entrypoints: ['./src/frontend.tsx', './src/worker.ts'],
  format: 'esm',
  outdir: './dist',
  plugins: [reactSvgPlugin],
});
