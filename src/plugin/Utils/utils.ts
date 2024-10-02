export async function delay(value: number) {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, value);
    });
}

async function imgGenerate(node: SceneNode) {
    if (node.type == 'FRAME') {
        const bytes = await node.exportAsync({
            format: 'PNG',
            constraint: {type: 'SCALE', value: 2},
        });
        const image = figma.createImage(bytes);
        const frame = figma.createFrame();
        frame.x = 200;
        frame.resize(200, 230);
        frame.fills = [
            {
                imageHash: image.hash,
                scaleMode: 'FILL',
                scalingFactor: 1,
                type: 'IMAGE',
            },
        ];
    }
}

const nowOffset = Date.now();
export function performanceNow() {
    return (Date.now() - nowOffset) / 1000;
}

interface ICurvePoint {
    type: 'arc' | 'cubic' | 'quadratic';
}

interface IArcCurvePoint extends ICurvePoint {
    type: 'arc';
    rx: number;
    ry: number;
    sweepFlag: number;
    largeArcFlag: number;
    xAxisRotation: number;
}

interface ICubicCurvePoint extends ICurvePoint {
    type: 'cubic';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface IQuadraticCurvePoint extends ICurvePoint {
    type: 'quadratic';
    x1: number;
    y1: number;
}

export function pointsToPath(
    p: {
        x: number;
        y: number;
        curve?: IArcCurvePoint | ICubicCurvePoint | IQuadraticCurvePoint;
        moveTo?: boolean;
    }[],
) {
    let d = '';
    let i = 0;
    let firstPoint;

    for (const point of p) {
        const {curve = false, moveTo, x, y} = point;
        const isFirstPoint = i === 0 || moveTo;
        const isLastPoint = i === p.length - 1 || p[i + 1].moveTo;
        const prevPoint = i === 0 ? null : p[i - 1];

        if (isFirstPoint) {
            firstPoint = point;

            if (!isLastPoint) {
                d += `M ${x} ${y}`;
            }
        } else if (curve) {
            switch (curve.type) {
                case 'arc':
                    const {
                        largeArcFlag = 0,
                        rx,
                        ry,
                        sweepFlag = 0,
                        xAxisRotation = 0,
                    } = point.curve as IArcCurvePoint;
                    d += ` A ${rx} ${ry} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${x} ${y}`;
                    break;
                case 'cubic':
                    const {x1: cx1, y1: cy1, x2: cx2, y2: cy2} = point.curve as ICubicCurvePoint;
                    d += ` C ${cx1} ${cy1} ${cx2} ${cy2} ${x} ${y}`;
                    break;
                case 'quadratic':
                    const {x1: qx1, y1: qy1} = point.curve as IQuadraticCurvePoint;
                    d += ` Q ${qx1} ${qy1} ${x} ${y}`;
                    break;
            }

            if (isLastPoint && x === firstPoint?.x && y === firstPoint?.y) {
                d += ' Z';
            }
        } else if (isLastPoint && x === firstPoint?.x && y === firstPoint?.y) {
            d += ' Z';
        } else {
            //if (x !== prevPoint?.x && y !== prevPoint?.y)
            d += ` L ${x} ${y}`;
        }
        //    else if (x !== prevPoint?.x) {
        //     d += `H ${x} `;
        //   } else if (y !== prevPoint?.y) {
        //     d += `V ${y} `;
        //   }

        i++;
    }

    return d;
}

// export function convertToAbsolute(path){
//     var x0,y0,x1,y1,x2,y2,segs = path.pathSegList;
//     for (var x=0,y=0,i=0,len=segs.numberOfItems;i<len;++i){
//         var seg = segs.getItem(i), c=seg.pathSegTypeAsLetter;
//         if (/[MLHVCSQTA]/.test(c)){
//         if ('x' in seg) x=seg.x;
//         if ('y' in seg) y=seg.y;
//         }else{
//         if ('x1' in seg) x1=x+seg.x1;
//         if ('x2' in seg) x2=x+seg.x2;
//         if ('y1' in seg) y1=y+seg.y1;
//         if ('y2' in seg) y2=y+seg.y2;
//         if ('x'  in seg) x+=seg.x;
//         if ('y'  in seg) y+=seg.y;
//         switch(c){
//             case 'm': segs.replaceItem(path.createSVGPathSegMovetoAbs(x,y),i);                   break;
//             case 'l': segs.replaceItem(path.createSVGPathSegLinetoAbs(x,y),i);                   break;
//             case 'h': segs.replaceItem(path.createSVGPathSegLinetoHorizontalAbs(x),i);           break;
//             case 'v': segs.replaceItem(path.createSVGPathSegLinetoVerticalAbs(y),i);             break;
//             case 'c': segs.replaceItem(path.createSVGPathSegCurvetoCubicAbs(x,y,x1,y1,x2,y2),i); break;
//             case 's': segs.replaceItem(path.createSVGPathSegCurvetoCubicSmoothAbs(x,y,x2,y2),i); break;
//             case 'q': segs.replaceItem(path.createSVGPathSegCurvetoQuadraticAbs(x,y,x1,y1),i);   break;
//             case 't': segs.replaceItem(path.createSVGPathSegCurvetoQuadraticSmoothAbs(x,y),i);   break;
//             case 'a': segs.replaceItem(path.createSVGPathSegArcAbs(x,y,seg.r1,seg.r2,seg.angle,seg.largeArcFlag,seg.sweepFlag),i);   break;
//             case 'z': case 'Z': x=x0; y=y0; break;
//         }
//         }
//         // Record the start of a subpath
//         if (c=='M' || c=='m') x0=x, y0=y;
//     }
// }
