import { BaseDocument } from "../Page/BaseDocument";

export class ImagePaintContainer {
    readonly type = "ImagePaint";
    
    constructor(paint: ImagePaint) {
        this.scaleMode = paint.scaleMode;
        this.imageHash = paint.imageHash as string;

        BaseDocument.addImage(this.imageHash);
    }

    scaleMode: 'FILL' | 'FIT' | 'CROP' | 'TILE' = 'FIT';
    imageHash: string = "";
    imageTransform?: Transform;
    scalingFactor?: number;
    rotation?: number;
    //filters?: ImageFilters;
    visible?: boolean;
    opacity?: number;
    blendMode?: BlendMode;
}
