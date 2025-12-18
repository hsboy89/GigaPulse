// X (Twitter) Widgets JS 타입 정의
interface TwitterTimelineOptions {
  sourceType: 'profile' | 'list' | 'likes' | 'collection';
  screenName?: string;
  userId?: string;
  listId?: string;
  slug?: string;
  ownerScreenName?: string;
  collectionId?: string;
  url?: string;
  height?: number;
  width?: number | string;
  theme?: 'light' | 'dark';
  tweetLimit?: number;
  chrome?: string;
  noHeader?: boolean;
  noFooter?: boolean;
  noBorders?: boolean;
  noScrollbar?: boolean;
  transparent?: boolean;
  linkColor?: string;
  borderColor?: string;
}

interface Twttr {
  ready: (callback: (twttr: Twttr) => void) => void;
  widgets: {
    load: (element?: HTMLElement) => void;
    createTimeline: (
      options: TwitterTimelineOptions,
      element: HTMLElement
    ) => Promise<HTMLElement>;
    createTweet: (
      tweetId: string,
      element: HTMLElement,
      options?: any
    ) => Promise<HTMLElement>;
    createFollowButton: (
      screenName: string,
      element: HTMLElement,
      options?: any
    ) => Promise<HTMLElement>;
  };
  events: {
    bind: (event: string, callback: (event: any) => void) => void;
    unbind: (event: string) => void;
  };
}

declare global {
  interface Window {
    twttr?: Twttr;
  }
}

export {};

