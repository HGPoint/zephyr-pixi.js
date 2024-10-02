import {Logger} from '../common/Logger';

import {pointsToPath} from './Utils/utils';

const selectionchangeTimer = 0;

function documentchange() {
    //selectionchangeTimer && clearTimeout(selectionchangeTimer)
    // selectionchangeTimer = setTimeout(async () => {
    //     await updateDocument();
    //     figma.ui.postMessage({type: "documentchange", data: BaseDocument.current }, { origin: "*" });
    // }, 100);
}

function documentChangeAsString(change: DocumentChange) {
    const {origin, type} = change;
    if (origin == 'REMOTE') {
        return '';
    }
    //Logger.log("change", change);
    const list: string[] = [origin, type];
    if (type === 'PROPERTY_CHANGE') {
        //@ts-ignore
        Logger.log('change.node', change.node);
        //@ts-ignore
        change.properties.forEach((property) => {
            //@ts-ignore
            list.push(change.node.type, property, change.node[`${property}`]);
        });
    } else if (type === 'STYLE_PROPERTY_CHANGE') {
        //@ts-ignore
        list.push(change.style?.name, change.properties.join(', '));
    } else if (type === 'STYLE_CREATE' || type === 'STYLE_DELETE') {
        // noop
    } else {
        //@ts-ignore
        Logger.log('change.node', change.node);
        //@ts-ignore
        list.push(change.node.type);
    }
    return list.join(' ');
}

export function getPolygonBounds(area: number[]) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < area.length; i += 2) {
        const x = area[i];
        const y = area[i + 1];

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }

    return [minX, minY, maxX - minX, maxY - minY];
}

export function createVector(selection: FrameNode, area: number[], name: string, color: RGB) {
    const points = [];
    for (let index = 0; index < area.length; index += 2) {
        points.push({x: area[index], y: area[index + 1]});
    }
    points.push({x: area[0], y: area[1]});

    const vector = figma.createVector();
    const path = pointsToPath(points);
    const bounds = getPolygonBounds(area);

    vector.vectorPaths = [{windingRule: 'NONE', data: path}];

    vector.fills = [{type: 'SOLID', color: color, opacity: 0}];
    vector.strokes = [{type: 'SOLID', color: color, opacity: 1}];
    vector.strokeWeight = 2;
    vector.blendMode = 'NORMAL';
    vector.name = name;
    vector.opacity = 1;
    vector.visible = true;
    vector.blendMode = 'PASS_THROUGH';
    vector.constrainProportions = true;
    vector.cornerRadius = vector.cornerSmoothing = 0;
    vector.x = bounds[0];
    vector.y = bounds[1];

    selection.appendChild(vector);
}

export function initDocumentChange() {
    figma.on('documentchange', (event) => {
        let messages = event.documentChanges.map(documentChangeAsString);
        messages = messages.filter((m) => m);
        if (!messages.length) {
            return;
        }
        Logger.log('documentchange', messages);
        //figma.ui.postMessage(messages, { origin: "*" });

        documentchange();
    });

    figma.on('selectionchange', async () => {
        const selection = figma.currentPage.selection[0];
        if (!selection) return null;

        Logger.log('selectionchange', selection);

        if (selection.type == 'INSTANCE') {
            Logger.log('mainComponent', selection.mainComponent);
            Logger.log('mainComponent?.parent', selection.mainComponent?.parent);
        }

        if (selection.type == 'FRAME' && selection.name == '$vector_frame') {
            Logger.log('---FRAME', selection);

            // const funfair = {
            //     spawnAreaExclusions: [],
            //     "accessArea": [
            //         19, 664, 19, 144, 171, 144, 215, 20, 782, 20, 836, 130, 894, 130, 894, 176, 980, 176, 980, 646, 894, 646, 894, 667, 726, 667, 726, 730, 89, 730, 89, 664
            //     ],
            //     "spawnArea": [
            //         880, 650, 120, 650, 120, 580, 320, 580, 450, 520, 880, 520
            //     ],
            //     "unscaleAreas": [
            //     ],
            // };

            // const world = funfair;

            // createVector(selection, world.accessArea, "@accessArea", figma.util.rgb('#00ff00'));
            // createVector(selection, world.spawnArea, "@spawnArea", figma.util.rgb('#ff0000'));
            // for (let index = 0; index < world.spawnAreaExclusions.length; index++) {
            //     const areaExclusions = world.spawnAreaExclusions[index];
            //     createVector(selection, areaExclusions, "@spawnAreaExclusions", figma.util.rgb('#ffff00'));
            // }
            // for (let index = 0; index < world.unscaleAreas.length; index++) {
            //     const unscaleArea = world.unscaleAreas[index];
            //     createVector(selection, unscaleArea, "@unscaleAreas", figma.util.rgb('#ff00ff'));
            // }
        }
        //await imgGenerate(selection);

        //documentchange();
    });
}
