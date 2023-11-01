
export class InnerShadowEffectContainer {
    type: 'INNER_SHADOW' = 'INNER_SHADOW';
    color: {
        r: number
        g: number
        b: number
        a: number
    } = {
        r:0,g:0,b:0,a:0
    };
    offset: {
        x: number
        y: number
    } = {x:0,y:0};
    radius: number = 0;
    spread?: number;
    visible: boolean = false;
    blendMode: 
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
    | 'LUMINOSITY' = 'NORMAL';

    constructor(effect: InnerShadowEffect) {
        this.color = {
            r: effect.color.r,
            g: effect.color.g,
            b: effect.color.b,
            a: effect.color.a,
        };

        this.offset.x = effect.offset.x;
        this.offset.y = effect.offset.y;

        this.radius = effect.radius;
        this.spread = effect.spread;
        this.visible = effect.visible;
        this.blendMode = effect.blendMode;
    }
}