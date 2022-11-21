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
import { Disposable } from 'vs/base/common/lifecycle';
import { FeedbackWidget } from 'vs/workbench/contrib/feedback/browser/feedback';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IProductService } from 'vs/platform/product/common/productService';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { localize } from 'vs/nls';
import { CommandsRegistry, ICommandService } from 'vs/platform/commands/common/commands';
import { URI } from 'vs/base/common/uri';
import { MenuRegistry, MenuId } from 'vs/platform/actions/common/actions';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { HIDE_NOTIFICATIONS_CENTER, HIDE_NOTIFICATION_TOAST } from 'vs/workbench/browser/parts/notifications/notificationsCommands';
import { isIOS } from 'vs/base/common/platform';
class TwitterFeedbackService {
    static TWITTER_URL = 'https://twitter.com/intent/tweet';
    static VIA_NAME = 'code';
    static HASHTAGS = ['HappyCoding'];
    combineHashTagsAsString() {
        return TwitterFeedbackService.HASHTAGS.join(',');
    }
    submitFeedback(feedback, openerService) {
        const queryString = `?${feedback.sentiment === 1 ? `hashtags=${this.combineHashTagsAsString()}&` : ''}ref_src=twsrc%5Etfw&related=twitterapi%2Ctwitter&text=${encodeURIComponent(feedback.feedback)}&tw_p=tweetbutton&via=${TwitterFeedbackService.VIA_NAME}`;
        const url = TwitterFeedbackService.TWITTER_URL + queryString;
        openerService.open(URI.parse(url));
    }
    getCharacterLimit(sentiment) {
        let length = 0;
        if (sentiment === 1) {
            TwitterFeedbackService.HASHTAGS.forEach(element => {
                length += element.length + 2;
            });
        }
        if (TwitterFeedbackService.VIA_NAME) {
            length += ` via @${TwitterFeedbackService.VIA_NAME}`.length;
        }
        return 280 - length;
    }
}
let FeedbackStatusbarConribution = class FeedbackStatusbarConribution extends Disposable {
    statusbarService;
    instantiationService;
    commandService;
    static TOGGLE_FEEDBACK_COMMAND = 'help.tweetFeedback';
    widget;
    entry;
    constructor(statusbarService, productService, instantiationService, commandService) {
        super();
        this.statusbarService = statusbarService;
        this.instantiationService = instantiationService;
        this.commandService = commandService;
        if (productService.sendASmile && !isIOS) {
            this.createFeedbackStatusEntry();
        }
    }
    createFeedbackStatusEntry() {
        // Status entry
        this.entry = this._register(this.statusbarService.addEntry(this.getStatusEntry(), 'status.feedback', 1 /* StatusbarAlignment.RIGHT */, -100 /* towards the end of the right hand side */));
        // Command to toggle
        CommandsRegistry.registerCommand(FeedbackStatusbarConribution.TOGGLE_FEEDBACK_COMMAND, () => this.toggleFeedback());
        MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
            command: {
                id: FeedbackStatusbarConribution.TOGGLE_FEEDBACK_COMMAND,
                category: Categories.Help,
                title: localize('status.feedback', "Tweet Feedback")
            }
        });
    }
    toggleFeedback() {
        if (!this.widget) {
            this.widget = this._register(this.instantiationService.createInstance(FeedbackWidget, {
                feedbackService: this.instantiationService.createInstance(TwitterFeedbackService)
            }));
            this._register(this.widget.onDidChangeVisibility(visible => this.entry.update(this.getStatusEntry(visible))));
        }
        if (this.widget) {
            if (!this.widget.isVisible()) {
                this.commandService.executeCommand(HIDE_NOTIFICATION_TOAST);
                this.commandService.executeCommand(HIDE_NOTIFICATIONS_CENTER);
                this.widget.show();
            }
            else {
                this.widget.hide();
            }
        }
    }
    getStatusEntry(showBeak) {
        return {
            name: localize('status.feedback.name', "Feedback"),
            text: '$(feedback)',
            ariaLabel: localize('status.feedback', "Tweet Feedback"),
            tooltip: localize('status.feedback', "Tweet Feedback"),
            command: FeedbackStatusbarConribution.TOGGLE_FEEDBACK_COMMAND,
            showBeak
        };
    }
};
FeedbackStatusbarConribution = __decorate([
    __param(0, IStatusbarService),
    __param(1, IProductService),
    __param(2, IInstantiationService),
    __param(3, ICommandService)
], FeedbackStatusbarConribution);
export { FeedbackStatusbarConribution };
