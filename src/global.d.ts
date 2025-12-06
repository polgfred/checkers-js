declare module '*.svg' {
  import * as React from 'react';
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string } | string;
  export default content;
}
