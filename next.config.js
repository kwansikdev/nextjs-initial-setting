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
