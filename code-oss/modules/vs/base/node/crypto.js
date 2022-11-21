/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as crypto from 'crypto';
import * as fs from 'fs';
import { once } from 'vs/base/common/functional';
export async function checksum(path, sha1hash) {
    const checksumPromise = new Promise((resolve, reject) => {
        const input = fs.createReadStream(path);
        const hash = crypto.createHash('sha1');
        input.pipe(hash);
        const done = once((err, result) => {
            input.removeAllListeners();
            hash.removeAllListeners();
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
        input.once('error', done);
        input.once('end', done);
        hash.once('error', done);
        hash.once('data', (data) => done(undefined, data.toString('hex')));
    });
    const hash = await checksumPromise;
    if (hash !== sha1hash) {
        throw new Error('Hash mismatch');
    }
}
