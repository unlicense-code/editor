import * as encoding from 'vs/workbench/services/textfile/common/encoding';
export declare function detectEncodingByBOM(file: string): Promise<typeof encoding.UTF16be | typeof encoding.UTF16le | typeof encoding.UTF8_with_bom | null>;
