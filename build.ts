import Bun from 'bun';
import reactSvgPlugin from './plugin-react-svg.js';

await Bun.build({
  entrypoints: ['./src/index.html', './src/worker.ts'],
  format: 'esm',
  outdir: './dist',
  minify: true,
  plugins: [reactSvgPlugin],
});
