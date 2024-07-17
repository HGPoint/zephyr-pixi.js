import * as React from 'react';
import './ui.css';
import { exportData } from "./export/index";
import { Spritesheet } from "./export/Spritesheet";
import { IClientStorageData } from "../common/IClientStorageData";
import { DocumentSpritesheets } from "./DocumentSpritesheets";
import { DocumentTree, ImageDialog, SpritesheetDialog, updateTree } from './DocumentTree';
import { LoadingDialog, completeLoadingDialog, openLoadingDialog, setProgressLoadingDialog } from './LoadingDialog';
import { SettingsDialog, openSettingsDialog, setSettingsWindowSize } from './SettingsDialog';
import { NavigationBar, setNavigationBar } from './NavigationBar';
import { Logger } from '../common/Logger';

declare function require(path: string): any;

Logger.setSource("UI");

const App = (props:any) => {

  Logger.log("App start");
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
        //console.log("!!newMessages", newMessages);
        return;
      }

      const data = newMessages.data;
      switch(newMessages.type){
        case "clientStorageData":
          {
            Logger.log("Client Storage Data", data);
            clientStorageData = data;
            // if(inputUrlRef.current){
            //   //inputUrlRef.current.value = clientStorageData.url;
            // }
            
            setNavigationBar(clientStorageData.url)
            setSettingsWindowSize(clientStorageData.width, clientStorageData.height);

            // if(inputPagesRef.current){
            //   inputPagesRef.current.value = clientStorageData.pages;
            // }

            const iframe = document.getElementById("gameFrame") as HTMLIFrameElement;
            iframe.height = `${clientStorageData.height-105}px`;
          }
          break;
        case "export":
          {
            Logger.log("export", data);
            const result = await exportData(data.resources, data.document, false);
            
            completeLoadingDialog();
          }
          break;
        case "exportAll":
          {
            Logger.log("exportAll", data);
            const result = await exportData(data.resources, data.document, true);
            
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
              
              updateTree(data.document);
              const message = JSON.stringify({
                op: "targetView",
                data: data.document,
                target: data.target
              });
              iframe.contentWindow?.postMessage(message, "*");

              completeLoadingDialog();
            }
            break;
        case "currentPage":
          {
            Logger.log("currentPage", data);

            updateTree(data.document);
            const message = JSON.stringify({
              op: "currentPage",
              data: data.document
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
          <DocumentTree/>
        </div>
      </div>
    </div>
  );
};

export default App;
