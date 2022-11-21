import { URI } from 'vs/base/common/uri';
export declare const ILanguageDetectionService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ILanguageDetectionService>;
export declare const LanguageDetectionLanguageEventSource = "languageDetection";
export interface ILanguageDetectionService {
    readonly _serviceBrand: undefined;
    /**
     * @param languageId The languageId to check if language detection is currently enabled.
     * @returns whether or not language detection is on for this language.
     */
    isEnabledForLanguage(languageId: string): boolean;
    /**
     * @param resource The resource to detect the language for.
     * @param supportedLangs Optional. When populated, the model will only return languages from the provided list
     * @returns the language id for the given resource or undefined if the model is not confident enough.
     */
    detectLanguage(resource: URI, supportedLangs?: string[]): Promise<string | undefined>;
}
export declare type LanguageDetectionHintConfig = {
    untitledEditors: boolean;
    notebookEditors: boolean;
};
export declare const AutomaticLanguageDetectionLikelyWrongId = "automaticlanguagedetection.likelywrong";
export interface IAutomaticLanguageDetectionLikelyWrongData {
    currentLanguageId: string;
    nextLanguageId: string;
    lineCount: number;
    modelPreference: string;
}
export declare type AutomaticLanguageDetectionLikelyWrongClassification = {
    owner: 'TylerLeonhardt,JacksonKearl';
    comment: 'Used to determine how often language detection is likely wrong.';
    currentLanguageId: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The language id we guessed.';
    };
    nextLanguageId: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The language id the user chose.';
    };
    lineCount: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        isMeasurement: true;
        comment: 'The number of lines in the file.';
    };
    modelPreference: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'What the user\'s model preference is.';
    };
};
export declare const LanguageDetectionStatsId = "automaticlanguagedetection.stats";
export interface ILanguageDetectionStats {
    languages: string;
    confidences: string;
    timeSpent: number;
}
export declare type LanguageDetectionStatsClassification = {
    owner: 'TylerLeonhardt,JacksonKearl';
    comment: 'Used to determine how definitive language detection is and how long it takes.';
    languages: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The languages the model supports.';
    };
    confidences: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'The confidences of those languages.';
    };
    timeSpent: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'How long the operation took.';
    };
};
