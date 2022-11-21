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
import 'vs/css!./media/exceptionWidget';
import * as nls from 'vs/nls';
import * as dom from 'vs/base/browser/dom';
import { ZoneWidget } from 'vs/editor/contrib/zoneWidget/browser/zoneWidget';
import { EDITOR_CONTRIBUTION_ID } from 'vs/workbench/contrib/debug/common/debug';
import { RunOnceScheduler } from 'vs/base/common/async';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { registerColor } from 'vs/platform/theme/common/colorRegistry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { LinkDetector } from 'vs/workbench/contrib/debug/browser/linkDetector';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { Action } from 'vs/base/common/actions';
import { widgetClose } from 'vs/platform/theme/common/iconRegistry';
const $ = dom.$;
// theming
const debugExceptionWidgetBorder = registerColor('debugExceptionWidget.border', { dark: '#a31515', light: '#a31515', hcDark: '#a31515', hcLight: '#a31515' }, nls.localize('debugExceptionWidgetBorder', 'Exception widget border color.'));
const debugExceptionWidgetBackground = registerColor('debugExceptionWidget.background', { dark: '#420b0d', light: '#f1dfde', hcDark: '#420b0d', hcLight: '#f1dfde' }, nls.localize('debugExceptionWidgetBackground', 'Exception widget background color.'));
let ExceptionWidget = class ExceptionWidget extends ZoneWidget {
    exceptionInfo;
    debugSession;
    instantiationService;
    backgroundColor;
    constructor(editor, exceptionInfo, debugSession, themeService, instantiationService) {
        super(editor, { showFrame: true, showArrow: true, isAccessible: true, frameWidth: 1, className: 'exception-widget-container' });
        this.exceptionInfo = exceptionInfo;
        this.debugSession = debugSession;
        this.instantiationService = instantiationService;
        this.applyTheme(themeService.getColorTheme());
        this._disposables.add(themeService.onDidColorThemeChange(this.applyTheme.bind(this)));
        this.create();
        const onDidLayoutChangeScheduler = new RunOnceScheduler(() => this._doLayout(undefined, undefined), 50);
        this._disposables.add(this.editor.onDidLayoutChange(() => onDidLayoutChangeScheduler.schedule()));
        this._disposables.add(onDidLayoutChangeScheduler);
    }
    applyTheme(theme) {
        this.backgroundColor = theme.getColor(debugExceptionWidgetBackground);
        const frameColor = theme.getColor(debugExceptionWidgetBorder);
        this.style({
            arrowColor: frameColor,
            frameColor: frameColor
        }); // style() will trigger _applyStyles
    }
    _applyStyles() {
        if (this.container) {
            this.container.style.backgroundColor = this.backgroundColor ? this.backgroundColor.toString() : '';
        }
        super._applyStyles();
    }
    _fillContainer(container) {
        this.setCssClass('exception-widget');
        // Set the font size and line height to the one from the editor configuration.
        const fontInfo = this.editor.getOption(45 /* EditorOption.fontInfo */);
        container.style.fontSize = `${fontInfo.fontSize}px`;
        container.style.lineHeight = `${fontInfo.lineHeight}px`;
        container.tabIndex = 0;
        const title = $('.title');
        const label = $('.label');
        dom.append(title, label);
        const actions = $('.actions');
        dom.append(title, actions);
        label.textContent = this.exceptionInfo.id ? nls.localize('exceptionThrownWithId', 'Exception has occurred: {0}', this.exceptionInfo.id) : nls.localize('exceptionThrown', 'Exception has occurred.');
        let ariaLabel = label.textContent;
        const actionBar = new ActionBar(actions);
        actionBar.push(new Action('editor.closeExceptionWidget', nls.localize('close', "Close"), ThemeIcon.asClassName(widgetClose), true, async () => {
            const contribution = this.editor.getContribution(EDITOR_CONTRIBUTION_ID);
            contribution?.closeExceptionWidget();
        }), { label: false, icon: true });
        dom.append(container, title);
        if (this.exceptionInfo.description) {
            const description = $('.description');
            description.textContent = this.exceptionInfo.description;
            ariaLabel += ', ' + this.exceptionInfo.description;
            dom.append(container, description);
        }
        if (this.exceptionInfo.details && this.exceptionInfo.details.stackTrace) {
            const stackTrace = $('.stack-trace');
            const linkDetector = this.instantiationService.createInstance(LinkDetector);
            const linkedStackTrace = linkDetector.linkify(this.exceptionInfo.details.stackTrace, true, this.debugSession ? this.debugSession.root : undefined);
            stackTrace.appendChild(linkedStackTrace);
            dom.append(container, stackTrace);
            ariaLabel += ', ' + this.exceptionInfo.details.stackTrace;
        }
        container.setAttribute('aria-label', ariaLabel);
    }
    _doLayout(_heightInPixel, _widthInPixel) {
        // Reload the height with respect to the exception text content and relayout it to match the line count.
        this.container.style.height = 'initial';
        const lineHeight = this.editor.getOption(60 /* EditorOption.lineHeight */);
        const arrowHeight = Math.round(lineHeight / 3);
        const computedLinesNumber = Math.ceil((this.container.offsetHeight + arrowHeight) / lineHeight);
        this._relayout(computedLinesNumber);
    }
    focus() {
        // Focus into the container for accessibility purposes so the exception and stack trace gets read
        this.container?.focus();
    }
    hasFocus() {
        return dom.isAncestor(document.activeElement, this.container);
    }
};
ExceptionWidget = __decorate([
    __param(3, IThemeService),
    __param(4, IInstantiationService)
], ExceptionWidget);
export { ExceptionWidget };
