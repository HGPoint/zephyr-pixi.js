import { Logger } from "../common/Logger";
import { BaseDocument } from "./Page/BaseDocument";
import { updateDocument } from "./UpdateDocument";
import { pointsToPath } from "./Utils/utils";

let selectionchangeTimer = 0;

function documentchange(){
    
    //selectionchangeTimer && clearTimeout(selectionchangeTimer)
    // selectionchangeTimer = setTimeout(async () => {
    //     await updateDocument();
    //     figma.ui.postMessage({type: "documentchange", data: BaseDocument.current }, { origin: "*" });
    // }, 100);
    
}

function documentChangeAsString(change: DocumentChange) {
    const { origin, type } = change;
    if(origin == 'REMOTE'){
      return '';
    }
    //Logger.log("change", change);
    const list: string[] = [origin, type];
    if (type === "PROPERTY_CHANGE") {
        Logger.log("change.node", change.node);
        change.properties.forEach(propertie => {
            //@ts-ignore
            list.push(change.node.type, propertie, change.node[`${propertie}`]);
        });
    } else if (type === "STYLE_PROPERTY_CHANGE") {
        //@ts-ignore
        list.push(change.style?.name, change.properties.join(", "));
    } else if (type === "STYLE_CREATE" || type === "STYLE_DELETE") {
        // noop
    } else {
        Logger.log("change.node", change.node);
        list.push(change.node.type);
    }
    return list.join(" ");
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

export function createVector(selection: FrameNode, area: number[], name: string, color: RGB){

    const points = [];
    for (let index = 0; index < area.length; index+=2) {
        points.push({x: area[index], y: area[index+1]});
    }
    points.push({x: area[0], y: area[1]});

    const vector = figma.createVector();
    const path = pointsToPath(points);
    const bounds = getPolygonBounds(area);

    vector.vectorPaths = [{ windingRule: 'NONE', data: path}];
    
    vector.fills = [{ type: "SOLID", color:color, opacity: 0}];
    vector.strokes = [{ type: "SOLID", color:color, opacity: 1}];
    vector.strokeWeight = 2;
    vector.blendMode = "NORMAL";
    vector.name = name;
    vector.opacity = 1;
    vector.visible = true;
    vector.blendMode = "PASS_THROUGH";
    vector.constrainProportions = true;
    vector.cornerRadius = vector.cornerSmoothing = 0;
    vector.x = bounds[0];
    vector.y = bounds[1];

    selection.appendChild(vector);
}

export function initDocumentChange(){

    figma.on("documentchange", (event) => {

        let messages = event.documentChanges.map(documentChangeAsString);
        messages = messages.filter(m => m);
        if(!messages.length){
        return;
        }
        Logger.log("documentchange", messages);
        //figma.ui.postMessage(messages, { origin: "*" });

        documentchange();
    });

    figma.on("selectionchange", async () => {
        const selection = figma.currentPage.selection[0];
        if(!selection) return null;

        Logger.log("selectionchange", selection);

        if (selection.type == 'INSTANCE'){
            Logger.log("mainComponent", selection.mainComponent);
            Logger.log("mainComponent?.parent", selection.mainComponent?.parent);
        }
        
        if (selection.type == 'FRAME' && selection.name == "$vector_frame"){
            
            Logger.log("---FRAME", selection);

            // const summerhouse = {
            //     accessArea: [
            //         19, 664, 19, 144, 171, 144, 215, 20, 782, 20, 836, 130, 894, 130, 894, 176, 980, 176, 980, 646, 894, 646, 894, 667, 726, 667, 726, 730, 89, 730, 89, 664
            //     ],
            //     spawnArea: [
            //         120, 650,  120, 510,  600, 510,  740, 570,  840, 570,  840, 650
            //     ],
            //     spawnAreaExclusions: [
            //         [240, 555,  300, 570,  313, 605,  264, 615,  180, 595,  186, 573]
            //     ],
            //     unscaleAreas: [
            //         [1, 1, 245, 0, 284, 53, 313, 43, 335, 44, 393, 86, 398, 94, 392, 96, 395, 104, 417, 116, 432, 158, 430, 174, 422, 171, 424, 187, 431, 191, 414, 217, 414, 343, 430, 347, 430, 362, 194, 410, 80, 373, 54, 382, 21, 366, 1, 366]
            //     ],
            // };

            // const garden = {
            //     accessArea: [
            //         19, 664, 19, 144, 171, 144, 215, 20, 782, 20, 836, 130, 894, 130, 894, 176, 980, 176, 980, 646, 894, 646, 894, 667, 726, 667, 726, 730, 89, 730, 89, 664
            //     ],
            //     spawnArea: [
            //         120, 650,  120, 570,  400, 510,  880, 510,  880, 650
            //     ],
            //     spawnAreaExclusions: [],
            //     unscaleAreas: [
            //         [123, 467, 143, 439, 245, 424, 296, 442, 332, 505, 332, 465, 367, 461, 369, 519, 326, 519, 249, 539, 245, 551, 220, 557],
            //         [999, 182, 999, 408, 983, 411, 968, 428, 939, 424, 798, 434, 725, 417, 679, 393, 662, 372, 645, 369, 638, 363, 638, 350, 650, 312, 665, 287, 696, 278, 706, 281, 728, 252, 772, 227, 847, 208, 887, 208, 914, 213, 945, 185, 973, 175]
            //     ],
            // };

            // const garage = {
            //     accessArea: [
            //         19, 664, 19, 144, 171, 144, 215, 20, 782, 20, 836, 130, 894, 130, 894, 176, 980, 176, 980, 646, 894, 646, 894, 667, 726, 667, 726, 730, 89, 730, 89, 664
            //     ],
            //     spawnArea: [
            //         120, 650,  120, 510,  515, 510,  880, 600,  880, 650
            //     ],
            //     spawnAreaExclusions: [],
            //     unscaleAreas: [
            //         [1, 1, 652, 1, 679, 59, 603, 69, 581, 57, 547, 75, 455, 53, 513, 99, 488, 123, 529, 194, 430, 181, 438, 209, 400, 265, 293, 287, 268, 350, 161, 326, 112, 334, 75, 284, 0, 287],
            //         [292, 299, 326, 293, 505, 324, 409, 351, 281, 323],
            //         [268, 359, 88, 392, 1, 369, 1, 352, 160, 329, 265, 353],
            //         [370, 353, 417, 372, 426, 387, 427, 446, 340, 488, 281, 499, 221, 500, 51, 470, 1, 433, 1, 387, 28, 380, 47, 408, 77, 424, 238, 434, 298, 429, 364, 415, 391, 398, 361, 358],
            //         [999, 44, 891, 102, 936, 123, 936, 131, 811, 142, 749, 180, 754, 189, 614, 268, 662, 296, 662, 456, 652, 460, 652, 481, 999, 555]
            //     ],
            // };

            // const lake = {
            //     accessArea: [
            //         19, 664, 19, 144, 171, 144, 215, 20, 782, 20, 836, 130, 894, 130, 894, 176, 980, 176, 980, 646, 894, 646, 894, 667, 726, 667, 726, 730, 89, 730, 89, 664
            //     ],
            //     spawnArea: [
            //         120, 650,  120, 510,  620, 510,  620, 650
            //     ],
            //     spawnAreaExclusions: [],
            //     unscaleAreas: [
            //         [1, 233, 45, 245, 44, 232, 74, 233, 74, 244, 99, 259, 132, 258, 133, 250, 162, 251, 163, 262, 188, 279, 219, 277, 219, 264,  252, 264, 252, 295, 296, 307, 296, 317, 1, 360],
            //         [417, 141, 533, 147, 672, 171, 652, 216, 594, 231, 440, 210, 411, 168],
            //         [999, 139, 955, 142, 947, 149, 882, 157, 843, 149, 815, 157, 821, 184, 817, 212, 839, 223, 871, 220, 881, 210, 947, 201, 962, 212, 999, 210],
            //         [999, 296, 924, 292, 860, 298, 807, 318, 794, 336, 800, 376, 830, 405, 874, 423, 874, 456, 999, 460],
            //         [907, 478, 895, 488, 896, 502, 770, 510, 768, 499, 727, 489, 666, 498, 672, 556, 665, 590, 680, 608, 750, 606, 770, 594, 893, 580, 928, 594, 999, 586, 999, 476]
            //     ],
            // };

            // const yard = {
            //     spawnAreaExclusions: [],
            //     accessArea: [
            //         19, 664, 19, 144, 171, 144, 215, 20, 782, 20, 836, 130, 894, 130, 894, 176, 980, 176, 980, 646, 894, 646, 894, 667, 726, 667, 726, 730, 89, 730, 89, 664
            //     ],
            //     spawnArea: [
            //         120, 650,  120, 510,  880, 510,  880, 650
            //     ],
            //     unscaleAreas: [
            //         [0, 367, 0, 205, 34, 230, 75, 206, 126, 212, 157, 232, 191, 208, 243, 199, 271, 206, 271, 284, 299, 285, 298, 318, 202, 368, 147, 384],
            //         [455, 468, 390, 448, 348, 419, 346, 376, 424, 271, 444, 230, 509, 199, 527, 203, 574, 196, 611, 173, 656, 167, 717, 203, 738, 205, 769, 232, 777, 266, 805, 319, 801, 409, 766, 457, 634, 481, 568, 481, 519, 489, 479, 484],
            //         [999, 405, 972, 404, 942, 378, 940, 364, 917, 351, 916, 333, 928, 325, 932, 228, 967, 241, 999, 238]
            //     ],
            // };

            // const fireplace = {
            //     spawnAreaExclusions: [],
            //     "accessArea": [
            //         19, 664, 19, 144, 171, 144, 215, 20, 782, 20, 836, 130, 894, 130, 894, 176, 980, 176, 980, 646, 894, 646, 894, 667, 726, 667, 726, 730, 89, 730, 89, 664
            //     ],
            //     "spawnArea": [
            //         120, 650,  120, 510,  515, 510,  880, 600,  880, 650
            //     ],
            //     "unscaleAreas": [
            //         [1, 0, 374, 0, 374, 103, 588, 111, 579, 102, 622, 79, 666, 108, 778, 109, 778, 153, 702, 161, 702, 199, 671, 210, 611, 204, 506, 221, 469, 212, 376, 215, 355, 220, 254, 209, 251, 220, 1, 254],
            //         [797, 21, 908, 21, 905, 47, 928, 48, 925, 161, 973, 166, 960, 215, 999, 221, 999, 376, 549, 305, 541, 219, 611, 207, 673, 213, 705, 201, 706, 164, 782, 156, 779, 48, 798, 48],
            //         [491, 347, 572, 366, 564, 404, 523, 431, 426, 426, 417, 370],
            //         [912, 487, 999, 454, 999, 586, 923, 572],
            //         [999, 110, 928, 110, 928, 159, 977, 163, 964, 212, 999, 217]
            //     ],
            // };

            // const japangarden = {
            //     spawnAreaExclusions: [],
            //     "accessArea": [
            //         19, 664, 19, 144, 171, 144, 215, 20, 782, 20, 836, 130, 894, 130, 894, 176, 980, 176, 980, 646, 894, 646, 894, 667, 726, 667, 726, 730, 89, 730, 89, 664
            //     ],
            //     "spawnArea": [
            //         120, 650,  120, 550,  400, 550,  560, 510,  880, 510,  880, 650
            //     ],
            //     "unscaleAreas": [
            //         [236, 1, 282, 23, 333, 28, 329, 46, 303, 57, 303, 87, 372, 132, 475, 136, 481, 153, 450, 167, 450, 191, 434, 193, 434, 344, 472, 360, 473, 386, 345, 412, 204, 426, 70, 422, 17, 396, 17, 370, 65, 346, 65, 186, 51, 186, 49, 172, 10, 140, 16, 130, 103, 132, 179, 90, 181, 62, 155, 49, 149, 27, 195, 21],
            //         [313, 419, 406, 403, 467, 415, 516, 454, 517, 520, 428, 542, 313, 488]
            //     ],
            // };

            // const greenhouse = {
            //     spawnAreaExclusions: [],
            //     "accessArea": [
            //         19, 664, 19, 144, 171, 144, 215, 20, 782, 20, 836, 130, 894, 130, 894, 176, 980, 176, 980, 646, 894, 646, 894, 667, 726, 667, 726, 730, 89, 730, 89, 664
            //     ],
            //     "spawnArea": [
            //         740, 650, 120, 650, 120, 518, 473, 518, 740, 616
            //     ],
            //     "unscaleAreas": [
            //         [0, 432, 559, 338, 562, 328, 613, 315, 717, 325, 728, 322, 726, 131, 810, 136, 811, 277, 747, 323, 750, 347, 1000, 377, 1000, 0, 0, 0]
            //     ],
            // };

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
            
            // const world = fireplace;

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

