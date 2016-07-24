var debug = $( 'debug' )( 'ifttt:console' );

function buildCommand( fields ) {
    if( fields.host )
        fields.command = '/usr/bin/ssh ' + ( fields.privateKey && '-i ' + fields.privateKey + ' ' ) + fields.user + '@' + fields.host + ' \'' + fields.command.replace( /'/g, "'\"'\"'" ) + '\'';
    debug( fields.command )
}

module.exports = {
    name: "console", "triggers": [ {
        name: "on data", fields: [ { name: "tty", displayName: "Which input should be watched" }], when: function( fields, callback ) {
            $( 'fs' ).createReadStream( fields.tty ).on( 'data', function( data ) {
                callback( { data: data })
            });
        }
    }, {
        name: "run", fields: [ { name: "command", displayName: "Commande" }, { name: "host", displayName: "Hôte" }, { name: "user", displayName: "Utilisateur" }, { name: "asJson", displayName: "As JSON" }, { name: "privateKey", displayName: "Private Key" }], when: function( fields, callback ) {

            buildCommand( fields );
            var cp = $( 'child_process' ).exec( fields.command );
            cp.stdout.setEncoding( 'ascii' );
            var chunk = '';
            cp.stdout.on( 'data', function( data ) {
                data = chunk + data;
                for( var line of data.split( '\n' ) ) {
                    chunk = '';
                    if( line && line.length > 0 )
                        if( fields.asJson ) {
                            try {
                                callback( JSON.parse( line ) );
                            }
                            catch( e ) {
                                chunk = line;
                                debug( e );
                            }
                        }
                        else
                            callback( { line: line });
                }
            })
        }
        }], "actions": [ {
            name: "log on console", fields: [ { name: "message", displayName: "What's Happening ?" }], delegate: function( fields ) {
                var result = function( fields ) {
                    debug( fields.message );
                };
                result.fields = fields;
                return result;
            }
        }, {
            name: "run", fields: [ { name: "command", displayName: "Commande" }, { name: "host", displayName: "Hôte" }, { name: "user", displayName: "Utilisateur" }], delegate: function( fields ) {
                var result = function( fields, trigger, complete ) {
                    buildCommand( fields );
                    $( 'child_process' ).exec( fields.command, { maxBuffer: 1024 * 1024 }, function( error, stdout, stderr ) {
                        debug( stdout );
                        debug( stderr );
                        if( error )
                            debug( error );
                    }).on( 'exit', function() {
                        if( complete )
                            complete();
                    });
                };
                result.fields = fields;
                return result;
            }
            }, ]
}