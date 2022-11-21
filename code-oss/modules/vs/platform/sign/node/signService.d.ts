import { IMessage, ISignService } from 'vs/platform/sign/common/sign';
export declare class SignService implements ISignService {
    readonly _serviceBrand: undefined;
    private static _nextId;
    private readonly validators;
    private vsda;
    createNewMessage(value: string): Promise<IMessage>;
    validate(message: IMessage, value: string): Promise<boolean>;
    sign(value: string): Promise<string>;
}
