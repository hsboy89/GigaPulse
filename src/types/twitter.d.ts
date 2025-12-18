// Twitter Widgets JS 타입 정의
interface Twttr {
  widgets: {
    load: (element?: HTMLElement) => void;
    createTimeline: (options: any, element: HTMLElement) => void;
  };
}

declare global {
  interface Window {
    twttr?: Twttr;
  }
}

export {};

