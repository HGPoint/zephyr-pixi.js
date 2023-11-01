import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./ui.css";
import { exportData } from "./export/index";
import { Spritesheet } from "./export/Spritesheet";
import { IClientStorageData } from "../common/IClientStorageData";
import { DocumentSpritesheets } from "./DocumentSpritesheets";

declare function require(path: string): any;

interface INode {
  type: string;
  properties: {
    mainComponent:string;
  }
  id:string;
  name:string;
  _children:INode[];
}

function App() {
  const inputUrlRef = React.useRef<HTMLInputElement>(null);
  const inputResizeWidthRef = React.useRef<HTMLInputElement>(null);
  const inputResizeHeightRef = React.useRef<HTMLInputElement>(null);
  const inputPagesRef = React.useRef<HTMLInputElement>(null);

  const onExport = () => {
    parent.postMessage({ pluginMessage: { type: "export" } }, "*");
  };

  const onApply = () => {
    parent.postMessage({ pluginMessage: { type: "apply", data: { } } }, "*");
  };

  const onSetPages = () => {
    parent.postMessage({ pluginMessage: { type: "setPages", data: { pages: inputPagesRef.current?.value || "" } } }, "*");
  };

  const onGo = () => {
    const iframe = document.getElementById("gameFrame") as HTMLIFrameElement;
    iframe.src = inputUrlRef.current?.value || "";

    parent.postMessage({ pluginMessage: { type: "clientStorageData", data: { url: iframe.src } } }, "*");
  };

  const onEdit = () => {
    const iframe = document.getElementById("gameFrame") as HTMLIFrameElement;
    iframe.src = inputUrlRef.current?.value || "";

    parent.postMessage({ pluginMessage: { type: "clientStorageData", data: { url: iframe.src } } }, "*");
  };

  const onResize = () => {
    const width = parseInt(inputResizeWidthRef.current?.value || `1280`);
    const height = parseInt(inputResizeHeightRef.current?.value || `800`);
    parent.postMessage({ pluginMessage: { type: "resize", data: { w: width, h: height } } }, "*");
    const iframe = document.getElementById("gameFrame") as HTMLIFrameElement;
    iframe.height = "900px";
  };

  let loaded = false; 
  let messages = [];
  window.onmessage = (e) => onDocumentChange(e.data.pluginMessage);

  let clientStorageData: IClientStorageData = {
    pages: "",
    url: "",
    width: 1100, 
    height: 800
  };

  const onDocumentChange = async (newMessages:{type:string; data:any}) => {
    const iframe = document.getElementById("gameFrame") as HTMLIFrameElement;

      if(!newMessages || !newMessages.data){
        console.log("!!newMessages", newMessages);
        return;
      }

      const data = newMessages.data;
      switch(newMessages.type){
        case "clientStorageData":
          {
            console.log("UI : Client Storage Data", data);
            clientStorageData = data;
            if(inputUrlRef.current){
              inputUrlRef.current.value = clientStorageData.url;
            }
            if(inputResizeWidthRef.current)
            inputResizeWidthRef.current.value = `${clientStorageData.width}`;
            if(inputResizeHeightRef.current)
            inputResizeHeightRef.current.value = `${clientStorageData.height}`;

            if(inputPagesRef.current){
              inputPagesRef.current.value = clientStorageData.pages;
            }

          }
          break;
        case "export":
          {
            const result = await exportData(data.resources, data.document);
          }
          break;
        case "documentchange":
            { 
              console.log("documentchange", data);
            }
            break;
        case "currentPage":
          {
            const message = JSON.stringify(data);
            const ul = document.querySelector("ul");
            if(!ul){
              return;
            }
            iframe.contentWindow?.postMessage(message, "*");

            ul.innerHTML = "";

            const atlases = await DocumentSpritesheets.build(data);

            atlases.forEach(atlas => {
              ul.innerHTML += `<li style='margin-top:4em'>${atlas?.name}<img src='${atlas?.image}' style='max-height:640px;max-width:640px;width:auto'/></li>`;
            });
          
            //--------------

            if(data._images){
              // const atlas = new Spritesheet(48, data._images.map((image:any) => {
              //   return {
              //     src: image._bytes,
              //     name: image.id.replace(":","_")
              //   }
              // }), 1, 1, "test");
              // await atlas.addImages();
              // const result = await atlas.getOutput();

              // ul.innerHTML += 
              // data._images
              // .map((m:any) => {
              //   return `<li>${m.hash}<img src='${m._bytes}' style='max-height:100px'/></li>`;
              // })
              // .join("");

              // if(result && result.bitmaps[0])
              // ul.innerHTML += `<li>ATLAS<img src='${result.bitmaps[0].image}' style='max-height:640px;max-width:640px;width:auto'/></li>`;
            }

            if(data.components._components){
              const components: any[] = data.components._components;
              // const atlas = new Spritesheet(48, components.filter(c => c.content).map((component:any) => {
              //   return {
              //     src: component.content._bytes,
              //     name: component.id.replace(":","_")
              //   }
              // }), 1, 1, "test");
              // await atlas.addImages();
              // const result = await atlas.getOutput();
              // console.log("_components", result);
              // ul.innerHTML += 
              // components
              // .map((m:any) => {
              //   if(m.content){
              //     return `<li>${m.name}<img src='${m.content._bytes}' style='max-height:100px'/></li>`;
              //   } else {
              //     return `<li>${m.name}</li>`;
              //   }
              // })
              // .join("");

              // if(result && result.bitmaps[0])
              // ul.innerHTML += `<li>ATLAS<img src='${result.bitmaps[0].image}' style='max-height:640px;max-width:640px;width:auto'/></li>`;
            }
            
            if(data.components._componentSets){
              const components: {variatns:any[]}[] =  data.components._componentSets;
              // let images:{
              //   src: string,
              //   name: string
              // }[] = [];
              // components.forEach((component) => {
              //   component.variatns.forEach((variatn) => {
              //     images.push({
              //       src: variatn._bytes,
              //       name: variatn.id.replace(":","_")
              //     });
              //   })
              // })
              // const atlas = new Spritesheet(48, images, 1, 1, "test");
              // await atlas.addImages();
              // const result = await atlas.getOutput();

              //console.log("_componentSets", result);
              // ul.innerHTML += 
              // data.components._componentSets
              // .map((m:any) => {
              //   var content = `<li>${m.name}<ul>`
              //   content += m.variatns.map((v:any) => `<li>${v.name}<img src='${v._bytes}' style='max-height:100px'/></li>`).join("");
              //   content += `</ul></li>`;
              //   return content;
              // })
              // .join("");

              // if(result && result.bitmaps[0])
              // ul.innerHTML += `<li>ATLAS<img src='${result.bitmaps[0].image}' style='max-height:640px;max-width:640px;width:auto'/></li>`;
            }
          }
          break;
      }
  };

  return (
    <main>
      <header>
        <input id="inputUrl" ref={inputUrlRef}/> 
        <button id="goButton" onClick={onGo}><img src={require("./icons/go.svg")}/></button>
        <button id="editButton" onClick={onEdit}><img src={require("./icons/editor.svg")}/></button>
        <button onClick={onApply}>Применить</button>
        <input id="inputResizeWidth" type="number" min="640" ref={inputResizeWidthRef}/><span>x</span>
        <input id="inputResizeHeight" type="number" min="640" ref={inputResizeHeightRef}/> 
        <button id="resizeButton" onClick={onResize}><img src={require("./icons/resize.svg")}/></button>
        <button onClick={onExport}>Экспорт</button>
      </header>
      <section>
        <iframe id="gameFrame" src="" width="98%" height="900"></iframe>
      </section>
      <footer>
        <label htmlFor="inputPages">Pages:</label>
        <input id="inputPages" ref={inputPagesRef}/> 
        <button onClick={onSetPages}>Применить</button>
        <br/>
        <br/>
        {/* <input id="input" type="number" min="0" ref={inputRef} />
        <label htmlFor="input">Rectangle Count</label>
        <button className="brand" onClick={onCreate}>Create</button> */}
        <ul></ul>
      </footer>
    </main>
  );
}
const pageDiv = document.getElementById("react-page")!;
ReactDOM.createRoot(pageDiv).render(<App />);