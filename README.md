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
    "prettier"
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
// 예시

{
  ...
  "baseUrl": ".",
  "paths": {
    "@components/*": ["src/components/*"],
    "@hooks/*": ["src/hooks/*"],
    "@layout/*": ["src/layout/*"],
    "@libs/*": ["src/libs/*"],
    "@functions/*": ["src/functions/*"],
    "@services/*": ["src/services/*"],
    "@pages/*": ["src/pages/*"],
    "@types/*": ["src/types/*"],
    "@utils/*": ["src/utils/*"]
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

- next.js 12버전부터 swc 컴파일러 설정이 CNA로 프로젝트 생성 시 default로 true가 됩니다. 이에 따라 styled-components 설정이 기존 위에서 설정한 내용보다 훨씬 간단하게 적용이 됩니다.


<br />

next.js를 12버전 이상으로 설치 한 뒤 `next.config.js`를 확인해 보면 아래와 같이 `swcMinify`가 true로 설정되어 있습니다.

```javascript
// next.config.js

module.exports = {
  swcMinify: true,
}
```

여기에서 `complirt` 옵션에 styled-components에 대한 옵션을 true로 설정해 주면 위에서 ssr을 적용해줬던 부분을 매우 간단하게 적용할 수 있습니다.

```javascript
// next.config.js

module.exports = {
  swcMinify: true,
  
+  complier: {
+  // ssrm displayName true가 기본값으로 켜진다.
+    styledComponents: true
+  }
}
```

<br />

## 5. svgr 셋팅

SVGR은 svg 파일을 React 컴포넌트로 사용할 수 있도록 만들어주는 도구입니다.

next.js 용 플러그인을 설치합니다.

```bash
npm i -D @svgr/webpack file-loader
```

자세한 설정 내용은 다음을 참고하세요. ([참고](https://github.com/platypusrex/next-plugin-svgr#usage))

```js
/** next.config.js */
/** @type {import('next').NextConfig} */

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
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: svgrOptions,
        },
        {
          loader: 'file-loader',
          options: svgrFileLoaderOptions,
        },
      ],
    })
    return config
  },
}

module.exports = nextConfig
```

```js
/** .svgrc.js */
const svgrOptions = {
  titleProp: true,
  icon: true,
  svgProps: {
    height: '100%',
  },
  memo: true,
};

const svgrFileLoaderOptions = {
  limit: 16384,
  name(resourcePath, resourceQuery) {
    if (process.env.NODE_ENV === 'development') {
      return '[path][name].[ext]';
    }
    return '[contenthash].[ext]';
  },
};

module.exports = { svgrOptions, svgrFileLoaderOptions };
```

```typescript
/** svgr.d.ts */

type _ExpandingSVGRProps = {
  title?: string
}

declare module '*.svg' {
  import React = require('react')
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement> & _ExpandingSVGRProps>
  const url: string
  export default url
}
```

`tsconfig.json`의 include 배열에 "types/*.d.ts"를 추가해줍니다.


<br />

## 6. husky, lint-staged 셋팅

```bash
npx mrm@2 lint-staged
```

`package.json`에 `lint-staged`에 단계에서 수행할 목록에 대해서 정의해줍니다.

```json
/** package.json */

{
  ...
  "lint-staged": {
    "**/.{jsx, js, tsx, ts}": [
    "eslint --fix --max-warnings 0",
    ]
  }
}
```

`--max-warnings 0`은 eslint 실행이 waring의 개수가 0개여야 통과가 된다라는 뜻입니다.

---
## 7. 번외
번외에서는 꼭 필요한 설정은 아니지만 해두면 협업할 때 편할 수 있는 내용들을 포함해두려고 합니다.


### 7-1. Docker로 환경셋팅 없이 개발하기
대부분 `javascript`로 개발을 하는 개발자분들(주로 프론트엔드 개발자 또는 node 개발자)은 기본적으로 `node`가 설치되어 있어서 프로젝트를 `clone`한 뒤 자연스럽게 `npm install` 또는 `yarn install`을 사용해 프로젝트를 로컬에서 실행합니다. 

`javascript` 개발자분들을 제외한 다른 언어를 사용하는 분들은 대부분 `node`가 설치 안되어 있을 확률이 높습니다. 프론트엔드와 협업을 하는 팀에서 자신의 컴퓨터에서 UI를 확인하면서 테스트를 해보거나 개발을 하려할 때 `node` 개발환경을 셋팅을 해야하는 수고스러움이 생길 수 있습니다. `README`에 적힌대로 따라서 셋팅을 했다고 하더라도 실행이 안될 수도 있습니다.

또는 외부에서 급하게 확인을 해야하는 경우에도 높은 확률로 `node` 환경이 설치되어 있지 않을 겁니다. 

이러한 경우에 대비해서 `Docker`를 사용해서 개발환경을 설정해두고 `Docker`를 실행하는 것만으로도 바로 확인하고 코드 수정까지 가능하도록 해보려고 합니다.

<br />
이 프로젝트는 storybook 설정도 포함되어 있으므로 Docker compose를 사용해 보려합니다.

1. Docker compose 작성
  ```yml
  services:
    nextjs:
      # 컨테이너 이름. Docker가 실행될 때 프로젝트명-${ontainer_name}으로 붙으므로 
      # container_name에 따로 중복을 피하기 위해 프로젝트명을 넣지 않아도 됩니다.
      container_name: nextjs 
      build: # 이미지를 빌드하기 위한 Dockerfile이 위치하는 경로를 지정.
        # Dockerfile이란 이름이 아닌 다른 이름의 파일로 빌드하고 싶으면 아래와 같이 작성하면 됩니다.
        context: . # directory 경로.
        dockerfile: Dockerfile.dev # dockerfile 이름.
      volumes: # Docker 컨테이너 생명 주기와 상관없이 데이터를 저장하기 위해 사용합니다.
        - '.:/app'
        - '/app/node_modules'
      ports: # 컨테이너의 포트와 호스트를 맵핑.
        - '3000:3000'
      environment: # 환경 변수 설정
        - NODE_ENV=development
        - CHOKIDAR_USEPOLLING=true # App이 수정되었을 경우 Hot Reloading가 가능하도록 하는 설정입니다.

    storybook:
      container_name: storybook
      build:
        context: .
        dockerfile: Dockerfile.storybook
      volumes:
        - ./:/app
        - /app/node_modules
      ports:
        - '6006:6006'
      environment:
        - NODE_ENV=development
        - CHOKIDAR_USEPOLLING=true
  ```

  2. dockerfile 작성
  
  - nextjs

  ```docker
    FROM node:16.16

    WORKDIR /app

    ENV PATH /app/node_modules/.bin:$PATH

    COPY package.json /app/package.json
    RUN npm install --silent

    CMD ["npm", "run", "dev"]
  ```

  - storybook
  ```docker
    FROM node:16.16

    WORKDIR /app

    ENV PATH /app/node_modules/.bin:$PATH

    COPY package.json /app/package.json
    RUN npm install --silent

    CMD ["npm", "run", "storybook"]
  ```

  3. docker-compose 명령어로 실행

  ```bash
  docker-compose up -d --build
  ```

  
