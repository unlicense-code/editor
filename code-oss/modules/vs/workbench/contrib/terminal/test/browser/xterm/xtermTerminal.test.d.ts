import { IViewDescriptor, IViewDescriptorService, ViewContainerLocation } from 'vs/workbench/common/views';
export declare class TestViewDescriptorService implements Partial<IViewDescriptorService> {
    private _location;
    private _onDidChangeLocation;
    onDidChangeLocation: import("vs/base/common/event").Event<{
        views: IViewDescriptor[];
        from: ViewContainerLocation;
        to: ViewContainerLocation;
    }>;
    getViewLocationById(id: string): ViewContainerLocation;
    moveTerminalToLocation(to: ViewContainerLocation): void;
}
