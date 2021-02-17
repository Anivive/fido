const path = require('path');
const pathOutput = path.resolve(__dirname, 'dist');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const env = process.env.NODE_ENV;
const isProd = env === 'production';

const plugins = [
  new CopyPlugin({
    patterns: [
      {
        from: './public/index.html',
        to: pathOutput
      },
    ],
  }),
  new CopyPlugin({
    patterns: [
      {
        from: './public/images',
        to: pathOutput + '/images'
      },
    ],
  }),
  new CopyPlugin({
    patterns: [
      {
        from: './public/json',
        to: pathOutput + '/json'
      },
    ],
  }),
  new CopyPlugin({
    patterns: [
      {
        from: './public/audio',
        to: pathOutput + '/audio'
      },
    ],
  }),
  new CopyPlugin({
    patterns: [
      {
        from: './public/videos',
        to: pathOutput + '/videos'
      },
    ],
  }),
  new MiniCssExtractPlugin({
    filename: 'main.css'
  })
]

if (!isProd) {
  plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = {
  mode: isProd ? env : 'development',
  devServer: {
    contentBase: pathOutput,
    compress: true,
    port: 8080
  },
  entry: {
    app: './src/index.ts'
  },
  devtool: isProd ? 'source-map' : 'inline-source-map',
  output: {
    filename: 'main.js',
    path: pathOutput
  },
  optimization: {
    minimize: isProd,
    minimizer: [
      new HtmlMinimizerPlugin(),
      new CssMinimizerPlugin(),
      new TerserPlugin({
        extractComments: true,
      })
    ]
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [{
        exclude: /\.d\.ts/
      },
      {
        test: /\.html$/i,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.(glsl|vert|frag)$/,
        use: ['raw-loader', 'glslify-loader']
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      }
    ]
  },
  plugins
};