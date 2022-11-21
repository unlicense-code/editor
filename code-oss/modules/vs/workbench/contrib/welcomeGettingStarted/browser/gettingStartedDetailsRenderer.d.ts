import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
export declare class GettingStartedDetailsRenderer {
    private readonly fileService;
    private readonly notificationService;
    private readonly extensionService;
    private readonly languageService;
    private mdCache;
    private svgCache;
    constructor(fileService: IFileService, notificationService: INotificationService, extensionService: IExtensionService, languageService: ILanguageService);
    renderMarkdown(path: URI, base: URI): Promise<string>;
    renderSVG(path: URI): Promise<string>;
    private readAndCacheSVGFile;
    private readAndCacheStepMarkdown;
    private readContentsOfPath;
}
