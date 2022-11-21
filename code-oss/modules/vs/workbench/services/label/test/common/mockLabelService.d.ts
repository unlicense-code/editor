import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IFormatterChangeEvent, ILabelService, ResourceLabelFormatter } from 'vs/platform/label/common/label';
import { IWorkspace, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
export declare class MockLabelService implements ILabelService {
    _serviceBrand: undefined;
    registerCachedFormatter(formatter: ResourceLabelFormatter): IDisposable;
    getUriLabel(resource: URI, options?: {
        relative?: boolean | undefined;
        noPrefix?: boolean | undefined;
    }): string;
    getUriBasenameLabel(resource: URI): string;
    getWorkspaceLabel(workspace: URI | IWorkspaceIdentifier | IWorkspace, options?: {
        verbose: boolean;
    }): string;
    getHostLabel(scheme: string, authority?: string): string;
    getHostTooltip(): string | undefined;
    getSeparator(scheme: string, authority?: string): '/' | '\\';
    registerFormatter(formatter: ResourceLabelFormatter): IDisposable;
    onDidChangeFormatters: Event<IFormatterChangeEvent>;
}
