import * as React from 'react';
import { exportData } from "./export/index";
import { Spritesheet } from "./export/Spritesheet";
import { IClientStorageData } from "../common/IClientStorageData";
import { DocumentSpritesheets } from "./DocumentSpritesheets";

let _width = 640;
let _height = 640;

let _openSettingsDialog: (open: boolean) => void;
let _setSettingsWindowSize: (width:number, height: number) => void;

export function openSettingsDialog(){
    _openSettingsDialog(true);
}

export function setSettingsWindowSize(width:number, height: number){
    _width = width;
    _height = height;
    _setSettingsWindowSize && _setSettingsWindowSize(width, height);
}

export class SettingsDialog extends React.Component {

    state:{
        open: boolean;
        width: number;
        height: number;
    } = {
        open: false,
        width: _width,
        height: _height
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
                        <input type="number" min="0" value={this.state.width} onChange={(e) => this.setState({width: parseInt(e.target.value)})} className="input input-bordered input-sm w-full"/>

                        <label className="label">
                            <span className="label-text">Common atlas max height:</span>
                        </label>
                        <input type="number" min="0" value={this.state.height} onChange={(e) => this.setState({height: parseInt(e.target.value)})}  className="input input-bordered input-sm w-full"/>
                        <button className="btn btn-sm m-1" onClick={onResize}>Save atlas options</button>

                        <div className="modal-action">
                            <label htmlFor="my_modal_6" onClick={onClose} className="btn">OK</label>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}