import { VSBuffer } from 'vs/base/common/buffer';
export interface IFullSemanticTokensDto {
    id: number;
    type: 'full';
    data: Uint32Array;
}
export interface IDeltaSemanticTokensDto {
    id: number;
    type: 'delta';
    deltas: {
        start: number;
        deleteCount: number;
        data?: Uint32Array;
    }[];
}
export declare type ISemanticTokensDto = IFullSemanticTokensDto | IDeltaSemanticTokensDto;
export declare function encodeSemanticTokensDto(semanticTokens: ISemanticTokensDto): VSBuffer;
export declare function decodeSemanticTokensDto(_buff: VSBuffer): ISemanticTokensDto;
