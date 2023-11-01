import { Logger } from "../common/Logger";
import { BaseDocument } from "./Page/BaseDocument";
import { updateDocument } from "./UpdateDocument";

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
            Logger.log("mainComponent", selection.mainComponent?.parent);
        }
        //await imgGenerate(selection);

        //documentchange();
    });
}

