'use strict';

const co = require( 'co' );
const named = require( 'vinyl-named' );
const gutil = require( 'gulp-util' );
const VinylFile = require( 'vinyl' );
const vinylFs = require( 'vinyl-fs' );
const MemoryFileSystem = require( 'memory-fs' );
const through = require( 'through' );
const ProgressPlugin = require( 'webpack/lib/ProgressPlugin' );
const webpack = require( 'webpack' );
const pathApi = require( 'path' );

const defaultStatsOptions = {
  colors: gutil.colors.supportsColor,
  hash: false,
  timings: false,
  chunks: false,
  chunkModules: false,
  modules: false,
  children: true,
  version: true,
  cached: false,
  cachedAssets: false,
  reasons: false,
  source: false,
  errorDetails: false
};

function prepareFile( fs, compiler, outname ) {
  let path = fs.join( compiler.outputPath, outname );
  if ( path.indexOf( '?' ) !== -1 ) {
    path = path.split( '?' )[ 0 ];
  }

  const contents = fs.readFileSync( path );

  const file = new VinylFile( {
    base: compiler.outputPath,
    path: path,
    contents: contents
  } );
  return file;
}

function packjs( options, resolve, reject ) {
  options = clone( options ) || {};
  const config = options.config || options;
  let callingDone = false;
  const done = ( err, stats ) => {
    if ( err ) {
      reject( err );
      return;
    }
    stats = stats || {};
    if ( options.quiet || callingDone ) {
      return;
    }

    // 如果是watch模式，就延迟500毫秒在完成
    if ( options.watch ) {
      callingDone = true;
      setTimeout( function () {
        callingDone = false;
      }, 500 );
    }

    if ( options.verbose ) {
      gutil.log( stats.toString( {
        colors: gutil.colors.supportsColor
      } ) );
    } else {
      var statsOptions = options && options.stats || {};

      Object.keys( defaultStatsOptions ).forEach( function ( key ) {
        if ( typeof statsOptions[ key ] === 'undefined' ) {
          statsOptions[ key ] = defaultStatsOptions[ key ];
        }
      } );

      gutil.log( stats.toString( statsOptions ) );
    }
  };

  let entry = [];
  const entries = Object.create( null );

  const stream = through( function ( file ) {
    if ( file.isNull() ) {
      return;
    }
    if ( 'relative' in file ) {
      let relative = file.relative;
      if ( file.relative === file.named + '.js' ) {
        let index = file.path.indexOf( 'controllers' );
        relative = file.path.slice( index + 12 );
      }
      let key = relative.slice( 0, -3 ).replace( /\\/g, '/' );
      if ( !Array.isArray( entries[ key ] ) ) {
        entries[ key ] = [];
      }
      entries[ key ].push( file.path );
    } else {
      entry = entry || [];
      entry.push( file.path );
    }
  }, function () {
    const self = this;
    const handleConfig = function ( config ) {
      config.output = config.output || {};
      config.watch = !!options.watch;

      // 如果入口文件数组只包含一组数据，就取第一个赋值
      if ( Object.keys( entries ).length > 0 ) {
        entry = entries;
        if ( !config.output.filename ) {
          // 补全配置信息output.filename
          config.output.filename = '[name].js';
        }
      } else if ( entry.length < 2 ) {
        entry = entry[ 0 ] || entry;
      }

      config.entry = config.entry || entry;
      config.output.path = config.output.path || process.cwd();
      config.output.filename = config.output.filename || '[hash].js';
      config.watch = options.watch;
      entry = [];

      //没有匹配到文件就结束
      if ( !config.entry || config.entry.length < 1 ) {
        gutil.log( 'No files can be packaged' );
        self.emit( 'end' );
        return false;
      }
      return true;
    };

    let succeeded;
    if ( Array.isArray( config ) ) {
      for ( let i = 0; i < config.length; i += 1 ) {
        succeeded = handleConfig( config[ i ] );
        if ( !succeeded ) {
          return false;
        }
      }
    } else {
      succeeded = handleConfig( config );
      if ( !succeeded ) {
        return false;
      }
    }

    const compiler = webpack( config, function ( err, stats ) {
      if ( err ) {
        self.emit( 'error', new gutil.PluginError( 'packjs', err ) );
      }
      const jsonStats = stats.toJson() || {};
      const errors = jsonStats.errors || [];
      if ( errors.length ) {
        const errorMessage = errors.reduce( function ( resultMessage, nextError ) {
          resultMessage += nextError.toString();
          return resultMessage;
        }, '' );
        self.emit( 'error', new gutil.PluginError( 'packjs', errorMessage ) );
      }
      if ( !options.watch ) {
        self.queue( null );
      }
      done( err, stats );
      if ( options.watch && !options.quiet ) {
        gutil.log( 'webpack is watching for changes' );
      }
    } );

    const handleCompiler = function ( compiler ) {
      // 如果是watch模式，我们用compiler里面的compiler对象
      if ( options.watch && compiler.compiler ) {
        compiler = compiler.compiler;
      }

      if ( options.progress ) {
        compiler.apply( new ProgressPlugin( function ( percentage, msg ) {
          percentage = Math.floor( percentage * 100 );
          msg = percentage + '% ' + msg;
          if ( percentage < 10 ) {
            msg = ' ' + msg;
          }
          gutil.log( 'progress... ', msg );
        } ) );
      }

      const fs = compiler.outputFileSystem = new MemoryFileSystem();

      compiler.plugin( 'after-emit', function ( compilation, callback ) {
        Object.keys( compilation.assets ).forEach( function ( outname ) {
          if ( compilation.assets[ outname ].emitted ) {
            const file = prepareFile( fs, compiler, outname );
            self.queue( file );
          }
        } );
        callback();
      } );
    };

    if ( Array.isArray( options.config ) && options.watch ) {
      compiler.watchings.forEach( function ( compiler ) {
        handleCompiler( compiler );
      } );
    } else if ( Array.isArray( options.config ) ) {
      compiler.compilers.forEach( function ( compiler ) {
        handleCompiler( compiler );
      } );
    } else {
      handleCompiler( compiler );
    }
  } );

  // 如果有配置entry，编译完成后结束任务
  var hasEntry = Array.isArray( config ) ? config.some( ( c ) => c.entry ) : config.entry;
  if ( hasEntry ) {
    stream.end();
  }

  return stream;
};

