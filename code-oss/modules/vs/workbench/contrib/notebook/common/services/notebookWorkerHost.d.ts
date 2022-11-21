export interface INotebookWorkerHost {
    fhr(method: string, args: any[]): Promise<any>;
}
