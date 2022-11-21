import { IWindowOpenable, IOpenWindowOptions, IOpenEmptyWindowOptions } from 'vs/platform/window/common/window';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare const openWindowCommand: (accessor: ServicesAccessor, toOpen: IWindowOpenable[], options?: IOpenWindowOptions) => void;
export declare const newWindowCommand: (accessor: ServicesAccessor, options?: IOpenEmptyWindowOptions) => void;
