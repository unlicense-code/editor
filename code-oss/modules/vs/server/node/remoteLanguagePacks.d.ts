import * as lp from 'vs/base/node/languagePacks';
export declare function getNLSConfiguration(language: string, userDataPath: string): Promise<lp.NLSConfiguration>;
export declare namespace InternalNLSConfiguration {
    function is(value: lp.NLSConfiguration): value is lp.InternalNLSConfiguration;
}
