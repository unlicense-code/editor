export interface IPropertyData {
    classification: 'SystemMetaData' | 'CallstackOrException' | 'CustomerContent' | 'PublicNonPersonalData' | 'EndUserPseudonymizedInformation';
    purpose: 'PerformanceAndHealth' | 'FeatureInsight' | 'BusinessInsight';
    comment: string;
    expiration?: string;
    endpoint?: string;
    isMeasurement?: boolean;
}
export interface IGDPRProperty {
    owner: string;
    comment: string;
    expiration?: string;
    readonly [name: string]: IPropertyData | undefined | IGDPRProperty | string;
}
declare type IGDPRPropertyWithoutMetadata = Omit<IGDPRProperty, 'owner' | 'comment' | 'expiration'>;
export declare type OmitMetadata<T> = Omit<T, 'owner' | 'comment' | 'expiration'>;
export declare type ClassifiedEvent<T extends IGDPRPropertyWithoutMetadata> = {
    [k in keyof T]: any;
};
export declare type StrictPropertyChecker<TEvent, TClassification, TError> = keyof TEvent extends keyof OmitMetadata<TClassification> ? keyof OmitMetadata<TClassification> extends keyof TEvent ? TEvent : TError : TError;
export declare type StrictPropertyCheckError = {
    error: 'Type of classified event does not match event properties';
};
export declare type StrictPropertyCheck<T extends IGDPRProperty, E> = StrictPropertyChecker<E, ClassifiedEvent<OmitMetadata<T>>, StrictPropertyCheckError>;
export {};
