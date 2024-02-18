import * as React from 'react';
import './ui.css';
import { exportData } from "./export/index";
import { Spritesheet } from "./export/Spritesheet";
import { IClientStorageData } from "../common/IClientStorageData";
import { DocumentSpritesheets } from "./DocumentSpritesheets";
import { DocumentTree, ImageDialog, SpritesheetDialog, updateTree } from './DocumentTree';
import { LoadingDialog, completeLoadingDialog, openLoadingDialog, setProgressLoadingDialog } from './LoadingDialog';
import { SettingsDialog, openSettingsDialog, setSettingsWindowData } from './SettingsDialog';
import { NavigationBar, setNavigationBar } from './NavigationBar';
import {IBaseDocument} from "../common/IBaseDocument";
import {BaseDocument} from "../plugin/Page/BaseDocument";

declare function require(path: string): any;

const App = (props:any) => {

  console.log("App start");
  let loaded = false; 
  let messages = [];
  window.onmessage = (e) => onDocumentChange(e.data.pluginMessage);

  let clientStorageData: IClientStorageData = {
    pages: "",
    url: "",
    width: 1100, 
    height: 800,
    atlasMaxWidth: 2048,
    atlasMaxHeight: 2048,
    atlasMargin: 2,
  };

  const onDocumentChange = async (newMessages:{type:string; data:any}) => {

    const iframe = document.getElementById("gameFrame") as HTMLIFrameElement;

      if(!newMessages || !newMessages.data){
        //console.log("!!newMessages", newMessages);
        return;
      }

      const data = newMessages.data;
      switch(newMessages.type){
        case "clientStorageData":
          {
            console.log("UI : Client Storage Data", data);
            clientStorageData = data;
            // if(inputUrlRef.current){
            //   //inputUrlRef.current.value = clientStorageData.url;
            // }
            
            setNavigationBar(clientStorageData.url)
            setSettingsWindowData(clientStorageData.width, clientStorageData.height, clientStorageData.atlasMaxWidth, clientStorageData.atlasMaxHeight, clientStorageData.atlasMargin);

            // if(inputPagesRef.current){
            //   inputPagesRef.current.value = clientStorageData.pages;
            // }

            const iframe = document.getElementById("gameFrame") as HTMLIFrameElement;
            iframe.height = `${clientStorageData.height-105}px`;
          }
          break;
        case "export":
          {
            const result = await exportData(data.resources, data.document, data.options);
            
            completeLoadingDialog();
          }
          break;
        case "documentchange":
            { 
              console.log("documentchange", data);
            }
            break;
        case "loadProgress":
            { 
              setProgressLoadingDialog(data.value, data.desc);
            }
            break;
        case "setLoading":
            { 
              if(data){
                openLoadingDialog();
              }
            }
            break;
        case "targetView":
            {
              const baseDocument: IBaseDocument = data.document as IBaseDocument;
              const filteredDocument: IBaseDocument = {
                atlases: baseDocument.atlases,
                _images: baseDocument._images,
                _children: baseDocument._children.filter(item => !data.filteredIds || data.filteredIds.includes(item.id)),
                components: baseDocument.components,
              }

              updateTree(data.document);
              const message = JSON.stringify({
                op: "targetView",
                data: filteredDocument,
                target: data.target
              });
              iframe.contentWindow?.postMessage(message, "*");

              completeLoadingDialog();
            }
            break;
        case "currentPage":
          {
            //console.log("currentPage", data);
            const baseDocument: IBaseDocument = data.document as IBaseDocument;
            const filteredDocument: IBaseDocument = {
              atlases: baseDocument.atlases,
              _images: baseDocument._images,
              _children: baseDocument._children.filter(item => !data.filteredIds || data.filteredIds.includes(item.id)),
              components: baseDocument.components,
            }

            updateTree(data.document);
            const message = JSON.stringify({
              op: "currentPage",
              data: filteredDocument
            });

            iframe.contentWindow?.postMessage(message, "*");
            completeLoadingDialog();
          }
          break;
      }
  };

  return (
    <div>
      <ImageDialog/>
      <SpritesheetDialog/>
      <LoadingDialog/>
      <SettingsDialog/>
      <div className="drawer">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* Page content here */}

          <NavigationBar/>

          <div className="mockup-browser border bg-base-300">
            <div className="mockup-browser-toolbar">
              
              <div className="tabs">
                <a className="tab tab-xs tab-lifted tab-active">preview</a> 
                <a className="tab tab-xs tab-lifted">readme.txt</a> 
                <a className="tab tab-xs tab-lifted">about</a>
              </div>

              
            </div>
            <div className="flex justify-center bg-base-200">
              <iframe id="gameFrame" src="" width="100%" height="900"></iframe>
            </div>
          </div>

          <div className="overflow-x-auto">

            {/* <table className="table">
                <thead>
                <tr>
                    <th>
                    </th>
                    <th>sector</th>
                    <th>atlas</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                
                </tbody>
                
            </table> */}
            
          </div>


        </div> 
        <div className="drawer-side z-40">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <img src={require("./images/figma_to_pixijs_logo_sm.png")}/>
            <DocumentTree/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
