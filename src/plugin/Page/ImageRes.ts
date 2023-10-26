export class ImageRes {
    private id: string = "";
    private _bytes: string = "";
    private _size: {
        width: number;
        height: number;
    } = {
            width: 0,
            height: 0
        };

    private _isLoaded = false;
    public get isLoaded(){
        return this._isLoaded;
    }

    constructor(public hash: string) {
        this.id = hash;
        this._init();
    }

    private async _init() {
        const image = figma.getImageByHash(this.hash);
        if (!image) return;
        let bytes = await image.getBytesAsync();
        this._bytes = "data:image/png;base64," + figma.base64Encode(bytes);
        this._size = await image.getSizeAsync();
        this._isLoaded = true;
    }

    public async update(){
        this._isLoaded = false;
        await this._init();
    }

    public clear(){
        this._bytes = "";
    }

}
