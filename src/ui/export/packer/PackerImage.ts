export class AtlasImage {
    public x: number;
    public y: number;
    public name: string;
    public id: string;
    public src: string;
    public width: number;
    public height: number;
    constructor(item: any, padding: number) {
        const {
            width, height, src, name, id,
        } = item;
        const { x, y } = item.fit;
        this.x = x;
        this.y = y;
        this.name = name;
        this.id = id;
        this.src = src;
        this.width = width - 2 * padding;
        this.height = height - 2 * padding;
    }
}