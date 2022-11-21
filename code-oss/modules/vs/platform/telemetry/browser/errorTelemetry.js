/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ErrorNoTelemetry } from 'vs/base/common/errors';
import { toDisposable } from 'vs/base/common/lifecycle';
import { globals } from 'vs/base/common/platform';
import BaseErrorTelemetry from 'vs/platform/telemetry/common/errorTelemetry';
export default class ErrorTelemetry extends BaseErrorTelemetry {
    installErrorListeners() {
        let oldOnError;
        const that = this;
        if (typeof globals.onerror === 'function') {
            oldOnError = globals.onerror;
        }
        globals.onerror = function (message, filename, line, column, e) {
            that._onUncaughtError(message, filename, line, column, e);
            oldOnError?.apply(this, arguments);
        };
        this._disposables.add(toDisposable(() => {
            if (oldOnError) {
                globals.onerror = oldOnError;
            }
        }));
    }
    _onUncaughtError(msg, file, line, column, err) {
        const data = {
            callstack: msg,
            msg,
            file,
            line,
            column
        };
        if (err) {
            // If it's the no telemetry error it doesn't get logged
            if (ErrorNoTelemetry.isErrorNoTelemetry(err)) {
                return;
            }
            const { name, message, stack } = err;
            data.uncaught_error_name = name;
            if (message) {
                data.uncaught_error_msg = message;
            }
            if (stack) {
                data.callstack = Array.isArray(err.stack)
                    ? err.stack = err.stack.join('\n')
                    : err.stack;
            }
        }
        this._enqueue(data);
    }
}
