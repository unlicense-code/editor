import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export declare class OtherTestEditor extends EditorPane {
    constructor(telemetryService: ITelemetryService);
    getId(): string;
    layout(): void;
    createEditor(): any;
}
