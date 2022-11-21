import { AbstractTextMateService } from 'vs/workbench/services/textMate/browser/abstractTextMateService';
export declare class TextMateService extends AbstractTextMateService {
    protected _loadVSCodeOnigurumWASM(): Promise<Response | ArrayBuffer>;
}
