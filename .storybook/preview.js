import { withDesign } from 'storybook-addon-designs'
import { RouterContext } from 'next/dist/shared/lib/router-context'

import * as NextImage from 'next/image'

/** next/image 컴포넌트 사용 설정 */
const OriginalNextImage = NextImage.default

Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: (props) => <OriginalNextImage {...props} unoptimized />,
})

/** storybook-addon-designs 설정 */
export const decorators = [withDesign, (Story) => <Story />]

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    /** Doc 표시 설정 */
    expanded: true,
    /** No Controls 경고 감춤 설정 */
    hideNoControlsWarning: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },

  /** next router 설정 */
  nextRouter: {
    Provider: RouterContext.Provider,
  },
}
