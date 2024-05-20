export class GradientPaintContainer {
    readonly type = "GradientPaint";

    gradientStops: ColorStop[];
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

    constructor(paint: GradientPaint) {
        //PIXI.JS can use 'GRADIENT_LINEAR'
        //colors without alpha

        this.gradientStops = paint.gradientStops.map(item => item);
        this.visible = paint.visible;
        this.opacity = paint.opacity;
        this.blendMode = paint.blendMode;
    }

}
