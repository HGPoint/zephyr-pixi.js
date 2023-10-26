import { BaseDocument } from "./Page/BaseDocument";

interface ExportSettingsJson {
    readonly format: 'JSON'
    readonly suffix: "";
}
  
export interface IExportableResources {
    name: string;
    id: string;
    setting: ExportSettingsImage | ExportSettingsPDF | ExportSettingsSVG | ExportSettingsJson;
    bytes: Uint8Array | ArrayBuffer;
}

// function encode_utf8(s:string) {
//     return s;
// }

// function str2ab(str:string) {
//     var s = encode_utf8(str)
//     var buf = new ArrayBuffer(s.length); 
//     var bufView = new Uint8Array(buf);
//     for (var i=0, strLen=s.length; i<strLen; i++) {
//     bufView[i] = s.charCodeAt(i);
//     }
//     return bufView;
// }
  
export async function exportDocument() {

    const nodes:Array<SceneNode> = [];

    const components = BaseDocument.current.components.components;
    for (let i = 0; i < components.length; i++) {
        const component = components[i];
        if(component.content){
            const node = figma.getNodeById(component.id) as SceneNode;
            node && nodes.push(node);
        }
    }

    const componentSets = BaseDocument.current.components.componentSets;
    for (let i = 0; i < componentSets.length; i++) {
        const componentSet = componentSets[i];
        componentSet.variatns.forEach(variant => {
            const node = figma.getNodeById(variant.id) as SceneNode;
            node && nodes.push(node);
        })
    }

    let exportableResources: IExportableResources[] = []
    for (let node of nodes) {

        let { name, exportSettings, id } = node;
        if (exportSettings.length === 0) {
        exportSettings = [
                { 
                    format: "PNG", 
                    suffix: '', 
                    constraint: { type: "SCALE", value: 1 }, 
                    contentsOnly: true 
                }
            ];
        }

        for (let setting of exportSettings) {
            let defaultSetting = setting;
            const bytes = await node.exportAsync(defaultSetting);
            exportableResources.push({
                name,
                id,
                setting,
                bytes,
            });
        }
    }

    // const document = new BaseDocument(figma.root);
    // document.clearResources();
    // const stringVal = JSON.stringify(document);
    // const uint8array = str2ab(stringVal);

    // exportableResources.push({
    //     name: document.name,
    //     id: document.name,
    //     setting : { format: "JSON", suffix: "" },
    //     bytes: uint8array,
    // });
    
    figma.ui.postMessage({type: "export", data: {
        resources: exportableResources,
        document: BaseDocument.current
    }});
}