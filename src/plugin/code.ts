Logger.log("start");

import { BaseContainer } from "./Nodes/BaseNodeContainer";
import { BaseDocument } from "./Page/BaseDocument";
import { RectangleNodeContainer } from "./Nodes/RectangleNodeContainer";
import { IClientStorageData } from "../common/IClientStorageData";
import { exportDocument } from "./export";
import { clientStorageData, loadClientStorageData, saveClientStorageData } from "./ClientStorageData";
import { updateDocument } from "./UpdateDocument";
import { Logger } from "../common/Logger";
import { initDocumentChange } from "./DocumentChange";

async function main() {

    //Logger.log("figma.currentPage", figma.currentPage);
    //Logger.log("figma.currentPage", figma.root);

    await loadClientStorageData();

    figma.showUI(__html__, { width: clientStorageData.width, height: clientStorageData.height });

    await updateDocument();

    figma.ui.postMessage({type: "clientStorageData", data: clientStorageData }, { origin: "*" });

    figma.ui.onmessage = async (message:{type:string;data:any}) => {
        switch(message.type){
          case "apply":
            await updateDocument();
            figma.ui.postMessage({type: "currentPage", data: BaseDocument.current }, { origin: "*" });
            break;
          case "clientStorageData":
            clientStorageData.url = message.data.url || clientStorageData.url;
            saveClientStorageData();
            break;
          case "setPages":
            clientStorageData.pages = message.data.pages || clientStorageData.pages;
            saveClientStorageData();
            //TODO
            break;
          case "resize":
            figma.ui.resize(message.data.w, message.data.h);
            clientStorageData.width = message.data.w;
            clientStorageData.height = message.data.h;
            saveClientStorageData();
            break;
          case "export":{
            await exportDocument();
            break;
          }
        }
        Logger.log("MSG", message);
    };

    initDocumentChange();
}
  
main();
  