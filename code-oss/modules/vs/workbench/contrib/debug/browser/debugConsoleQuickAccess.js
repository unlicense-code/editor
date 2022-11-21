var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { matchesFuzzy } from 'vs/base/common/filters';
import { localize } from 'vs/nls';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { PickerQuickAccessProvider } from 'vs/platform/quickinput/browser/pickerQuickAccess';
import { IViewsService } from 'vs/workbench/common/views';
import { DEBUG_CONSOLE_QUICK_ACCESS_PREFIX, SELECT_AND_START_ID } from 'vs/workbench/contrib/debug/browser/debugCommands';
import { IDebugService, REPL_VIEW_ID } from 'vs/workbench/contrib/debug/common/debug';
let DebugConsoleQuickAccess = class DebugConsoleQuickAccess extends PickerQuickAccessProvider {
    _debugService;
    _viewsService;
    _commandService;
    constructor(_debugService, _viewsService, _commandService) {
        super(DEBUG_CONSOLE_QUICK_ACCESS_PREFIX, { canAcceptInBackground: true });
        this._debugService = _debugService;
        this._viewsService = _viewsService;
        this._commandService = _commandService;
    }
    _getPicks(filter, disposables, token) {
        const debugConsolePicks = [];
        this._debugService.getModel().getSessions(true).filter(s => s.hasSeparateRepl()).forEach((session, index) => {
            const pick = this._createPick(session, index, filter);
            if (pick) {
                debugConsolePicks.push(pick);
            }
        });
        if (debugConsolePicks.length > 0) {
            debugConsolePicks.push({ type: 'separator' });
        }
        const createTerminalLabel = localize("workbench.action.debug.startDebug", "Start a New Debug Session");
        debugConsolePicks.push({
            label: `$(plus) ${createTerminalLabel}`,
            ariaLabel: createTerminalLabel,
            accept: () => this._commandService.executeCommand(SELECT_AND_START_ID)
        });
        return debugConsolePicks;
    }
    _createPick(session, sessionIndex, filter) {
        const label = session.name;
        const highlights = matchesFuzzy(filter, label, true);
        if (highlights) {
            return {
                label,
                highlights: { label: highlights },
                accept: (keyMod, event) => {
                    this._debugService.focusStackFrame(undefined, undefined, session, { explicit: true });
                    if (!this._viewsService.isViewVisible(REPL_VIEW_ID)) {
                        this._viewsService.openView(REPL_VIEW_ID, true);
                    }
                }
            };
        }
        return undefined;
    }
};
DebugConsoleQuickAccess = __decorate([
    __param(0, IDebugService),
    __param(1, IViewsService),
    __param(2, ICommandService)
], DebugConsoleQuickAccess);
export { DebugConsoleQuickAccess };
