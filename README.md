# 목차

1. [Nextjs 프로젝트 생성](#1-nextjs-프로젝트-생성)

2. [eslint, prettier 셋팅](#2-eslint-prettier-셋팅)

3. [Absolute path 설정](#3-absolute-path-설정)

4. [Styled-components 적용](#4-styled-components-적용)

5. [svgr 셋팅](#5-svgr-셋팅)

6. [husky, lint-staged 셋팅](#6-husky-lint-staged-셋팅)
------


<br />

> 아래 내용은 해당 프로젝트의 환경을 어떻게 구축했는지에 대한 설명입니다.

## 1. Next.js 프로젝트 생성

```bash
npx create-next-app --typescript t3q.dl_ul_react
```

<br />

## 2. eslint, prettier 셋팅

```bash
npx eslint --init
```

`.eslint.json`이 생성됩니다.

```bash
/** eslint 추가 설정 */
npm install --save-dev eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react-hooks

/** prettier */
npm install --save-dev --save-exact prettier eslint-config-prettier eslint-plugin-prettier
```

`.eslint.json`을 아래와 같이 수정하고 `.perttierrc`를 추가합니다.

```json
/** .eslintrc.json */
{
  ...
  "extends": [
    ...
    /** 추가 */
    "prettier"
  ],
  "plugins": [
    ...
    /** 추가 */
    "react-hooks",
    "pretter"
  ],
  /** 추가 */
  "rules": {
    "react/react-in-jsx-scope": "off",
    "camelcase": "error",
    "spaced-comment": "error",
    "quotes": ["error", "single"],
    "no-duplicate-imports": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx", ".d.ts"]
      }
    },
    "react": {
      "version": "detect"
    }
  }
}
```

```json
/** .prettierrc */
{
  "semi": false,
  "tabWidth": 2,
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "all",
  "jsxSingleQuote": true,
  "bracketSpacing": true
}
```

<br />

## 3. Absolute path 설정

`tsconfig.json`의 설정 중에 `baseUrl`과 `paths` 설정으로 절대경로 설정이 가능합니다.

```tsx
{
  ...
  "baseUrl": ".",
  "paths": {
    "@/*": ["./*"]
  },
  ...
}
```

<br />

## 4. Styled-components 적용

```bash
npm i styled-components styled-normalize
npm i -D @types/styled-components
```

- styled-components
- styled-normalize → css 초기화에 사용되는 라이브러리
- typescript를 적용 시 styled-components를 인식하지 못하기 때문에 type이 정의되어있는 라이브러리도 같이 설치해줍니다.

- global-style.ts → 전역 스타일을 설정하는 부분 (예시 ⤵️)

  ```tsx
  import { createGlobalStyle } from 'styled-components'
  import { normalize } from 'styled-normalize'

  export const GlobalStyle = createGlobalStyle`
  	${normalize}
  	
  	html {
  		box-sizing: border-box;
  		font-size: 10px;
  	}
  `
  ```

- styled.d.ts → theme.ts에서 사용되는 변수들의 타입

  ```tsx
  import 'styled-components'

  declare module 'styled-components' {
    // theme에서 사용할 변수들의 타입을 지정해준다.
    export interface DefaultTheme {}
  }
  ```

- theme.ts → 공통으로 사용되는 theme 스타일 지정

  ```tsx
  import { DefaultTheme } from 'styled-components'

  export const theme: DefaultTheme = {}
  ```

위에서 설정한 스타일과 theme을 App 적용해야합니다.

`/pages/_app.tsx` 내에 전역 스타일과 테마로 감싸준 코드를 추가합니다.

```tsx
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'styled-components'

import { GlobalStyle } from '../styles/global-style'
import { theme } from '../styles/theme'

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default App
```

`.babelrc` 를 추가하지 않으면 스타일이 적용되기 전에 렌더링 되는 현상이 발생합니다.

```tsx
npm install --save-dev babel-plugin-styled-components
```

최상위 디렉토리에 `.babelrc` 를 추가해줍니다.

```tsx
{
  "presets": ["next/babel"],
  "plugins": [
    [
      "styled-components",
      { "ssr": true, "displayName": true, "preprocess": false }
    ]
  ]
}
```

next.js에서 styled-components를 사용하면 css 적용이 바로 안되고 늦게 되서 깜빡이는 현상이 발생합니다. 따라서 `_document.tsx` 파일을 생성해서 렌더링 될때 styled-components의 css를 적용해줘야 합니다.

```tsx
import Document, { DocumentContext } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      }
    } finally {
      sheet.seal()
    }
  }
}
```

<br />

## 5. svgr 셋팅

SVGR은 svg 파일을 React 컴포넌트로 사용할 수 있도록 만들어주는 도구입니다.

next.js 용 플러그인을 설치합니다.

```bash
npm i -D next-compose-plugins next-plugin-svgr file-loader
```

자세한 설정 내용은 다음을 참고하세요. ([참고](https://github.com/platypusrex/next-plugin-svgr#usage))

```js
/** next.config.js */
/** @type {import('next').NextConfig} */

const withPlugins = require('next-compose-plugins')
const withSvgr = require('next-plugin-svgr')
const { svgrOptions, fileLoaderOptions } = require('./.svgrrc')

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = withPlugins(
  [
    withSvgr({
      fileLoader: fileLoaderOptions,
      svgrOptions,
    }),
  ],
  nextConfig,
)
```

```js
/** .svgrc.js */
const svgrOptions = {
  titleProp: true,
  icon: true,
  svgProps: {
    height: 'auto',
  },
  memo: true,
  jsxImportSource: {
    source: '@emotion/react',
    specifiers: ['jsx'],
  },
}

const fileLoaderOptions = {
  limit: 16384,
  name(resourcePath, resourceQuery) {
    if (process.env.NODE_ENV === 'development') {
      return '[path][name].[ext]'
    }
    return '[contenthash].[ext]'
  },
}

module.exports = { svgrOptions, fileLoaderOptions }
```

<br />

## 6. husky, lint-staged 셋팅

```bash
npx mrm@2 lint-staged
```

`.husky` > `pre-commit`에서 `npx lint-staged`을 `npm run lint` 수정합니다.

```sh
...

npm run lint
```

그리고 `lint-staged`에서 Eslint warning이 발견 될 경우 git commit이 중단되게 하길 원한다면 아래와 같이 수정하면 됩니다.

```
/** package.json */
{
  ...
  "scripts: {
    ...
    "lint": "next lint --max-warnings 0",
    ...
  }
}
```
