

export async function delay (value: number) {
    return new Promise<void>((resolve, reject) => {
        setTimeout(()=>{
            resolve();
        }, value)
    });
}

async function imgGenerate(node:SceneNode){
    if (node.type == 'FRAME'){

        const bytes = await node.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 2 },
        })
        const image = figma.createImage(bytes);
        const frame = figma.createFrame()
        frame.x = 200
        frame.resize(200, 230)
        frame.fills = [{
            imageHash: image.hash,
            scaleMode: "FILL",
            scalingFactor: 1,
            type: "IMAGE",
        }];
    }
}