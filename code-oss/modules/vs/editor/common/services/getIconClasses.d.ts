import { URI as uri } from 'vs/base/common/uri';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IModelService } from 'vs/editor/common/services/model';
import { FileKind } from 'vs/platform/files/common/files';
export declare function getIconClasses(modelService: IModelService, languageService: ILanguageService, resource: uri | undefined, fileKind?: FileKind): string[];
export declare function getIconClassesForLanguageId(languageId: string): string[];
