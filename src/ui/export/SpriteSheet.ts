//const path = require('path');

import Atlas from './Atlas';

const md5 = require('./md5');

function btoa(str: any) {
    let buffer;

    if (str instanceof Buffer) {
        buffer = str;
    } else {
        buffer = Buffer.from(str.toString(), 'binary');
    }

    return buffer.toString('base64');
}

export class SpriteSheet {
    private _margin: number = 0;
    private _size: number = 1024;
    private _outputName: string;
    private _scaleBitmap: number = 1;
    private _currentBitmapsAtlasIndex: number;
    private _bitmaps: {src: string; name: string}[];
    private _bitmapsAtlases: Atlas[] = [];

    constructor(
        size: number,
        bitmaps: {src: string; name: string}[],
        scaleBitmap: number,
        margin: number,
        outputName: string,
        private _expand = true,
    ) {
        this._margin = margin;
        this._size = size;
        this._outputName = outputName;
        this._scaleBitmap = scaleBitmap;
        this._bitmaps = bitmaps;
        this._currentBitmapsAtlasIndex = 0;

        this._bitmapsAtlases = [];

        if (this._bitmaps.length > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            this._bitmapsAtlases[0] = new Atlas(canvas, {margin: margin});
        }
    }

    async build() {
        await this.addImages();

        return await this.getOutput();
    }

    async loadImage(base64img: string) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function () {
                resolve(img);
            };
            img.src = base64img;
        });
    }

    async addImages() {
        const bitmaps = this._bitmaps;
        // const images:Array<{
        //     image: HTMLImageElement,
        //     id: string
        // }> = []

        // for (let bitmap of bitmaps) {

        //     const image = await this.loadImage(`${bitmap.src}`) as HTMLImageElement;

        //     images.push({
        //         image: image,
        //         id: bitmap.name
        //     });
        // }

        // const sortedImages = images.sort(function (a, b) {
        //     // Compute the area of each image
        //     var aArea = a.image.width * a.image.height,
        //         bArea = b.image.width * b.image.height;
        //     // compare the area of each
        //     return aArea - bArea;
        // });

        let bitmapHashs: Array<string> = [];

        while (bitmaps.length > 0) {
            for (let i = bitmaps.length - 1; i >= 0; i--) {
                const bitmap = bitmaps[i];

                if (!bitmap.src) {
                    bitmaps.splice(i, 1);
                    continue;
                }

                const image = (await this.loadImage(`${bitmap.src}`)) as HTMLImageElement;

                const id = bitmap.name;

                const node = this._bitmapsAtlases[this._currentBitmapsAtlasIndex].pack(id, image);

                if (node) {
                    bitmaps.splice(i, 1);
                    bitmapHashs.push(md5(bitmap.src));
                } else {
                    if (this._expand) {
                        const expand = this._bitmapsAtlases[this._currentBitmapsAtlasIndex].expand(
                            id,
                            image,
                        );
                        bitmaps.splice(i, 1);
                        bitmapHashs.push(md5(bitmap.src));
                    }
                }
            }

            const atlasHash = md5(bitmapHashs.join('_'));
            this._bitmapsAtlases[this._currentBitmapsAtlasIndex].hash = atlasHash;

            if (bitmaps.length > 0) {
                bitmapHashs = [];
                this._currentBitmapsAtlasIndex++;
                const canvas = document.createElement('canvas');
                canvas.width = this._size;
                canvas.height = this._size;
                this._bitmapsAtlases[this._currentBitmapsAtlasIndex] = new Atlas(canvas, {
                    margin: this._margin,
                });
            }
        }

        // for (let bitmap of bitmaps) {

        //     const image = await this.loadImage(`${bitmap.src}`) as HTMLImageElement;

        //     const id = bitmap.name;

        //     let node = this._bitmapsAtlases[this._currentBitmapsAtlasIndex].pack(id, image);

        //     if (!node) {

        //         if(this._expand){
        //             let expand = this._bitmapsAtlases[this._currentBitmapsAtlasIndex].expand(id, image);
        //         } else {
        //             this._currentBitmapsAtlasIndex++;
        //             var canvas = document.createElement('canvas');
        //             canvas.width  = this._size;
        //             canvas.height = this._size;
        //             this._bitmapsAtlases[this._currentBitmapsAtlasIndex] = new Atlas(canvas, {margin: this._margin});

        //             node = this._bitmapsAtlases[this._currentBitmapsAtlasIndex].pack(id, image);
        //             if (!node){
        //                 let expand = this._bitmapsAtlases[this._currentBitmapsAtlasIndex].expand(id, image);
        //                 console.log("can't pack image, try to increase spriteSheet size", item);
        //             }
        //         }

        //     }
        // }
    }

    async getOutput() {
        const bitmaps = [];

        for (let i = 0; i < this._bitmapsAtlases.length; i++) {
            const canvas = this._bitmapsAtlases[i].canvas;

            const atlas = this._bitmapsAtlases[i];
            //console.log("atlas", atlas);

            let bitmapsAtlasFileName = `${this._outputName}`;
            if (i > 0) {
                bitmapsAtlasFileName += `_${i}`;
            }
            const imageBitmaps = canvas.toDataURL(); //.replace(/^data:image\/png;base64,/, '');

            const bitmapsData = {
                frames: atlas.getFrames(),
                meta: {
                    app: 'hg',
                    scale: this._scaleBitmap,
                    image: `${bitmapsAtlasFileName}.png?v=${atlas.hash}`,
                    size: {
                        w: atlas.rootNode.rect.w,
                        h: atlas.rootNode.rect.h,
                    },
                },
            };

            bitmaps.push({
                name: bitmapsAtlasFileName,
                json: bitmapsData,
                image: imageBitmaps,
            });
        }

        return {
            bitmaps: bitmaps,
        };
    }
}
