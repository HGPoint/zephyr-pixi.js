import { BaseContainer, IRectangleNodeProp } from "./BaseNodeContainer";
import { ImagePaintContainer } from "../Paint/ImagePaintContainer";
import { SolidPaintContainer } from "../Paint/SolidPaintContainer";
import { Logger } from "../../common/Logger";

export class VectorPath {
    constructor(public data: string, public windingRule: 'NONZERO' | 'EVENODD' | 'NONE') {
    }
}

export class RectangleNodeContainer extends BaseContainer {

    private _fill: Array<ImagePaintContainer | SolidPaintContainer> = [];
    public get fill() {
        return this._fill;
    }
    
    private _fillGeometry: Array<VectorPath> = [];
    public get fillGeometry() {
        return this._fillGeometry;
    }

    constructor(node: RectangleNode) {
        super(node);

        const fills = node.fills as Paint[];

        fills.forEach((fill) => {
            switch (fill.type) {
                case 'IMAGE': {
                    this._fill.push(new ImagePaintContainer(fill));
                    break;
                }
                case 'SOLID': {
                    this._fill.push(new SolidPaintContainer(fill));
                    break;
                }
                default: {
                    //Logger.log("fill", fill);
                }
            }
        });

        // if((this.properties as IRectangleNodeProp).isMask && node.name == "@mask"){
        //     this._buildMask(node);
        // }

        this._fillGeometry = node.fillGeometry.map(g => new VectorPath(g.data, g.windingRule));

    }

    // private _bytes: string = "";
    // private _size: {
    //     width: number;
    //     height: number;
    // } = {
    //         width: 0,
    //         height: 0
    //     };
    // private async _buildMask(node: RectangleNode){
    //     const bytes = await node.exportAsync({
    //         format: 'PNG',
    //         constraint: { type: 'SCALE', value: 1 },
    //     });
    //     const image = figma.createImage(bytes);
    //     this._bytes = "data:image/png;base64," + figma.base64Encode(bytes);
    //     this._size = await image.getSizeAsync();
    //     console.log("_buildMask", this);
    // }
}



