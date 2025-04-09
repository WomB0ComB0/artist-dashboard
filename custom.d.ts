declare module '*.png' {
  import React = require('react');

  export const ReactComponent: React.FC<React.ImgHTMLAttributes<HTMLImageElement>>;
  const content: string;
  export default content;
}

declare module '*.jpg' {
  import React = require('react');

  export const ReactComponent: React.FC<React.ImgHTMLAttributes<HTMLImageElement>>;
  const content: string;
  export default content;
}

declare module '*.webp' {
  import React = require('react');

  export const ReactComponent: React.FC<React.ImgHTMLAttributes<HTMLImageElement>>;
  const content: string;
  export default content;
}

declare module '*.svg' {
  import React = require('react');

  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.sass' {
  const content: { [className: string]: string };
  export default content;
}
