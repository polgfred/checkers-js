import Bun, { type BunPlugin } from 'bun';
import { transform } from '@svgr/core';
import jsxPlugin from '@svgr/plugin-jsx';

const reactSvgPlugin: BunPlugin = {
  name: 'react-svg',
  async setup(build) {
    build.onLoad({ filter: /\.svg$/ }, async ({ path }) => {
      const svgContent = await Bun.file(path).text();
      const componentCode = await transform(
        svgContent,
        {
          plugins: [jsxPlugin],
          jsxRuntime: 'automatic',
        },
        { componentName: 'SvgComponent' }
      );

      return {
        contents: componentCode,
        loader: 'jsx',
      };
    });
  },
};

export default reactSvgPlugin;
