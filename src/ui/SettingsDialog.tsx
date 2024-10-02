import * as React from 'react';

let _width = 640;
let _height = 640;

let _openSettingsDialog: (open: boolean) => void;
let _setSettingsWindowSize: (width: number, height: number) => void;

export function openSettingsDialog() {
    _openSettingsDialog(true);
}

export function setSettingsWindowSize(width: number, height: number) {
    _width = width;
    _height = height;
    if (_setSettingsWindowSize) _setSettingsWindowSize(width, height);
}

interface SettingsDialogState {
    open: boolean;
    width: number;
    height: number;
}

export class SettingsDialog extends React.Component<Record<string, never>, SettingsDialogState> {
    state: SettingsDialogState = {
        open: false,
        width: _width,
        height: _height,
    };

    componentDidMount() {
        // Назначаем глобальные функции после монтирования компонента
        _openSettingsDialog = this._openSettingsDialog;
        _setSettingsWindowSize = this._setSettingsWindowSize;
    }

    private _openSettingsDialog = (open: boolean) => {
        this.setState((prevState) => ({
            ...prevState,
            open: open,
        }));
    };

    private _setSettingsWindowSize = (width: number, height: number) => {
        this.setState((prevState) => ({
            ...prevState,
            width: width,
            height: height,
        }));
    };

    render() {
        const handleChange = () => {};

        const onClose = () => {
            this.setState((prevState) => ({
                ...prevState,
                open: false,
            }));
        };

        const onResize = () => {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'resize',
                        data: {w: this.state.width, h: this.state.height},
                    },
                },
                '*',
            );
            const iframe = document.getElementById('gameFrame') as HTMLIFrameElement;
            iframe.height = `${this.state.height - 105}px`;
        };

        return (
            <>
                <input
                    type="checkbox"
                    checked={this.state.open}
                    onChange={handleChange}
                    id="my_modal_6"
                    className="modal-toggle"
                />
                <div className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            <button
                                onClick={onClose}
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            >
                                ✕
                            </button>
                        </form>
                        <h3 className="font-bold text-lg">Settings</h3>
                        <label className="label">
                            <span className="label-text">Window Width:</span>
                        </label>
                        <input
                            type="number"
                            min="640"
                            value={this.state.width}
                            onChange={(e) =>
                                this.setState((prevState) => ({
                                    ...prevState,
                                    width: parseInt(e.target.value),
                                }))
                            }
                            className="input input-bordered input-sm w-full"
                        />

                        <label className="label">
                            <span className="label-text">Window Height:</span>
                        </label>
                        <input
                            type="number"
                            min="640"
                            value={this.state.height}
                            onChange={(e) =>
                                this.setState((prevState) => ({
                                    ...prevState,
                                    height: parseInt(e.target.value),
                                }))
                            }
                            className="input input-bordered input-sm w-full"
                        />
                        <button className="btn btn-sm m-1" onClick={onResize}>
                            Resize Window
                        </button>
                        <div className="modal-action">
                            <label htmlFor="my_modal_6" onClick={onClose} className="btn">
                                OK
                            </label>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
