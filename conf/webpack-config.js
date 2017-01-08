'use strict';

const pathApi = require( 'path' );
const webpack = require( 'webpack' );
const stylus = require( 'stylus' );
const cfgUtil = require( '../server/utils/configuration' );

const serverCfg = cfgUtil.get( 'server' );
const localsCfg = cfgUtil.get( 'locals' );

const JS2SDIR = serverCfg.CLIENT_DIR + '/js';
const CSSDIR = serverCfg.CLIENT_DIR + '/css';

const webpackConfig = {
  context: serverCfg.CLIENT_DIR,
  output: {
    path: pathApi.join( serverCfg.STATIC_DIR, localsCfg.DYN_JS_PATH ),
    publicPath: localsCfg.DYN_JS_PATH,
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  },
  resolve: {
    modulesDirectories: [ 'node_modules', 'public/components' ],
    alias: {
      js: JS2SDIR,
      css: CSSDIR
    }
  },
  module: {
    loaders: [ {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel'
    }, {
      test: /\.css$/,
      loader: 'style!css'
    }, {
      test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
      loader: 'file'
    }, {
      test: /\.styl$/,
      loader: 'style!css!stylus'
    }, {
      test: /\.(png|jpg|gif)$/,
      loader: 'file?name=[name].[ext]?[hash]'
    } ],
    noParse: []
  },
  stylus: {
    use: [ require( 'nib' )() ],
    import: [ '~nib/lib/nib/index.styl' ],
    define: {
      '$STATIC_PATH': localsCfg.STATIC_PATH,
      'inline-url': stylus.url( {
        paths: [ serverCfg.STATIC_DIR ]
      } )
    }
  },
  babel: {
    presets: [ 'es2015', 'stage-0' ],
    plugins: [ 'transform-runtime' ]
  },
  devtool: 'eval',
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ResolverPlugin( [
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin( 'bower.json', [ 'main' ] )
    ], [ 'normal', 'loader' ] ),
    new webpack.ContextReplacementPlugin( /moment[\/\\]locale$/, /zh-cn/ )
  ]
};

if ( serverCfg.NODE_ENV !== 'development' ) {
  webpackConfig.plugins.push( new webpack.optimize.UglifyJsPlugin( {
    compress: {
      warnings: false
    }
  } ) );
}

module.exports = webpackConfig;