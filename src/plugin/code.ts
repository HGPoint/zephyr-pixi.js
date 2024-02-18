import {IBaseDocument} from "../common/IBaseDocument";

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
import { delay } from "./Utils/utils";

async function main() {

    await loadClientStorageData();

    figma.showUI(__html__, { width: clientStorageData.width, height: clientStorageData.height });

    figma.ui.postMessage({type: "clientStorageData", data: clientStorageData }, { origin: "*" });

    figma.ui.onmessage = async (message:{type:string;data:any}) => {
        switch(message.type){
          case "apply":
            {
              const data:{target:string|undefined, filteredIds: string[]} = message.data;
              if(data.target){
                await updateDocument(false, data.target);
                figma.ui.postMessage({type: "targetView", data: {
                    document: BaseDocument.current,
                    filteredIds: data.filteredIds.concat(),
                    target: data.target
                  } 
                }, { origin: "*" });
              } else {
                await updateDocument(true);
                figma.ui.postMessage({type: "currentPage", data: {
                    document: BaseDocument.current,
                    filteredIds: data.filteredIds.concat(),
                  } 
                }, { origin: "*" });
              }
              break;
            }
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
          case "atlasOptions":
            clientStorageData.atlasMaxWidth = message.data.atlasMaxWidth;
            clientStorageData.atlasMaxHeight = message.data.atlasMaxHeight;
            clientStorageData.atlasMargin = message.data.atlasMargin;
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

    figma.ui.postMessage({type: "setLoading", data: true }, { origin: "*" });
    await delay(100);
    await updateDocument(false);

    figma.ui.postMessage({type: "currentPage", data: {
      document: BaseDocument.current
    } }, { origin: "*" });

    
    Logger.log("STARTED");
}
  
main();
  