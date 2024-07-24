import { Logger } from "../common/Logger";
import { BaseContainer, IInstanceNodeProp } from "./Nodes/BaseNodeContainer";
import { RectangleNodeContainer } from "./Nodes/RectangleNodeContainer";
import { TextNodeContainer } from "./Nodes/TextNodeContainer";
import { VectorNodeContainer } from "./Nodes/VectorNodeContainer";
import { BaseDocument, loadProgress } from "./Page/BaseDocument";
import { delay, performanceNow } from "./Utils/utils";

function buildInstance(node:SceneNode, container: BaseContainer, isMeta: boolean){

    if (node.type == 'INSTANCE' || node.type == 'COMPONENT' || node.type == 'FRAME' || node.type == 'GROUP'){
        for(let child of node.children){
            container.isMeta = container.isMeta || child.name.startsWith(`"Meta"`);

            if(!child.visible && !container.isMeta){
                continue;
            }

            if(container.isMeta){

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
                buildInstance(child, childContainer, isMeta || container.isMeta);

            } else {
                let childContainer:BaseContainer|null = null;
                switch(child.type){
                    case 'TEXT':{
                        childContainer = new TextNodeContainer(child);
                        break;
                    }
                }
                childContainer && container.addChild(childContainer);
            }
            
        }
    } else if (node.type == 'RECTANGLE') {
        
    }

}

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
            
            if(node.type == 'INSTANCE'){
                buildInstance(child, childContainer, false);
            } else {
                build(child, childContainer);
            }
        }
    } else if (node.type == 'RECTANGLE') {
        // let childContainer = new RectangleNodeContainer(node);
        // container.addChild(childContainer);
    }

}

//let _loaded = false;
export async function updateDocument(load:boolean = true, target = "", filter:string[] = [], isExport = false, skipResourceLoad = false) {

    if(target){
        return;
    }

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
    if(!skipResourceLoad){
        await currentDocument.load();
    }
    

    Logger.log("UpdateDocument", BaseDocument.current);
}