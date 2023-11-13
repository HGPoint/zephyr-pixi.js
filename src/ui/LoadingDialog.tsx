import * as React from 'react';
import { exportData } from "./export/index";
import { Spritesheet } from "./export/Spritesheet";
import { IClientStorageData } from "../common/IClientStorageData";
import { DocumentSpritesheets } from "./DocumentSpritesheets";


let _openLoadingDialog: (open: boolean,ok: boolean) => void;
let _setProgressLoadingDialog: (value:number, desc:string) => void;

export function openLoadingDialog(){
    _openLoadingDialog(true, false);
}

export function completeLoadingDialog(){
    _openLoadingDialog(true, true);
}

export function setProgressLoadingDialog(value: number, desc:string){
    _setProgressLoadingDialog(value, desc);
}

export class LoadingDialog extends React.Component {

    state:{
        open: boolean;
        ok: boolean;
        proress: number;
        desc:string;
    } = {
        open: false,
        ok: false,
        proress: 0,
        desc:""
    };

    render() {

        _openLoadingDialog = (open: boolean, ok: boolean) => {
            this.setState({ 
                open: open && !ok,
                ok: ok,
                desc: ""
            });
        }; 
        
        _setProgressLoadingDialog = (value:number, desc:string) => {
            this.setState({ 
                proress: Math.round(value * 100),
                desc: desc
            });
        };

        const handleChange = () => {
        };

        const onClose = () => {
            this.setState({ 
                open: false
            });
        };
    
        return (
            <>
                <input type="checkbox" checked={this.state.open} onChange={handleChange} id="my_modal_6" className="modal-toggle" />
                <div className="modal">
                    <div className="modal-box">
                        {/* <form method="dialog">
                            { this.state.ok && <button  onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button> }
                            { !this.state.ok && <span className="loading loading-spinner loading-md absolute right-2 top-2"></span> }
                        </form> */}
                        {/* { !this.state.ok && <h3 className="font-bold text-lg my-4">Loading...</h3>} */}
                        <div className="flex flex-col w-full">
                            <div className="grid h-10 bg-base-100 place-items-center">
                                
                                { !this.state.ok && <progress className="progress progress-success w-56" value={this.state.proress} max="100"></progress>}
                                { !this.state.ok && <span>{this.state.desc}</span>}
                                

                            </div>
                        </div>

                        {/* { this.state.ok && <h3 className="font-bold text-lg">Ready</h3>}
                        <div className="modal-action">
                            { this.state.ok && <label htmlFor="my_modal_6" onClick={onClose} className="btn">OK</label> }
                        </div> */}
                    </div>
                </div>
            </>
        );
    }
}