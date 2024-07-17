import { Logger } from "../common/Logger";
import { BaseContainer, IInstanceNodeProp } from "./Nodes/BaseNodeContainer";
import { RectangleNodeContainer } from "./Nodes/RectangleNodeContainer";
import { TextNodeContainer } from "./Nodes/TextNodeContainer";
import { VectorNodeContainer } from "./Nodes/VectorNodeContainer";
import { BaseDocument, loadProgress } from "./Page/BaseDocument";
import { delay, performanceNow } from "./Utils/utils";

function build(node:SceneNode, container: BaseContainer){

    if (node.type == 'INSTANCE' || node.type == 'COMPONENT' || node.type == 'FRAME' || node.type == 'GROUP'){
        for(let child of node.children){
            container.isMeta = container.isMeta || child.name.startsWith(`"Meta"`);

            if(!child.visible && !container.isMeta){//child.locked || 
                continue;
            }

            let childContainer:BaseContainer;

            switch(child.type){
                case 'RECTANGLE':{
                    childContainer = new RectangleNodeContainer(child);
                    break;
                }
                case 'VECTOR':{
                    childContainer = new VectorNodeContainer(child);
                    break;
                }
                case 'TEXT':{
                    childContainer = new TextNodeContainer(child);
                    break;
                }
                default:
                    childContainer = new BaseContainer(child);
            }

            childContainer.isMeta = container.isMeta;
            container.addChild(childContainer);
            
            build(child, childContainer);
        }
    } else if (node.type == 'RECTANGLE') {
        // let childContainer = new RectangleNodeContainer(node);
        // container.addChild(childContainer);
    }

}

function getAllMainComponentIdsFrom(container: BaseContainer): string[] {
    const result: string[] = [];
    container._children.forEach(item => {
        if (item.type === 'INSTANCE') {
            const id = (item.properties as IInstanceNodeProp).mainComponent;
            id && result.push(id);
        } else {
            result.push(...getAllMainComponentIdsFrom(item));
        }
    })
    return result;
}

//let _loaded = false;
export async function updateDocument(load:boolean = true, target = "", filter:string[] = [], isExport = false) {

    // if(_loaded && target){
    //     return;
    // }

    const currentDocument = new BaseDocument(figma.root);

    BaseDocument.current = currentDocument;

    const componentIdsToLoad: string[] = [];

    loadProgress(0, `LOADING....NODES`);
    await delay(50);

    Logger.log("FILTER", filter);

    let children:Array<SceneNode> = [];
    figma.root.children.forEach(page => {
        page.children.forEach((child) => {
            if(!child.name.startsWith("$")){
                return;
            }
            children.push(child)
        });
    });

    let index = 0;
    let timeTotal = 0;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];

        let t0 = performanceNow();
        if(filter.indexOf(child.id) >= 0 || isExport){
            const container = new BaseContainer(child);
            build(child, container);
        
            BaseDocument.current.addChild(container);

            componentIdsToLoad.push(...getAllMainComponentIdsFrom(container));
        } else {
            const container = new BaseContainer(child, true);
        
            BaseDocument.current.addChild(container);
        }

        let t1 = performanceNow();
        let timeDelay = t1 - t0;
        Logger.log(`${child.name} build time`, timeDelay);
        timeTotal += timeDelay;

        index++;

        let progress = index/children.length;
        loadProgress(progress, `LOADING....NODES ${index}/${children.length} ${child.name}`);// ${Math.floor(timeTotal/60)}:${Math.floor(timeTotal%60)}
        (!(index%3) || progress === 1) && await delay(30);
    }

    loadProgress(0, `LOADING....NODES DONE`);
    await delay(50);
    await currentDocument.load(componentIdsToLoad);

    Logger.log("UpdateDocument", BaseDocument.current);
}