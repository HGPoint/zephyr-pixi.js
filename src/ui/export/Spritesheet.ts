
//const path = require('path');
import Rect from './Rect';
import Atlas, { Drawable } from './Atlas';
import { resolve } from 'path';
import {GrowingPacker, PackerNode} from "./packer/GrowingPacker";
import {AtlasImage} from "./packer/PackerImage";
import {Bitmap} from "../Bitmap";
import {ExportOptions} from "../../plugin/export";
import {PackerAtlas} from "./packer/PackerAtlas";

function btoa(str:any) {
    var buffer;

    if (str instanceof Buffer) {
        buffer = str;
    } else {
        buffer = Buffer.from(str.toString(), 'binary');
    }

    return buffer.toString('base64');
}

export class Spritesheet {
    private _margin: number = 0;
    private _outputName: string;
    private _scaleBitmap: number = 1;
    private _bitmaps: Bitmap[];
    private _bitmapsAtlases: Atlas[] = [];
    private _growingPack: boolean;
    private _width: number;
    private _height: number;

    constructor(width: number, height: number, bitmaps:Bitmap[], scaleBitmap:number, margin:number, outputName: string, growingPack: boolean) {
        this._width = width;
        this._height = height;
        this._margin = margin;
        this._outputName = outputName;
        this._scaleBitmap = scaleBitmap;
        this._bitmaps = bitmaps;
        this._bitmapsAtlases = [];
        this._growingPack = growingPack;
    }

    public async build()
    {
        if (this._growingPack) {
            const atlasesPack = this.getGrowingPackerAtlases(this._bitmaps, {
                margin: this._margin,
                atlasMaxWidth: this._width,
                atlasMaxHeight: this._height,
            });
            for (let index = 0; index < atlasesPack.length; index ++) {
                const currentAtlas = atlasesPack[index];
                const images: Bitmap[] = currentAtlas.files.map(item => {
                    return {
                        name: item.name,
                        id: item.id,
                        width: item.width,
                        height: item.height,
                        src: item.src,
                        x: item.x,
                        y: item.y,
                    }
                });
                this._bitmapsAtlases[index] = this.createBitmapAtlas(currentAtlas.width, currentAtlas.height);
                await this.addImagesToAtlas(this._bitmapsAtlases[index], images);
            }

        } else {
            this._bitmapsAtlases[0] = this.createBitmapAtlas(this._width, this._height);
            await this.addImagesToAtlas(this._bitmapsAtlases[0], this._bitmaps);
        }
    }

    private createBitmapAtlas(width: number, height: number): Atlas
    {
        var canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        return new Atlas(canvas, {margin: this._margin});
    }

    private getGrowingPackerAtlases(images: Bitmap[], options: ExportOptions): PackerAtlas[]
    {
        const result: PackerAtlas[] = [];

        let noFitImages: PackerNode[] = images.map(item =>
        {
            return {
                id: item.id,
                src: item.src,
                name: item.name,
                width: item.width + 2 * options.margin,
                height: item.height + 2 * options.margin,
                x: 0,
                y: 0
            };
        });

        while (noFitImages.length > 0) {
            const packer = new GrowingPacker(options.atlasMaxWidth, options.atlasMaxHeight);
            packer.fit(noFitImages);
            const atlas = new PackerAtlas(packer);
            noFitImages.forEach((item) =>
            {
                if (item.fit) {
                    const image = new AtlasImage(item, options.margin);
                    atlas.addImage(image);
                }
            });
            result.push(atlas);
            noFitImages = packer.nofit;
        }
        return result;
    }

    private async loadImage(base64img:string) {
        return new Promise(resolve => {
            var img = new Image();
            img.onload = function() {
                resolve(img);
            };
            img.src = base64img;
        })
    }

    private async addImagesToAtlas(atlas: Atlas, bitmaps: Bitmap[]) {
        for (let bitmap of bitmaps) {

            const image = await this.loadImage(`${bitmap.src}`) as HTMLImageElement;

            const id = bitmap.name;

            const node = atlas.pack(id, image, bitmap.x, bitmap.y);

            if (!node) {
                let expand = atlas.expand(id, image);

                // this._currentBitmapsAtlasIndex++;
                // this._bitmapsAtlases[this._currentBitmapsAtlasIndex] = new Atlas(createCanvas(this._size, this._size));

                // node = this._bitmapsAtlases[this._currentBitmapsAtlasIndex].pack(id, image);
                // if (!node){
                //     console.log("can't pack image, try to increase spritesheet size", image);
                // }
            }
        }

    }

    public async getOutput() {
        const bitmaps = [];

        for (let i = 0; i < this._bitmapsAtlases.length; i++) {
            const canvas = this._bitmapsAtlases[i].canvas;

            const atlas = this._bitmapsAtlases[i];
            //console.log("atlas", atlas);

            const suffix = this._bitmapsAtlases.length > 1 ? `_${i}` : '';
            const bitmapsAtlasFileName = `${this._outputName}${suffix}`;
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