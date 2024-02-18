export class Logger {
    private static _source:'PLUGIN'|'UI' = 'PLUGIN';

    public static log(message?: any, ...optionalParams: any[]): void {
        console.log(`${this._source} ${message}`, ...optionalParams);
    }
}