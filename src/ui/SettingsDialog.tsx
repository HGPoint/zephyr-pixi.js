import * as React from 'react';
import { exportData } from "./export/index";
import { Spritesheet } from "./export/Spritesheet";
import { IClientStorageData } from "../common/IClientStorageData";
import { DocumentSpritesheets } from "./DocumentSpritesheets";

let _width = 640;
let _height = 640;
let _atlasMaxWidth = 2048;
let _atlasMaxHeight = 2048;
let _atlasMargin = 2;

let _openSettingsDialog: (open: boolean) => void;
let _setSettingsWindowSize: (width:number, height: number) => void;
let _setSettingsWindowData: (atlasMaxWidth:number, atlasMaxHeight: number, atlasMargin: number) => void;

export function openSettingsDialog(){
    _openSettingsDialog(true);
}

export function setSettingsWindowData(width:number, height: number, atlasMaxWidth: number, atlasMaxHeight: number, atlasMargin: number){
    _width = width;
    _height = height;
    _atlasMaxWidth = atlasMaxWidth;
    _atlasMaxHeight = atlasMaxHeight;
    _atlasMargin = atlasMargin;
    _setSettingsWindowSize && _setSettingsWindowSize(width, height);
    _setSettingsWindowData && _setSettingsWindowData(atlasMaxWidth, atlasMaxHeight, atlasMargin);
}

export class SettingsDialog extends React.Component {
    state:{
        open: boolean;
        width: number;
        height: number;
        atlasMaxWidth: number;
        atlasMaxHeight: number;
        atlasMargin: number;
    } = {
        open: false,
        width: _width,
        height: _height,
        atlasMaxWidth: _atlasMaxWidth,
        atlasMaxHeight: _atlasMaxHeight,
        atlasMargin: _atlasMargin,
    };


    render() {

        _openSettingsDialog = (open: boolean) => {
            this.setState({
                open: open
            });
        };

        _setSettingsWindowSize = (width:number, height: number) => {
            this.setState({
                width: width,
                height: height
            });
        };

        _setSettingsWindowData = (atlasMaxWidth:number, atlasMaxHeight: number, atlasMargin: number) => {
            this.setState({
                atlasMaxWidth: atlasMaxWidth,
                atlasMaxHeight: atlasMaxHeight,
                atlasMargin: atlasMargin,
            })
        };

        const handleChange = () => {
        };

        const onClose = () => {
            this.setState({
                open: false
            });
        };

        const onResize = () => {
            parent.postMessage({ pluginMessage: { type: "resize", data: { w: this.state.width, h: this.state.height } } }, "*");
            const iframe = document.getElementById("gameFrame") as HTMLIFrameElement;
            iframe.height = `${this.state.height-105}px`;
        };

        const onSaveAtlasOptions = () => {
            parent.postMessage({ pluginMessage: { type: "atlasOptions", data: { atlasMaxWidth: this.state.atlasMaxWidth,
                        atlasMaxHeight: this.state.atlasMaxHeight, atlasMargin:  this.state.atlasMargin} } }, "*");
        };


        return (
            <>
                <input type="checkbox" checked={this.state.open} onChange={handleChange} id="my_modal_6" className="modal-toggle" />
                <div className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            <button  onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">Settings</h3>
                        <label className="label">
                            <span className="label-text">Window Width:</span>
                        </label>
                        <input type="number" min="640" value={this.state.width} onChange={(e) => this.setState({width: parseInt(e.target.value)})} className="input input-bordered input-sm w-full"/>
                        <label className="label">
                            <span className="label-text">Window Height:</span>
                        </label>
                        <input type="number" min="640" value={this.state.height} onChange={(e) => this.setState({height: parseInt(e.target.value)})}  className="input input-bordered input-sm w-full"/>
                        <button className="btn btn-sm m-1" onClick={onResize}>Resize Window</button>


                        <label className="label">
                            <span className="label-text">Common atlas max width:</span>
                        </label>
                        <input type="number" min="0" value={this.state.atlasMaxWidth} onChange={(e) => this.setState({atlasMaxWidth: parseInt(e.target.value)})} className="input input-bordered input-sm w-full"/>

                        <label className="label">
                            <span className="label-text">Common atlas max height:</span>
                        </label>
                        <input type="number" min="0" value={this.state.atlasMaxHeight} onChange={(e) => this.setState({atlasMaxHeight: parseInt(e.target.value)})}  className="input input-bordered input-sm w-full"/>


                        <label className="label">
                            <span className="label-text">Common atlas margin:</span>
                        </label>
                        <input type="number" min="0" value={this.state.atlasMargin} onChange={(e) => this.setState({atlasMargin: parseInt(e.target.value)})}  className="input input-bordered input-sm w-full"/>

                        <button className="btn btn-sm m-1" onClick={onSaveAtlasOptions}>Save atlas options</button>

                        <div className="modal-action">
                            <label htmlFor="my_modal_6" onClick={onClose} className="btn">OK</label>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}