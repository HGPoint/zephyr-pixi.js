import { IBaseDocument } from "../../common/IBaseDocument"
import { DocumentSpritesheets } from "../DocumentSpritesheets"

const JSZip = require('../../../node_modules/jszip/dist/jszip.js')

function typedArrayToBuffer(array:any) {
  return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset)
}

function exportTypeToBlobType(type: string) {
  switch(type) {
    case "JSON": return 'text/plain'
    case "PDF": return 'application/pdf'
    case "SVG": return 'image/svg+xml'
    case "PNG": return 'image/png'
    case "JPG": return 'image/jpeg'
    default: return 'image/png'
  }
}

function exportTypeToFileExtension(type: string) {
  switch(type) {
    case "JSON": return '.json'
    case "PDF": return '.pdf'
    case "SVG": return '.svg'
    case "PNG": return '.png'
    case "JPG": return '.jpg'
    default: return '.png'
  }
}

export async function exportData (data:any, figmaDocument:IBaseDocument) {

  const exportableBytes = data;

  const atlases = await DocumentSpritesheets.build(figmaDocument);

  return new Promise<void>(resolve => {
    let zip = new JSZip();
    let fileName = "export";
    
    const imagesFolder = zip.folder("images");
    for (let data of exportableBytes) {
      const { bytes, name, setting, id } = data
      const cleanBytes = typedArrayToBuffer(bytes)
      const type = exportTypeToBlobType(setting.format);
      if(setting.format == "JSON"){
        fileName = name;
      }
      const extension = exportTypeToFileExtension(setting.format)
      let blob = new Blob([ cleanBytes ], { type })
      imagesFolder.file(`${id.split(":").join("_")}${setting.suffix}${extension}`, blob, {base64: true});
    }

    for (let atlas of atlases) {
      if(!atlas){
        continue;
      }
      const byteCharacters = atob(atlas.image.replace(/^data:image\/png;base64,/, ''));
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {type: 'image/png'});
      zip.file(`${atlas.name}.png`, blob, {base64: true});
      zip.file(`${atlas.name}.json`, JSON.stringify(atlas.json));
    }

    figmaDocument.components._components.forEach(component => {
      if(component.content) component.content._bytes = "";
    }); 

    figmaDocument.components._componentSets.forEach(component => {
      component.variants.forEach((variant:any) => variant._bytes = "");
    });

    figmaDocument._images.forEach(image => {
      image._bytes = "";
    });
    zip.file(`figma.json`, JSON.stringify(figmaDocument));

    zip.generateAsync({ type: 'blob' })
      .then((content: Blob) => {
        const blobURL = window.URL.createObjectURL(content);
        const link = document.createElement('a');
        link.className = 'button button--primary';
        link.href = blobURL;
        link.download = fileName + ".zip"
        link.click()
        link.setAttribute('download', name + '.zip');
        resolve();
      });
  })
  .then(() => {
    window.parent.postMessage({ pluginMessage: 'Done!' }, '*')
  })
}