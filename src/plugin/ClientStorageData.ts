import { IClientStorageData } from "../common/IClientStorageData";
import { Logger } from "../common/Logger";

export const clientStorageData: IClientStorageData = {
    pages: "",
    url: "",
    width: 1100,
    height: 800,
    atlasMaxWidth: 2048,
    atlasMaxHeight: 2048,
    atlasMargin: 2,
};
  
export function saveClientStorageData(){
    Logger.log("saveClientStorageData", JSON.stringify(clientStorageData));
    figma.clientStorage.setAsync("zephyr_pixi_js", clientStorageData);
}

export async function loadClientStorageData(){
    const clientStorage = await figma.clientStorage.getAsync("zephyr_pixi_js");
    if(clientStorage){
        clientStorageData.url = clientStorage.url || clientStorageData.url;
        clientStorageData.width = clientStorage.width || clientStorageData.width;
        clientStorageData.height = clientStorage.height || clientStorageData.height;
        clientStorageData.pages = clientStorage.pages || clientStorageData.pages;
        clientStorageData.atlasMaxWidth = clientStorage.atlasMaxWidth || clientStorageData.atlasMaxWidth;
        clientStorageData.atlasMaxHeight = clientStorage.atlasMaxHeight || clientStorageData.atlasMaxHeight;
        clientStorageData.atlasMargin = clientStorage.atlasMargin || clientStorageData.atlasMargin;
    }
    Logger.log("loadClientStorageData", JSON.stringify(clientStorageData));
}