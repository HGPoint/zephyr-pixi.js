import { BaseContainer } from "./BaseNodeContainer";
import { ImagePaintContainer } from "../Paint/ImagePaintContainer";
import { SolidPaintContainer } from "../Paint/SolidPaintContainer";
import { VectorPath } from "./RectangleNodeContainer";
import { DropShadowEffectContainer } from "../Effects/DropShadowEffect";
import { InnerShadowEffectContainer } from "../Effects/InnerShadowEffect";
import { Logger } from "../../common/Logger";

export class TextNodeContainer extends BaseContainer {

    public strokes: Array<ImagePaintContainer | SolidPaintContainer> = [];
    public fill: Array<ImagePaintContainer | SolidPaintContainer> = [];
    public effects: Array<DropShadowEffectContainer | InnerShadowEffectContainer> = [];
    public fillGeometry: Array<VectorPath> = [];

    constructor(node: TextNode) {
        super(node);

        try {
            if(Array.isArray(node.fills)){
                const fills = node.fills as Paint[];
                fills && fills.forEach((fill) => {
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
            } else {
                Logger.log("!figma.mixed", node.name, node.fills);
            }
        } catch (error) {
            Logger.log("ERROR fills", node.name, error);
        }

        try {
            const strokes = node.strokes as Paint[];
            strokes && strokes.forEach((stroke) => {
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
        } catch (error) {
            Logger.log("ERROR strokes", node.name, error);
        }

        try {
            const effects = node.effects;
            effects && effects.forEach(effect => {
                switch (effect.type) {
                    case 'DROP_SHADOW': {
                        this.effects.push(new DropShadowEffectContainer(effect));
                        break;
                    }
                    case 'INNER_SHADOW': {
                        this.effects.push(new InnerShadowEffectContainer(effect));
                        break;
                    }
                }
            })
        } catch (error) {
            Logger.log("ERROR effects", node.name, error);
        }

        if(node.fillGeometry){
            this.fillGeometry = node.fillGeometry.map(g => new VectorPath(g.data, g.windingRule));
        }

    }
}
