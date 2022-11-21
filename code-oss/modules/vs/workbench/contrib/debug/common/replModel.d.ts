import { Event } from 'vs/base/common/event';
import severity from 'vs/base/common/severity';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IDebugSession, IExpression, IReplElement, IReplElementSource, IStackFrame } from 'vs/workbench/contrib/debug/common/debug';
import { ExpressionContainer } from 'vs/workbench/contrib/debug/common/debugModel';
export declare class SimpleReplElement implements IReplElement {
    session: IDebugSession;
    private id;
    value: string;
    severity: severity;
    sourceData?: IReplElementSource | undefined;
    private _count;
    private _onDidChangeCount;
    constructor(session: IDebugSession, id: string, value: string, severity: severity, sourceData?: IReplElementSource | undefined);
    toString(includeSource?: boolean): string;
    getId(): string;
    set count(value: number);
    get count(): number;
    get onDidChangeCount(): Event<void>;
}
export declare class RawObjectReplElement implements IExpression {
    private id;
    name: string;
    valueObj: any;
    sourceData?: IReplElementSource | undefined;
    annotation?: string | undefined;
    private static readonly MAX_CHILDREN;
    constructor(id: string, name: string, valueObj: any, sourceData?: IReplElementSource | undefined, annotation?: string | undefined);
    getId(): string;
    get value(): string;
    get hasChildren(): boolean;
    evaluateLazy(): Promise<void>;
    getChildren(): Promise<IExpression[]>;
    toString(): string;
}
export declare class ReplEvaluationInput implements IReplElement {
    value: string;
    private id;
    constructor(value: string);
    toString(): string;
    getId(): string;
}
export declare class ReplEvaluationResult extends ExpressionContainer implements IReplElement {
    private _available;
    get available(): boolean;
    constructor();
    evaluateExpression(expression: string, session: IDebugSession | undefined, stackFrame: IStackFrame | undefined, context: string): Promise<boolean>;
    toString(): string;
}
export declare class ReplGroup implements IReplElement {
    name: string;
    autoExpand: boolean;
    sourceData?: IReplElementSource | undefined;
    private children;
    private id;
    private ended;
    static COUNTER: number;
    constructor(name: string, autoExpand: boolean, sourceData?: IReplElementSource | undefined);
    get hasChildren(): boolean;
    getId(): string;
    toString(includeSource?: boolean): string;
    addChild(child: IReplElement): void;
    getChildren(): IReplElement[];
    end(): void;
    get hasEnded(): boolean;
}
export declare class ReplModel {
    private readonly configurationService;
    private replElements;
    private readonly _onDidChangeElements;
    readonly onDidChangeElements: Event<void>;
    constructor(configurationService: IConfigurationService);
    getReplElements(): IReplElement[];
    addReplExpression(session: IDebugSession, stackFrame: IStackFrame | undefined, name: string): Promise<void>;
    appendToRepl(session: IDebugSession, data: string | IExpression, sev: severity, source?: IReplElementSource): void;
    startGroup(name: string, autoExpand: boolean, sourceData?: IReplElementSource): void;
    endGroup(): void;
    private addReplElement;
    removeReplExpressions(): void;
}