const config = require( '../../../conf/webpack-config' );
const buildTask = co.wrap( function* ( src, dest, options ) {
  return yield new Promise( ( resolve, reject ) => {
    gutil.log( 'Starting "packjs" task', src );
    vinylFs.src( src )
      .pipe( named() )
      .pipe( packjs( Object.assign( {}, config, options ) ) )
      .on( 'error', function ( err ) {
        gutil.log( 'Running "packjs" task but throw a Error', err );
        reject( err );
      } )
      .on( 'end', function () {
        gutil.log( 'Finished "packjs" task' );
        setTimeout( function () {
          resolve();
        }, 100 );
      } )
      .pipe( vinylFs.dest( dest ) );
  } );
} );

exports.development = ( src, dest ) => {
  return buildTask( src, dest, {
    progress: true,
    watch: true
  } );
};

exports.production = ( src, dest ) => {
  return buildTask( src, dest, {
    // devtool: '#inline-source-map'
    progress: true,
    devtool: undefined,
    output: {
      path: '',
      publicPath: '/js/',
      filename: '[name].js',
      chunkFilename: '[id].chunk.js'
    }
  } );
};

exports.qa = ( src, dest ) => {
  return buildTask( src, dest, {
    progress: true,
    devtool: '#source-map',
    output: {
      path: '',
      publicPath: '/js/',
      filename: '[name].js',
      chunkFilename: '[id].chunk.js'
    }
  } );
};