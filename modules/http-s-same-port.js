/**
 * Allows to listen on eg: 443 for http and and https requests
 * this filters the first byte to detect https and http traffic.
 */
const http = await import('node:http');
const https = await import('node:https');
const onError = (_err) => {};

class httpSServer extends https.Server {
    constructor(tlsconfig, requestListener) {
        super(tlsconfig, requestListener);
      
        if (typeof tlsconfig === 'function') {
          requestListener = tlsconfig;
          tlsconfig = undefined;
        }
      
        if (typeof tlsconfig === 'object') {
          this.removeAllListeners('connection');
      
          // capture https socket handler, it's not exported 
          // like http's socket handler
          var connev = this._events.connection;
          if (typeof connev === 'function')
            this._tlsHandler = connev;
          else
            this._tlsHandler = connev[connev.length - 1];
          this.removeListener('connection', this._tlsHandler);
      
          this._connListener = connectionListener;
          this.on('connection', connectionListener);
      
          // copy from http.Server
          this.timeout = 2 * 60 * 1000;
          this.allowHalfOpen = true;
          this.httpAllowHalfOpen = false;
        } else {
            http.Server.call(this, requestListener);
        }
          
        this.__httpSocketHandler = http._connectionListener
    }
    setTimeout(msecs, callback) {
        this.timeout = msecs;
        (callback) && this.on('timeout', callback);
    }
    connectionListener(socket) {
        const data = socket.read(1);
        if (data === null) {
          socket.removeListener('error', onError);
          socket.on('error', onError);
    
          socket.once('readable', () => {
            this._connListener(socket);
          });
        } else {
          socket.removeListener('error', onError);
    
          var firstByte = data[0];
          socket.unshift(data);
          if (firstByte < 32 || firstByte >= 127) {
            // tls/ssl
            this._tlsHandler(socket);
          } else
            this.__httpSocketHandler(socket);
        }
    }
}

const createServer = (tlsconfig, requestListener) =>
    new httpSServer(tlsconfig, requestListener);

export { httpSServer, createServer };