const webpack = require('webpack');
const cssnano = require('cssnano');
const glob = require('glob');
const path = require('path');

const WebpackBar = require('webpackbar');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ConcatPlugin = require('webpack-concat-plugin');

const config = require('./site.config');

// Hot module replacement
const hmr = new webpack.HotModuleReplacementPlugin();

// Optimize CSS assets
const optimizeCss = new OptimizeCssAssetsPlugin({
  assetNameRegExp: /\.css$/g,
  cssProcessor: cssnano,
  cssProcessorPluginOptions: {
    preset: [
      'default',
      {
        discardComments: {
          removeAll: true,
        },
      },
    ],
  },
  canPrint: true,
});

// Clean webpack
const clean = new CleanWebpackPlugin();

// Stylelint
const stylelint = new StyleLintPlugin();

// Extract CSS
const cssExtract = new MiniCssExtractPlugin({
  filename: 'bct.min.css',
});

// HTML generation
const paths = [];
const generateHTMLPlugins = () => glob.sync('./src/*.html').map((dir) => {
  const filename = path.basename(dir);

  if (filename !== '404.html') {
    paths.push(filename);
  }

  return new HTMLWebpackPlugin({
    filename,
    template: path.join(config.root, config.paths.src, filename),
    meta: {
      viewport: config.viewport,
    },
  });
});

const concatBCTJS = new ConcatPlugin({
  uglify: true,
  sourceMap: false,
  name: 'bct',
  outputPath: '',
  fileName: '[name].min.js',
  filesToConcat: [
    './js/matrix-bootstrap.min.js',
    './js/fontawesome-iconpicker.js',
    './js/bct.js'
  ],
  attributes: {
    async: false
  }
});

const concatBCTJSLoader = new ConcatPlugin({
  uglify: false,
  sourceMap: false,
  name: 'bct-loader',
  outputPath: '',
  fileName: '[name].js',
  filesToConcat: [
    './js/bct-loader.js'
  ],
  attributes: {
    async: false
  }
});

// Webpack bar
const webpackBar = new WebpackBar({
  color: '#ff6469',
});

module.exports = [
  clean,
  stylelint,
  cssExtract,
  ...generateHTMLPlugins(),
  concatBCTJS,
  concatBCTJSLoader,
  config.env === 'production' && optimizeCss,
  webpackBar,
  config.env === 'development' && hmr,
].filter(Boolean);
