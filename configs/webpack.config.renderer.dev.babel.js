/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import chalk from 'chalk';
import { merge } from 'webpack-merge';
import { spawn, execSync } from 'child_process';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackHarddiskPlugin from 'html-webpack-harddisk-plugin';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === 'production') {
  CheckNodeEnv('development');
}

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
const dll = path.join(__dirname, '..', 'dll');
const manifest = path.resolve(dll, 'renderer.json');
const requiredByDLLConfig = module.parent.filename.includes(
  'webpack.config.renderer.dev.dll'
);

// const CompressionWebpackPlugin = require('compression-webpack-plugin');

/**
 * Warn if the DLL is not built
 */
if (!requiredByDLLConfig && !(fs.existsSync(dll) && fs.existsSync(manifest))) {
  console.log(
    chalk.black.bgYellow.bold(
      'The DLL files are missing. Sit back while we build them for you with "yarn build-dll"'
    )
  );
  execSync('yarn build-dll');
}

/**
 * webpack 详解
 * https://github.com/sisterAn/blog/issues/68
 */

export default merge(baseConfig, {
  devtool: 'inline-source-map',

  mode: 'development',

  target: 'electron-renderer',

  /**
   * webpack-dev-server 的inline模式
   * https://segmentfault.com/a/1190000006964335
   */
  entry: {
    appMain: [
      'core-js',
      'regenerator-runtime/runtime',
      ...(process.env.PLAIN_HMR ? [] : ['react-hot-loader/patch']),
      `webpack-dev-server/client?http://localhost:${port}/`,
      'webpack/hot/only-dev-server',
      require.resolve('../app/appMain/index.tsx'),
    ],
    appWin: [
      ...(process.env.PLAIN_HMR ? [] : ['react-hot-loader/patch']),
      `webpack-dev-server/client?http://localhost:${port}/`,
      'webpack/hot/only-dev-server',
      require.resolve('../app/appWin/index.tsx'),
    ],
    appLogin: [
      ...(process.env.PLAIN_HMR ? [] : ['react-hot-loader/patch']),
      `webpack-dev-server/client?http://localhost:${port}/`,
      'webpack/hot/only-dev-server',
      require.resolve('../app/appLogin/index.tsx'),
    ],
  },

  output: {
    publicPath: `http://localhost:${port}/dist/`,
    filename: 'renderer.[name].js',
  },

  module: {
    rules: [
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]',
              },
              sourceMap: true,
              importLoaders: 1,
            },
          },
        ],
      },
      // SASS support - compile all .global.scss files and pipe it to style.css
      // {
      //   test: /\.module\.(scss|sass)$/,
      //   use: [
      //     {
      //       loader: 'style-loader',
      //     },
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         modules: {
      //           localIdentName: '[name]__[local]__[hash:base64:5]',
      //         },
      //         sourceMap: true,
      //         importLoaders: 1
      //       }
      //     },
      //     {
      //       loader: 'sass-loader',
      //     },
      //     {
      //       loader: 'sass-resources-loader',
      //       options: {
      //         resources: [path.join(__dirname, '../app/styles/mixin.scss')]
      //       }
      //     }
      //   ],
      // },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
          },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: [path.join(__dirname, '../app/styles/mixin.scss')],
            },
          },
        ],
      },
      // SASS support - compile all other .scss files and pipe it to style.css
      // {
      //   test: /^((?!\.global).)*\.(scss|sass)$/,
      //   use: [
      //     {
      //       loader: 'style-loader'
      //     },
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         modules: {
      //           localIdentName: '[name]__[local]__[hash:base64:5]',
      //         },
      //         sourceMap: true,
      //         importLoaders: 1
      //       }
      //     },
      //     {
      //       loader: 'sass-loader'
      //     },
      //     {
      //       loader: 'sass-resources-loader',
      //       options: {
      //         resources: [path.join(__dirname, '../app/styles/mixin.scss')]
      //       }
      //     }
      //   ],
      // },
      // {
      //   test: /\.styl(us)?$/,
      //   use: [
      //     {
      //       loader: 'style-loader',
      //     },
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         // modules: {
      //         //   localIdentName: '[name]__[local]__[hash:base64:5]',
      //         // },
      //         sourceMap: true,
      //         importLoaders: 1,
      //       },
      //     },
      //     {
      //       loader: 'stylus-loader',
      //       options: {
      //         import: [path.join(__dirname, '../app/styles/mixin.styl')], //你公共样式存放的位置
      //         // paths: [] //公共样式文件位置
      //       },
      //     },
      //   ],
      // },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream',
          },
        },
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader',
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          },
        },
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader',
      },
    ],
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  plugins: [
    requiredByDLLConfig
      ? null
      : new webpack.DllReferencePlugin({
          context: path.join(__dirname, '..', 'dll'),
          manifest: require(manifest),
          sourceType: 'var',
        }),

    new webpack.HotModuleReplacementPlugin({
      multiStep: true,
    }),

    new HtmlWebpackPlugin({
      filename: 'pages/index.html',
      template: path.resolve(__dirname, '../templates/index.html'),
      chunks: ['appMain'],
      alwaysWriteToDisk: true, // 配合html-webpack-harddisk-plugin插件始终将生成的文件输出到指定目录
    }),

    new HtmlWebpackPlugin({
      filename: 'pages/window.html',
      template: path.resolve(__dirname, '../templates/window.html'),
      chunks: ['appWin'],
      alwaysWriteToDisk: true, // 配合html-webpack-harddisk-plugin插件始终将生成的文件输出到指定目录
    }),

    new HtmlWebpackPlugin({
      filename: 'pages/login.html',
      template: path.resolve(__dirname, '../templates/login.html'),
      chunks: ['appLogin'],
      alwaysWriteToDisk: true, // 配合html-webpack-harddisk-plugin插件始终将生成的文件输出到指定目录
    }),

    new HtmlWebpackHarddiskPlugin(),

    // new CompressionWebpackPlugin({
    //   filename: '[path][base].gz',
    //   algorithm: 'gzip',
    //   compressionOptions: {
    //     level: 1
    //   },
    //   test: new RegExp('\\.(' + ['js', 'css'].join('|') + ')$'),
    //   threshold: 10240,
    //   minRatio: 0.8,
    // }),

    new webpack.NoEmitOnErrorsPlugin(),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     *
     * By default, use 'development' as NODE_ENV. This can be overriden with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  devServer: {
    port,
    publicPath,
    compress: true,
    noInfo: false,
    stats: 'errors-only',
    inline: true,
    lazy: false,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: path.join(__dirname, 'dist'),
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100,
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
    },
    before() {
      if (process.env.START_HOT) {
        console.log('Starting Main Process...');
        spawn('npm', ['run', 'start-main-dev'], {
          shell: true,
          env: process.env,
          stdio: 'inherit',
        })
          .on('close', (code) => process.exit(code))
          .on('error', (spawnError) => console.error(spawnError));
      }
    },
  },
});
