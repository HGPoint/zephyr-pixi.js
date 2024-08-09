import { IBaseDocument } from "../../common/IBaseDocument"
import { IBaseNode, IBaseRectangleNode } from "../../common/IBaseNode"
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

async function convertBlob(blob:any, type:'image/png'|'image/webp'|'image/jpeg'): Promise<Blob> {
  return new Promise((resolve, reject) => {
      let canvas = createTempCanvas();
      let ctx = canvas.getContext('2d');
      if(!ctx){ 
        reject();
        return;
      }
      let image = new Image();
      image.src = URL.createObjectURL(blob);
      image.onload = function(){
          canvas.width = image.width;
          canvas.height = image.height;
          ctx && ctx.drawImage(image, 0, 0);
          let result = dataURItoBlob(canvas.toDataURL(type));
          resolve(result);
      }
  })
}

function dataURItoBlob(dataURI:string) {
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  var blob = new Blob([ab], {type: mimeString});
  return blob;
}

function createTempCanvas(): HTMLCanvasElement {
  let canvas = document.createElement('canvas');
  canvas.style.display = 'none';
  return canvas;
}

const RECTANGLE_DEFAULT_VALUES = {
  "isMeta": false,
  "visible": true,
  "properties": {
    "isMask": false,
    "cornerRadius": 0,
    "layoutPositioning": "AUTO",
    "layoutSizingHorizontal": "FIXED",
    "layoutSizingVertical": "FIXED",
    "constraints": {
      "horizontal": "STRETCH",
      "vertical": "STRETCH"
    },
    "minWidth": null,
    "minHeight": null,
    "maxWidth": null,
    "maxHeight": null
  },
  "isEmpty": false,
  "_children": [],
  "_fill": [],
  "_fillGeometry": []
}

const FRAME_DEFAULT_VALUES = {
  "isMeta": false,
  "isEmpty": false,
  "visible": true,
  "properties": {
    "opacity": 1,
    "rotation": 0,
    "layoutMode": "NONE",
    "layoutAlign": "INHERIT",
    "layoutGrow": 0,
    "primaryAxisSizingMode": "AUTO",
    "counterAxisSizingMode": "FIXED",
    "primaryAxisAlignItems": "MIN",
    "counterAxisAlignItems": "MIN",
    "constraints": {
      "horizontal": "STRETCH",
      "vertical": "STRETCH"
    },
    "layoutPositioning": "AUTO",
    "layoutSizingHorizontal": "FIXED",
    "layoutSizingVertical": "FIXED",
    "paddingLeft": 0,
    "paddingRight": 0,
    "paddingTop": 0,
    "paddingBottom": 0,
    "itemSpacing": 0,
    "itemReverseZIndex": false,
    "strokesIncludedInLayout": false,
    "gridStyleId": "",
    "clipsContent": true,
    "minWidth": null,
    "minHeight": null,
    "maxWidth": null,
    "maxHeight": null
  },
}

const VECTOR_DEFAULT_VALUES = {
  "isMeta": false,
  "visible": true,
  "properties": {
    "minWidth": null,
    "minHeight": null,
    "maxWidth": null,
    "maxHeight": null
  },
  "isEmpty": false,
  "_children": [],
  "_fill": [],
  "_fillGeometry": []
}

const isObject = (object:any) => {
  return object != null && typeof object === "object";
};

const isDeepEqual = (object1:any, object2:any) => {

  const objKeys1 = Object.keys(object1);
  const objKeys2 = Object.keys(object2);

  if (objKeys1.length !== objKeys2.length) return false;

  for (var key of objKeys1) {
    const value1 = object1[key];
    const value2 = object2[key];

    const isObjects = isObject(value1) && isObject(value2);

    if ((isObjects && !isDeepEqual(value1, value2)) ||
      (!isObjects && value1 !== value2)
    ) {
      return false;
    }
  }
  return true;
};

function removeDefault(object1:any, object2:any) {
  
  const objKeys1 = Object.keys(object1);
  //const objKeys2 = Object.keys(object2);

  //if (objKeys1.length !== objKeys2.length) return false;

  for (var key of objKeys1) {
    const value1 = object1[key];
    const value2 = object2[key];

    const isObjects = isObject(value1) && isObject(value2);

    if(isObjects){
      removeDefault(value1, value2);
    } else if (Array.isArray(value1) && Array.isArray(value2)) {
      if (value1.length == value2.length) {
        if(value1.length = 0) {
          delete object1[key];
        }
        // for (let i = 0; i < object1.length; i++) {
        //   if (!isDeepEqual(object1[i], object2[i])) {
        //     return false;
        //   }
        // }
      }
    } else if (value1 == value2) {
      delete object1[key];
    }
  }
}

function removeDefaultValues(children: Array<IBaseNode>){
  for (let index = children.length-1; index >= 0; index--) {
    const child = children[index];

    switch(child.type) {
      case "RECTANGLE":{
        removeDefault(child, RECTANGLE_DEFAULT_VALUES);
        break;
      }
      case "FRAME":{
        removeDefault(child,FRAME_DEFAULT_VALUES);
        break;
      }
      case "VECTOR":{
        removeDefault(child, VECTOR_DEFAULT_VALUES);
        break;
      }
      case "":{
        children.splice(index, 1);
        break;
      }
      case "INSTANCE":{
        removeDefault(child,FRAME_DEFAULT_VALUES);
        //console.log("INSTANCE", child._children);
        //child._children = [];
        break;
      }
    }
    
    removeDefaultValues(child._children);
  }
}

