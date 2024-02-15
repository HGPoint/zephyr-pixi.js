
//const path = require('path');
import Rect from './Rect';
import Atlas, { Drawable } from './Atlas';
import { resolve } from 'path';
import {GrowingPacker, PackerNode} from "./packer/GrowingPacker";
import {AtlasImage} from "./packer/PackerImage";
import {Bitmap} from "../Bitmap";

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
    private _currentBitmapsAtlasIndex: number;
    private _bitmaps: {src:string, name:string, width: number, height: number, x:number, y: number}[];
    private _bitmapsAtlases: Atlas[] = [];

    constructor(width: number, height: number, bitmaps:Bitmap[], scaleBitmap:number, margin:number, outputName: string) {
        this._margin = margin;
        this._outputName = outputName;
        this._scaleBitmap = scaleBitmap;
        this._bitmaps = bitmaps;
        this._currentBitmapsAtlasIndex = 0;

        this._bitmapsAtlases = [];

        if (this._bitmaps.length > 0) {
            var canvas = document.createElement('canvas');
            canvas.width  = width;
            canvas.height = height;
            this._bitmapsAtlases[0] = new Atlas(canvas, {margin: margin});
        }
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

            const node = this._bitmapsAtlases[this._currentBitmapsAtlasIndex].pack(id, image, bitmap.x, bitmap.y);

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