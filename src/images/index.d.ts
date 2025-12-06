import React from 'react';

declare module '*.css' {
  const content: { [className: string]: string } | string;
  export default content;
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}
