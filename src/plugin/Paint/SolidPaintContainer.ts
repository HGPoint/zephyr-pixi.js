export class SolidPaintContainer {
    readonly type = "SolidPaint";

    color: RGB;
    visible?: boolean;
    opacity?: number;
    blendMode?: 
    | 'PASS_THROUGH'
    | 'NORMAL'
    | 'DARKEN'
    | 'MULTIPLY'
    | 'LINEAR_BURN'
    | 'COLOR_BURN'
    | 'LIGHTEN'
    | 'SCREEN'
    | 'LINEAR_DODGE'
    | 'COLOR_DODGE'
    | 'OVERLAY'
    | 'SOFT_LIGHT'
    | 'HARD_LIGHT'
    | 'DIFFERENCE'
    | 'EXCLUSION'
    | 'HUE'
    | 'SATURATION'
    | 'COLOR'
    | 'LUMINOSITY';

    constructor(paint: SolidPaint) {
        this.color = {
            r: paint.color.r,
            g: paint.color.g,
            b: paint.color.b
        };

        this.visible = paint.visible;
        this.opacity = paint.opacity;
        this.blendMode = paint.blendMode;
    }

}
