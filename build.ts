import Bun from 'bun';
import reactSvgPlugin from './plugin-react-svg.js';

await Bun.build({
  entrypoints: ['./src/index.html'],
  format: 'esm',
  outdir: './dist',
  minify: true,
  plugins: [reactSvgPlugin],
});
