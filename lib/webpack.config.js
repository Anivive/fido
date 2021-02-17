const path = require('path');
const pathOutput = path.resolve(__dirname, 'dist');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    app: './src/index.ts'
  },
  devtool: 'source-map',
  output: {
    filename: 'main.js',
    path: pathOutput
  },
  optimization: {
    minimize: true,
    minimizer: [
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
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.(glsl|vert|frag)$/,
        use: ['raw-loader', 'glslify-loader']
      },
    ]
  }
};