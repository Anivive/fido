const path = require('path');
const pathOutput = path.resolve(__dirname, 'dist');
const TerserPlugin = require('terser-webpack-plugin');

const app = process.env.APP;

const core = [
  './src/Ease.ts',
  './src/Marker.ts',
  './src/PlayMode.ts',
  './src/Keyframe.ts',
  './src/Timeline.ts'
];

const composition = core.concat([
  './src/layers/Layer.ts',
  './src/layers/LayerAudio.ts',
  './src/layers/LayerImage.ts',
  './src/layers/LayerShape.ts',
  './src/layers/LayerText.ts',
  './src/layers/LayerVideo.ts',
  './src/layers/Composition.ts',
]);

const three = composition.concat([
  './src/three/geometry/TextGeometry.ts',
  './src/three/geometry/ThreeLineGeometry.ts',
  './src/three/materials/StrokeMaterial.ts',
  './src/three/materials/TextMaterial.ts',
  './src/three/mesh/TextMesh.ts',
  './src/three/layers/ThreeLayer.ts',
  './src/three/layers/ThreeImage.ts',
  './src/three/layers/ThreeShape.ts',
  './src/three/layers/ThreeText.ts',
  './src/three/layers/ThreeVideo.ts',
  './src/three/layers/ThreeComposition.ts',
]);

let entryApp = core;
if (app === 'composition') {
  entryApp = composition;
} else if (app === 'three') {
  entryApp = three;
}

module.exports = {
  mode: 'none',
  entry: {
    app: {
      import: entryApp
    }
  },
  devtool: 'source-map',
  output: {
    filename: 'fido-' + app + '.js',
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
  externals: {
    three: 'three'
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