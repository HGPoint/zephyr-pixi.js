
//const path = require('path');
import Rect from './Rect';
import Atlas, { Drawable } from './Atlas';
import { resolve } from 'path';
import {PackerAtlas} from "./packer/PackerAtlas";
import {GrowingPacker, PackerNode} from "./packer/GrowingPacker";
import {AtlasImage} from "./packer/PackerImage";

function btoa(str:any) {
    var buffer;

    if (str instanceof Buffer) {
        buffer = str;
    } else {
        buffer = Buffer.from(str.toString(), 'binary');
    }

    return buffer.toString('base64');
}

export type SpritesSheetOptions = {
    maxWidth: number;
    maxHeight: number;
    padding: number;
}

export class Spritesheet {
    private _margin: number = 0;
    private _size: number = 1024;
    private _outputName: string;
    private _scaleBitmap: number = 1;
    private _currentBitmapsAtlasIndex: number;
    private _bitmaps: {src:string, name:string, width: number, height: number}[];
    private _bitmapsAtlases: Atlas[] = [];

    constructor(size:number, bitmaps:{src:string, name:string, width: number, height: number}[], scaleBitmap:number, margin:number, outputName: string, options: SpritesSheetOptions) {
        this._margin = margin;
        this._size = size;
        this._outputName = outputName;
        this._scaleBitmap = scaleBitmap;
        this._bitmaps = bitmaps;
        this._currentBitmapsAtlasIndex = 0;

        this._bitmapsAtlases = [];

        const calculatedAtlases = this.getGrowingPackerAtlases(options);

        if (this._bitmaps.length > 0) {
            var canvas = document.createElement('canvas');
            canvas.width  = size;
            canvas.height = size;
            this._bitmapsAtlases[0] = new Atlas(canvas, {margin: margin});
        }
    }

    private getGrowingPackerAtlases(options: SpritesSheetOptions): PackerAtlas[] {
        const result: PackerAtlas[] = [];

        //let noFitImages = this._bitmaps.concat();
        let noFitImages: PackerNode[] = this._bitmaps.map(item => {
            return {
                key: item.name,
                src: item.src,
                width: item.width,
                height: item.height,
            }
        });

        while (noFitImages.length > 0) {
            const packer = new GrowingPacker(options.maxWidth, options.maxHeight);
            packer.fit(noFitImages);
            const atlas = new PackerAtlas(packer);
            noFitImages.forEach((item) => {
                if (item.fit) {
                    const image = new AtlasImage(item, options.padding);
                    atlas.addImage(image);
                }
            });
            result.push(atlas);
            noFitImages = packer.nofit;
        }
        return result;
    }
    async build() {
        await this.addImages();

        return await this.getOutput();
    }

    async loadImage(base64img:string) {
        return new Promise(resolve => {
            var img = new Image();
            img.onload = function() {
                resolve(img);
            };
            img.src = base64img;
        })
    }

    async addImages() {
        const bitmaps = this._bitmaps;

        for (let bitmap of bitmaps) {

            const image = await this.loadImage(`${bitmap.src}`) as HTMLImageElement;

            const id = bitmap.name;

            const node = this._bitmapsAtlases[this._currentBitmapsAtlasIndex].pack(id, image);

            if (!node) {
                let expand = this._bitmapsAtlases[this._currentBitmapsAtlasIndex].expand(id, image);

                // this._currentBitmapsAtlasIndex++;
                // this._bitmapsAtlases[this._currentBitmapsAtlasIndex] = new Atlas(createCanvas(this._size, this._size));

                // node = this._bitmapsAtlases[this._currentBitmapsAtlasIndex].pack(id, image);
                // if (!node){
                //     console.log("can't pack image, try to increase spritesheet size", image);
                // }
            }
        }

    }

    async getOutput() {
        const bitmaps = [];

        for (let i = 0; i < this._bitmapsAtlases.length; i++) {
            const canvas = this._bitmapsAtlases[i].canvas;

            const atlas = this._bitmapsAtlases[i];
            //console.log("atlas", atlas);

            const bitmapsAtlasFileName = `${this._outputName}`;
            const imageBitmaps = canvas.toDataURL();//.replace(/^data:image\/png;base64,/, '');

            const bitmapsData = {
                frames: atlas.getFrames(),
                meta: {
                    app: "hg",
                    scale: this._scaleBitmap,
                    image: `${bitmapsAtlasFileName}.png`,
                    size: {
                        w: atlas.rootNode.rect.w,
                        h: atlas.rootNode.rect.h
                    }
                }
            };

            bitmaps.push({
                name: bitmapsAtlasFileName,
                json: bitmapsData,
                image: imageBitmaps
            });
        }

        return {
            bitmaps: bitmaps
        }
    }

}