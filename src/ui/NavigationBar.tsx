import * as React from 'react';
import { exportData } from "./export/index";
import { Spritesheet } from "./export/Spritesheet";
import { IClientStorageData } from "../common/IClientStorageData";
import { DocumentSpritesheets } from "./DocumentSpritesheets";
import { openLoadingDialog } from './LoadingDialog';
import { delay } from '../plugin/Utils/utils';
import { openSettingsDialog } from './SettingsDialog';
import {DocumentFilter} from "./DocumentFilter";
import {Logger} from "../common/Logger";

let _url = "";
let _count:number = 0;
let _selectedCount:number = 0;

let _setNavigationBar: (url:string) => void;
let _setNavigationBarData: (selectedCount: number, count:number) => void;

export function setNavigationBar(url:string){
    _url = url;
    _setNavigationBar && _setNavigationBar(url);
}

export function setNavigationBarCount(selectedCount: number, count:number){
    _selectedCount = selectedCount;
    _count = count;
    _setNavigationBarData && _setNavigationBarData(selectedCount, count);
}

export class NavigationBar extends React.Component {

    state:{
        url: string;
        count: number;
        selectedCount: number,
    } = {
        url:"",
        count: _count,
        selectedCount: _selectedCount,
    };

    render() {

        _setNavigationBar = (url:string) => {
            this.setState({ 
                url: url
            });
        };

        _setNavigationBarData = (selectedCount: number, count:number) => {
            this.setState({
                selectedCount: selectedCount,
                count: count,
            });
        };

        const onExport = async () => {
            openLoadingDialog();
            await delay(200);
            parent.postMessage({ pluginMessage: { type: "export" } }, "*");
        };
        
        const onApply = async () => {
            openLoadingDialog();
            await delay(200);
            parent.postMessage({ pluginMessage: { type: "apply", data: { filteredIds: DocumentFilter.instance.getSelectedIds()} } }, "*");
        };
        
        const onGo = () => {
            const iframe = document.getElementById("gameFrame") as HTMLIFrameElement;
            iframe.src = this.state.url || "";
        
            parent.postMessage({ pluginMessage: { type: "clientStorageData", data: { url: iframe.src } } }, "*");
        };
        
        const onEdit = () => {
        };
    
        const onSettings = () => {
            openSettingsDialog();
        };

        return (
            <>
                <div className="navbar bg-base-100">
                    <div className="flex-none">
                    <label onClick={onEdit} htmlFor="my-drawer" className="drawer-button btn btn-sm btn-square btn-ghost mx-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </label>
                    </div>
                    <div className="flex-1">
                    <input  value={this.state.url} onChange={(e) => this.setState({url: e.target.value})}  type="text" placeholder="url" className="input input-bordered input-sm w-full max-w-xs" />
                    <div className="tooltip tooltip-bottom mx-0.5" data-tip="open page">
                        <button className="btn btn-sm mx-0.5" onClick={onGo}><img src={require("./icons/go.svg")}/></button>
                    </div>
                    </div>
                    <div className="flex-none">
                    <div className="indicator">
                        <span className="indicator-item badge">{this.state.selectedCount}/{this.state.count}</span>
                        <button className="btn btn-sm mx-0.5" onClick={onApply}>Apply</button>
                    </div>
                    <button className="btn btn-sm mx-5" onClick={onExport}>Export...</button>
                    <button className="btn btn-sm btn-square btn-ghost mx-0.5" onClick={onSettings}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                    </button>
                    </div>
                </div>
            </>
        );
    }
}