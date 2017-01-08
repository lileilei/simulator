'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

module.exports = {

  loadServices( filePath ) {
    const DIR = path.join( __dirname, '../', filePath );
    const services = {};

    ( fs.readdirSync( DIR ) || [] ).forEach( ( file ) => {
      let fileNameParser = path.parse( file );
      if ( fileNameParser.ext === '.js' ) {
        let name = fileNameParser.name;
        services[ name ] = require( path.join( DIR, file ) );
      }
    } );

    return services;
  }

};