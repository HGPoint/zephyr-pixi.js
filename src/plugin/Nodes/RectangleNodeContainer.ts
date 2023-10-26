import { BaseContainer } from "./BaseNodeContainer";
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

        this._fillGeometry = node.fillGeometry.map(g => new VectorPath(g.data, g.windingRule));

    }
}



