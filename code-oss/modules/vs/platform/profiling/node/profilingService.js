/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { generateUuid } from 'vs/base/common/uuid';
export class InspectProfilingService {
    _serviceBrand;
    _sessions = new Map();
    async startProfiling(options) {
        const prof = await import('v8-inspect-profiler');
        const session = await prof.startProfiling({ port: options.port, checkForPaused: true });
        const id = generateUuid();
        this._sessions.set(id, session);
        return id;
    }
    async stopProfiling(sessionId) {
        const session = this._sessions.get(sessionId);
        if (!session) {
            throw new Error(`UNKNOWN session '${sessionId}'`);
        }
        const result = await session.stop();
        this._sessions.delete(sessionId);
        return result.profile;
    }
}
