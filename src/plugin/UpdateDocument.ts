import { Logger } from "../common/Logger";
import { BaseContainer } from "./Nodes/BaseNodeContainer";
import { RectangleNodeContainer } from "./Nodes/RectangleNodeContainer";
import { TextNodeContainer } from "./Nodes/TextNodeContainer";
import { BaseDocument } from "./Page/BaseDocument";

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

export async function updateDocument() {

    const currentDocument = new BaseDocument(figma.root);

    BaseDocument.current = currentDocument;

    figma.root.children.forEach(page => {

      page.children.forEach((child) => {
          if(!child.name.startsWith("$")){
            return;
          }
        //   if(child.name != "$areas_wnd_big"){
        //     return;
        //   }
          const container = new BaseContainer(child);
      
          build(child, container);
      
          BaseDocument.current.addChild(container);
      });

    });

    await currentDocument.load();

    Logger.log("UpdateDocument", BaseDocument.current);
}