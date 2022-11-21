import { IMessage, ISignService } from 'vs/platform/sign/common/sign';
export declare class SignService implements ISignService {
    private readonly _token;
    readonly _serviceBrand: undefined;
    constructor(_token: Promise<string> | string | undefined);
    createNewMessage(value: string): Promise<IMessage>;
    validate(message: IMessage, value: string): Promise<boolean>;
    sign(value: string): Promise<string>;
}
