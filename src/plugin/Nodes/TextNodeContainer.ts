import { BaseContainer } from "./BaseNodeContainer";
import { ImagePaintContainer } from "../Paint/ImagePaintContainer";
import { SolidPaintContainer } from "../Paint/SolidPaintContainer";
import { VectorPath } from "./RectangleNodeContainer";

export class TextNodeContainer extends BaseContainer {

    public strokes: Array<ImagePaintContainer | SolidPaintContainer> = [];
    public fill: Array<ImagePaintContainer | SolidPaintContainer> = [];
    public fillGeometry: Array<VectorPath> = [];

    constructor(node: TextNode) {
        super(node);

        const fills = node.fills as Paint[];
        fills.forEach((fill) => {
            switch (fill.type) {
                case 'IMAGE': {
                    this.fill.push(new ImagePaintContainer(fill));
                    break;
                }
                case 'SOLID': {
                    this.fill.push(new SolidPaintContainer(fill));
                    break;
                }
                default: {
                    //Logger.log("fill", fill);
                }
            }
        });

        const strokes = node.strokes as Paint[];
        strokes.forEach((stroke) => {
            switch (stroke.type) {
                case 'IMAGE': {
                    this.strokes.push(new ImagePaintContainer(stroke));
                    break;
                }
                case 'SOLID': {
                    this.strokes.push(new SolidPaintContainer(stroke));
                    break;
                }
                default: {
                    //Logger.log("fill", fill);
                }
            }
        });

        this.fillGeometry = node.fillGeometry.map(g => new VectorPath(g.data, g.windingRule));

    }
}
