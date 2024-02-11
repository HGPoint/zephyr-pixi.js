import {GrowingPacker} from "./GrowingPacker";
import {AtlasImage} from "./PackerImage";

export class PackerAtlas
{
    public files: AtlasImage[];
    public width: number;
    public height: number;

    constructor(packer: GrowingPacker)
    {
        this.files = [];
        this.width = packer.root.width;
        this.height = packer.root.height;
    }

    addImage(image: AtlasImage)
    {
        this.files.push(image);
    }
}