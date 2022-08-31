/** 절대경로 설정 */
const path = require('path')
const ROOT = process.cwd()
const { svgrOptions, fileLoaderOptions } = require('../.svgrrc.js')

module.exports = {
  stories: [
    // '../stories/**/*.stories.mdx',
    // '../stories/**/*.stories.@(js|jsx|ts|tsx)',
    '../**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    {
      name: 'storybook-addon-next',
      options: {
        nextConfigPath: path.resolve(__dirname, '../next.config.js'),
      },
    },
    '@storybook/addon-a11y',
    'storybook-addon-designs',
    'storybook-addon-next-router',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5',
  },
  /** 사용자 정의 */
  webpackFinal: async (config) => {
    /** svgr 사용 할 수 있도록 */
    const fileLoaderRule = config.module.rules.find(
      (rule) => !Array.isArray(rule.test) && rule.test.test('.svg'),
    )

    fileLoaderRule.exclude = /\.svg$/

    config.module.rules.unshift({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: svgrOptions,
        },
        {
          loader: 'file-loader',
          options: fileLoaderOptions,
        },
      ],
    })

    /** 절대경로 설정 */
    config.resolve.alias = {
      '@/': path.resolve(ROOT, './'),
    }

    return { ...config }
  },
  /** 정적 에셋 (public 폴더) 설정 */
  staticDirs: ['../public'],
}
