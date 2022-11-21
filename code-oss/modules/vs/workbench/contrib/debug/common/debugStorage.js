/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { URI } from 'vs/base/common/uri';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ExceptionBreakpoint, Expression, Breakpoint, FunctionBreakpoint, DataBreakpoint } from 'vs/workbench/contrib/debug/common/debugModel';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
const DEBUG_BREAKPOINTS_KEY = 'debug.breakpoint';
const DEBUG_FUNCTION_BREAKPOINTS_KEY = 'debug.functionbreakpoint';
const DEBUG_DATA_BREAKPOINTS_KEY = 'debug.databreakpoint';
const DEBUG_EXCEPTION_BREAKPOINTS_KEY = 'debug.exceptionbreakpoint';
const DEBUG_WATCH_EXPRESSIONS_KEY = 'debug.watchexpressions';
const DEBUG_CHOSEN_ENVIRONMENTS_KEY = 'debug.chosenenvironment';
const DEBUG_UX_STATE_KEY = 'debug.uxstate';
let DebugStorage = class DebugStorage {
    storageService;
    textFileService;
    uriIdentityService;
    constructor(storageService, textFileService, uriIdentityService) {
        this.storageService = storageService;
        this.textFileService = textFileService;
        this.uriIdentityService = uriIdentityService;
    }
    loadDebugUxState() {
        return this.storageService.get(DEBUG_UX_STATE_KEY, 1 /* StorageScope.WORKSPACE */, 'default');
    }
    storeDebugUxState(value) {
        this.storageService.store(DEBUG_UX_STATE_KEY, value, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
    }
    loadBreakpoints() {
        let result;
        try {
            result = JSON.parse(this.storageService.get(DEBUG_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((breakpoint) => {
                return new Breakpoint(URI.parse(breakpoint.uri.external || breakpoint.source.uri.external), breakpoint.lineNumber, breakpoint.column, breakpoint.enabled, breakpoint.condition, breakpoint.hitCondition, breakpoint.logMessage, breakpoint.adapterData, this.textFileService, this.uriIdentityService);
            });
        }
        catch (e) { }
        return result || [];
    }
    loadFunctionBreakpoints() {
        let result;
        try {
            result = JSON.parse(this.storageService.get(DEBUG_FUNCTION_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((fb) => {
                return new FunctionBreakpoint(fb.name, fb.enabled, fb.hitCondition, fb.condition, fb.logMessage);
            });
        }
        catch (e) { }
        return result || [];
    }
    loadExceptionBreakpoints() {
        let result;
        try {
            result = JSON.parse(this.storageService.get(DEBUG_EXCEPTION_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((exBreakpoint) => {
                return new ExceptionBreakpoint(exBreakpoint.filter, exBreakpoint.label, exBreakpoint.enabled, exBreakpoint.supportsCondition, exBreakpoint.condition, exBreakpoint.description, exBreakpoint.conditionDescription);
            });
        }
        catch (e) { }
        return result || [];
    }
    loadDataBreakpoints() {
        let result;
        try {
            result = JSON.parse(this.storageService.get(DEBUG_DATA_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((dbp) => {
                return new DataBreakpoint(dbp.description, dbp.dataId, true, dbp.enabled, dbp.hitCondition, dbp.condition, dbp.logMessage, dbp.accessTypes, dbp.accessType);
            });
        }
        catch (e) { }
        return result || [];
    }
    loadWatchExpressions() {
        let result;
        try {
            result = JSON.parse(this.storageService.get(DEBUG_WATCH_EXPRESSIONS_KEY, 1 /* StorageScope.WORKSPACE */, '[]')).map((watchStoredData) => {
                return new Expression(watchStoredData.name, watchStoredData.id);
            });
        }
        catch (e) { }
        return result || [];
    }
    loadChosenEnvironments() {
        return JSON.parse(this.storageService.get(DEBUG_CHOSEN_ENVIRONMENTS_KEY, 1 /* StorageScope.WORKSPACE */, '{}'));
    }
    storeChosenEnvironments(environments) {
        this.storageService.store(DEBUG_CHOSEN_ENVIRONMENTS_KEY, JSON.stringify(environments), 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
    }
    storeWatchExpressions(watchExpressions) {
        if (watchExpressions.length) {
            this.storageService.store(DEBUG_WATCH_EXPRESSIONS_KEY, JSON.stringify(watchExpressions.map(we => ({ name: we.name, id: we.getId() }))), 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        else {
            this.storageService.remove(DEBUG_WATCH_EXPRESSIONS_KEY, 1 /* StorageScope.WORKSPACE */);
        }
    }
    storeBreakpoints(debugModel) {
        const breakpoints = debugModel.getBreakpoints();
        if (breakpoints.length) {
            this.storageService.store(DEBUG_BREAKPOINTS_KEY, JSON.stringify(breakpoints), 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        else {
            this.storageService.remove(DEBUG_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */);
        }
        const functionBreakpoints = debugModel.getFunctionBreakpoints();
        if (functionBreakpoints.length) {
            this.storageService.store(DEBUG_FUNCTION_BREAKPOINTS_KEY, JSON.stringify(functionBreakpoints), 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        else {
            this.storageService.remove(DEBUG_FUNCTION_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */);
        }
        const dataBreakpoints = debugModel.getDataBreakpoints().filter(dbp => dbp.canPersist);
        if (dataBreakpoints.length) {
            this.storageService.store(DEBUG_DATA_BREAKPOINTS_KEY, JSON.stringify(dataBreakpoints), 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        else {
            this.storageService.remove(DEBUG_DATA_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */);
        }
        const exceptionBreakpoints = debugModel.getExceptionBreakpoints();
        if (exceptionBreakpoints.length) {
            this.storageService.store(DEBUG_EXCEPTION_BREAKPOINTS_KEY, JSON.stringify(exceptionBreakpoints), 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
        else {
            this.storageService.remove(DEBUG_EXCEPTION_BREAKPOINTS_KEY, 1 /* StorageScope.WORKSPACE */);
        }
    }
};
DebugStorage = __decorate([
    __param(0, IStorageService),
    __param(1, ITextFileService),
    __param(2, IUriIdentityService)
], DebugStorage);
export { DebugStorage };
