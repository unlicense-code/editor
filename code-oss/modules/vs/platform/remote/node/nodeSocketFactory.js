/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as net from 'net';
import { NodeSocket } from 'vs/base/parts/ipc/node/ipc.net';
export const nodeSocketFactory = new class {
    connect(host, port, path, query, debugLabel, callback) {
        const errorListener = (err) => callback(err, undefined);
        const socket = net.createConnection({ host: host, port: port }, () => {
            socket.removeListener('error', errorListener);
            // https://tools.ietf.org/html/rfc6455#section-4
            const buffer = Buffer.alloc(16);
            for (let i = 0; i < 16; i++) {
                buffer[i] = Math.round(Math.random() * 256);
            }
            const nonce = buffer.toString('base64');
            const headers = [
                `GET ws://${/:/.test(host) ? `[${host}]` : host}:${port}${path}?${query}&skipWebSocketFrames=true HTTP/1.1`,
                `Connection: Upgrade`,
                `Upgrade: websocket`,
                `Sec-WebSocket-Key: ${nonce}`
            ];
            socket.write(headers.join('\r\n') + '\r\n\r\n');
            const onData = (data) => {
                const strData = data.toString();
                if (strData.indexOf('\r\n\r\n') >= 0) {
                    // headers received OK
                    socket.off('data', onData);
                    callback(undefined, new NodeSocket(socket, debugLabel));
                }
            };
            socket.on('data', onData);
        });
        // Disable Nagle's algorithm.
        socket.setNoDelay(true);
        socket.once('error', errorListener);
    }
};
