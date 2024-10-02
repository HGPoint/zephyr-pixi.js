import {BaseContainer} from './BaseNodeContainer';

export class VectorPath {
    constructor(
        public data: string,
        public windingRule: 'NONZERO' | 'EVENODD' | 'NONE',
    ) {}
}

export class VectorNodeContainer extends BaseContainer {
    // private _fill: Array<ImagePaintContainer | SolidPaintContainer | GradientPaintContainer> = [];
    // public get fill() {
    //     return this._fill;
    // }

    // private _fillGeometry: Array<VectorPath> = [];
    // public get fillGeometry() {
    //     return this._fillGeometry;
    // }

    constructor(node: VectorNode) {
        super(node);

        // const fills = node.fills as Paint[];

        // fills.forEach((fill) => {
        //     switch (fill.type) {
        //         case 'IMAGE': {
        //             this._fill.push(new ImagePaintContainer(fill));
        //             break;
        //         }
        //         case 'SOLID': {
        //             this._fill.push(new SolidPaintContainer(fill));
        //             break;
        //         }
        //         case 'GRADIENT_LINEAR': {
        //             this.fill.push(new GradientPaintContainer(fill));
        //             break;
        //         }
        //         default: {
        //             //Logger.log("fill", fill);
        //         }
        //     }
        // });

        // // if((this.properties as IRectangleNodeProp).isMask && node.name == "@mask"){
        // //     this._buildMask(node);
        // // }

        // this._fillGeometry = node.fillGeometry.map(g => new VectorPath(g.data, g.windingRule));
    }
}
