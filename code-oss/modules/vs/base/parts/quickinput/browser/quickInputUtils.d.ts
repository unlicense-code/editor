import { URI } from 'vs/base/common/uri';
import 'vs/css!./media/quickInput';
export declare function getIconClass(iconPath: {
    dark: URI;
    light?: URI;
} | undefined): string | undefined;
