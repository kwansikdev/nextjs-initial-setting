import { createGlobalStyle } from "styled-components";
import normalize from "styled-normalize";

export const GlobalStyle = createGlobalStyle`
  ${normalize}

  @font-face {
    font-family: 'Noto Sans KR Thin';
    font-style: normal;
    font-weight: 100;
    src: url('/fonts/NotoSansKR-Thin.woff2') format('woff2'),
        url('/fonts/NotoSansKR-Thin.woff') format('woff'),
        url('/fonts/NotoSansKR-Thin.otf') format('opentype');
  }

  @font-face {
    font-family: 'Noto Sans KR';
    font-style: normal;
    font-weight: 400;
    src: url('/fonts/NotoSansKR-Regular.woff2') format('woff2'),
          url('/fonts/NotoSansKR-Regular.woff') format('woff'),
          url('/fonts/NotoSansKR-Regular.otf') format('opentype');
  }

  @font-face {
    font-family: 'Noto Sans KR Bold';
    font-style: normal;
    font-weight: 700;
    src: url('/fonts/NotoSansKR-Bold.woff2') format('woff2'),
          url('/fonts/NotoSansKR-Bold.woff') format('woff'),
          url('/fonts/NotoSansKR-Bold.otf') format('opentype');
  }

  @font-face {
    font-family: 'Noto Sans KR Black';
    font-style: normal;
    font-weight: 900;
    src: url('/fonts/NotoSansKR-Black.woff2') format('woff2'),
          url('/fonts/NotoSansKR-Black.woff') format('woff'),
          url('/fonts/NotoSansKR-Black.otf') format('opentype');
  }

  html {
    box-sizing: border-box;
    font-size: 10px;
    font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
    Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  }
`;
