export class AtlasImage {
    public x: number;
    public y: number;
    public key: string;
    public extension: string;
    public width: number;
    public height: number;
    constructor(item: any, padding: number) {
        const {
            width, height, key, extension,
        } = item;
        const { x, y } = item.fit;
        this.x = x;
        this.y = y;
        this.key = key;
        this.extension = extension;
        this.width = width - 2 * padding;
        this.height = height - 2 * padding;
    }
}