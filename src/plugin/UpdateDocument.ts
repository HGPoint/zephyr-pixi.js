import { Logger } from "../common/Logger";
import { BaseContainer } from "./Nodes/BaseNodeContainer";
import { RectangleNodeContainer } from "./Nodes/RectangleNodeContainer";
import { TextNodeContainer } from "./Nodes/TextNodeContainer";
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

let _loaded = false;
export async function updateDocument(load:boolean = true, target = "") {

    if(_loaded && target){
        return;
    }

    const currentDocument = new BaseDocument(figma.root);

    BaseDocument.current = currentDocument;

    loadProgress(0, `LOADING....NODES`);
    await delay(50);

    figma.root.children.forEach(page => {

      page.children.forEach((child) => {
            if(!child.name.startsWith("$")){
                return;
            }

            // if(child.name != "$booster_unlocked_window" && child.name != "$BOOSTER_BUY"){
            //     return;
            // }
            let t0 = performanceNow();
            const container = new BaseContainer(child);
      
            build(child, container);
        
            BaseDocument.current.addChild(container);

            
            let t1 = performanceNow();
            let delay = t1 - t0;
            Logger.log(`${child.name} buid time`, delay);
      });

    });

    load && await currentDocument.load();

    _loaded = _loaded || load;

    if(!_loaded && target){
        await currentDocument.load();
        _loaded = true;
    }

    Logger.log("UpdateDocument", BaseDocument.current);
}