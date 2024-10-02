export class Logger {
    private static _source: 'PLUGIN' | 'UI' = 'PLUGIN';
    public static setSource(source: 'PLUGIN' | 'UI'): void {
        this._source = source;
    }

    public static log(message?: any, ...optionalParams: any[]): void {
        //console.log(`${this._source} ${message}`, ...optionalParams);
    }
}