export async function exportData (data:any, figmaDocument:IBaseDocument, exportAs:"export"|"exportAll"|"exportFigma") {

  const exportableBytes = data;

  if(exportAs == "exportFigma"){
    return new Promise<void>(resolve => {

      figmaDocument.components._components.forEach(component => {
        if(component.content) component.content._bytes = "";
      }); 
  
      figmaDocument.components._componentSets.forEach(component => {
        component.variants.forEach((variant:any) => variant._bytes = "");
      });
  
      figmaDocument._images.forEach(image => {
        image._bytes = "";
      });

      figmaDocument._images = [];

      for (let index = figmaDocument._children.length-1; index >= 0; index--) {
        const child = figmaDocument._children[index];
        
        const childId = child.id.split(":").join("_");
        //@ts-ignore
        figmaDocument._children[index] = `${childId}.figma.json`;
        figmaDocument._defaults = {
          "RECTANGLE": RECTANGLE_DEFAULT_VALUES,
          "FRAME": FRAME_DEFAULT_VALUES,
          "VECTOR": VECTOR_DEFAULT_VALUES,
          "INSTANCE": FRAME_DEFAULT_VALUES,
        };
        // figmaDocument._children[index] = {
        //     id: child.id,
        //     type: child.type,
        //     name: child.name,
        //     _children: [],
        //     visible: child.visible,
        //     x: child.x,
        //     y: child.y,
        //     width: child.width,
        //     height: child.height,
        //     properties: child.properties
        //   }
      }
      
      removeDefaultValues(figmaDocument._children);

      const str = JSON.stringify(figmaDocument, null, "\t");
      const bytes = new TextEncoder().encode(str);
      const content = new Blob([bytes], {
          type: "application/json;charset=utf-8"
      });
      const blobURL = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.className = 'button button--primary';
      link.href = blobURL;
      link.download = "figma.json"
      link.click()
      link.setAttribute('download', "figma.json");
      resolve();
    })
    .then(() => {
      window.parent.postMessage({ pluginMessage: 'Done!' }, '*')
    })
  }
  
  const atlases = await DocumentSpritesheets.build(figmaDocument, exportAs == "exportAll");

  return new Promise<void>(async (resolve, reject) => {
    let zip = new JSZip();
    let fileName = "export";
    
    // const imagesFolder = zip.folder("images");
    // for (let data of exportableBytes) {
    //   const { bytes, name, setting, id } = data
    //   const cleanBytes = typedArrayToBuffer(bytes)
    //   const type = exportTypeToBlobType(setting.format);
    //   if(setting.format == "JSON"){
    //     fileName = name;
    //   }
    //   const extension = exportTypeToFileExtension(setting.format)
    //   let blob = new Blob([ cleanBytes ], { type })
    //   imagesFolder.file(`${id.split(":").join("_")}${setting.suffix}${extension}`, blob, {base64: true});
    // }

    for (let data of exportableBytes) {
      const { bytes, name, setting, id } = data;
      if(!name.endsWith(".jpg")){
        continue;
      }
      if(setting.format != "PNG"){
        continue;
      }
      console.log("exportableBytes file", name, data);
      const cleanBytes = typedArrayToBuffer(bytes)
      const type = exportTypeToBlobType(setting.format);
      const extension = exportTypeToFileExtension(setting.format)
      let blob = new Blob([ cleanBytes ], { type });
      let jpegBlob = await convertBlob(blob, 'image/jpeg');
      zip.file(`${id.split(":").join("_")}${setting.suffix}${".jpg"}`, jpegBlob, {base64: true});
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
      if(component.content) {
        component.content._bytes = "";
      }
      if(component.name.endsWith(".jpg")){
        component.url = `${component.id.split(":").join("_")}${".jpg"}`;
      }
    }); 

    figmaDocument.components._componentSets.forEach(component => {
      component.variants.forEach((variant:any) => variant._bytes = "");
    });

    // figmaDocument._images.forEach(image => {
    //   image._bytes = "";
    // });
    figmaDocument.atlases = atlases.filter(a => !!a).map(a => a?.name ? a.name:'');
    
    figmaDocument._images = [];
    figmaDocument._defaults = {
      "RECTANGLE": RECTANGLE_DEFAULT_VALUES,
      "FRAME": FRAME_DEFAULT_VALUES,
      "VECTOR": VECTOR_DEFAULT_VALUES,
      "INSTANCE": FRAME_DEFAULT_VALUES,
    };
      
    removeDefaultValues(figmaDocument._children);

    for (let index = figmaDocument._children.length-1; index >= 0; index--) {
      const child = figmaDocument._children[index];

      if(!child.type){
        continue;
      }
      
      const childId = child.id.split(":").join("_");
      zip.file(`${childId}.figma.json`, JSON.stringify(child, null, "\t"));

      //@ts-ignore
      figmaDocument._children[index] = `${childId}.figma.json`;
    }

    if(exportAs == "exportAll"){
      zip.file(`root.figma`, JSON.stringify(figmaDocument, null, "\t"));
    }

    zip.generateAsync({ type: 'blob' })
      .then((content: Blob) => {
        const blobURL = window.URL.createObjectURL(content);
        const link = document.createElement('a');
        link.className = 'button button--primary';
        link.href = blobURL;
        link.download = fileName + ".zip"
        link.click()
        link.setAttribute('download', fileName + '.zip');
        resolve();
      });
  })
  .then(() => {
    window.parent.postMessage({ pluginMessage: 'Done!' }, '*')
  })
}