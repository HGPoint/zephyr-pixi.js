import * as React from 'react';

import {IBaseDocument} from '../common/IBaseDocument';
import {Logger} from '../common/Logger';
import {delay} from '../plugin/Utils/utils';

import {DocumentFilter} from './DocumentFilter';
import {DocumentSpriteSheets} from './DocumentSpriteSheets';
import {completeLoadingDialog, openLoadingDialog} from './LoadingDialog';
import {setNavigationBarCount} from './NavigationBar';

//export let _figmaData = require("./figma.json");
let _figmaData: IBaseDocument = {
    components: {
        _components: [],
        _componentSets: [],
    },
    _children: [],
    _images: [],
    atlases: [],
    _defaults: [],
};

let openImgDialog: (node: any) => void;

interface ImageDialogState {
    openImage: boolean;
    node: any;
}

export class ImageDialog extends React.Component<Record<string, never>, ImageDialogState> {
    state: ImageDialogState = {
        openImage: false,
        node: null,
    };

    componentDidMount() {
        // Назначаем глобальные функции после монтирования компонента
        openImgDialog = this._openImgDialog;
    }

    private _openImgDialog = (node: any) => {
        this.setState({
            openImage: true,
            node: node,
        });
    };

    render() {
        const handleChange = () => {};

        const onClose = () => {
            this.setState({
                openImage: false,
                node: null,
            });
        };

        return (
            <>
                <input
                    type="checkbox"
                    checked={this.state.openImage}
                    onChange={handleChange}
                    id="my_modal_6"
                    className="modal-toggle"
                />
                <div className="modal">
                    <div className="modal-box">
                        // @ts-ignore
                        <p className="py-4">{this.state.node?.name}</p>
                        <img src={this.state.node?._bytes} />
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

function TreeComponentNode({node}: {node: any}) {
    const {name} = node;

    const [showChildren, setShowChildren] = React.useState(false);

    const handleClick = () => {
        Logger.log('node', node);
        openImgDialog(node.content);
    };

    return (
        <li>
            <a onClick={handleClick}>
                {' '}
                <img
                    width={24}
                    height={24}
                    className="w-4 h-4"
                    src={require('./icons/img.svg')}
                />{' '}
                {name}{' '}
            </a>
        </li>
    );
}

function TreeVariantsNode({node}: {node: any}) {
    const {name} = node;

    const [showChildren, setShowChildren] = React.useState(false);

    const handleClick = () => {
        Logger.log('node', node);
        openImgDialog(node);
    };

    return (
        <li>
            <a onClick={handleClick}>
                {' '}
                <img
                    width={24}
                    height={24}
                    className="w-4 h-4"
                    src={require('./icons/img.svg')}
                />{' '}
                {name}{' '}
            </a>
        </li>
    );
}

function TreeComponentSetNode({node}: {node: any}) {
    const {name} = node;

    const [showChildren, setShowChildren] = React.useState(false);

    const handleClick = () => {
        setShowChildren(!showChildren);
    };

    return (
        <li>
            <details open={false}>
                <summary onClick={handleClick}>
                    {' '}
                    <img
                        width={24}
                        height={24}
                        className="w-4 h-4"
                        src={require('./icons/folder.svg')}
                    />{' '}
                    {name}{' '}
                </summary>
                <ul>
                    {showChildren &&
                        node.variants.map((node: any) => (
                            <TreeVariantsNode node={node} key={node.id} />
                        ))}
                </ul>
            </details>
        </li>
    );
}

/////////

let _spriteSheets: any[] = [];

let openSpriteSheetDialog: (spriteSheet: any) => void;

interface SpriteSheetDialogState {
    open: boolean;
    spriteSheet: any;
}

export class SpriteSheetDialog extends React.Component<
    Record<string, never>,
    SpriteSheetDialogState
> {
    state: SpriteSheetDialogState = {
        open: false,
        spriteSheet: null,
    };

    componentDidMount() {
        // Назначаем глобальные функции после монтирования компонента
        openSpriteSheetDialog = this._openSpriteSheetDialog;
    }

    private _openSpriteSheetDialog = (spriteSheet: any) => {
        this.setState({
            open: true,
            spriteSheet: spriteSheet,
        });
    };

    render() {
        const handleChange = () => {};

        const onClose = () => {
            this.setState((prevState) => ({
                ...prevState,
                open: false,
                node: null,
            }));
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
                        <p className="py-4">{this.state.spriteSheet?.name}</p>
                        <img src={this.state.spriteSheet?.image} />
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

function TreeSpriteSheetNode({spriteSheet}: {spriteSheet: any}) {
    const {name, node_id} = spriteSheet;

    const [showChildren, setShowChildren] = React.useState(false);

    const node = _figmaData._children.find((n) => n.id == node_id);

    const handleClick = () => {
        Logger.log('spriteSheet', spriteSheet);
        openSpriteSheetDialog(spriteSheet);
    };

    return (
        <li>
            <a onClick={handleClick}>
                {' '}
                <img
                    width={24}
                    height={24}
                    className="w-4 h-4"
                    src={require('./icons/img.svg')}
                />{' '}
                {node?.name} ({name}){' '}
            </a>
        </li>
    );
}

function TreeSpriteSheetsNode() {
    const [showChildren, setShowChildren] = React.useState(false);

    const handleClick = async () => {
        if (!showChildren) {
            openLoadingDialog();
            await delay(100);
            // parent.postMessage({ pluginMessage: { type: "apply", data: { } } }, "*");
            // try{
            // } catch {

            // }
            _spriteSheets = await DocumentSpriteSheets.build(_figmaData, true);
            Logger.log('SpriteSheets', _spriteSheets);
            completeLoadingDialog();
        }
        setShowChildren(!showChildren);
    };

    return (
        <li>
            <details open={false}>
                <summary onClick={handleClick}>
                    {' '}
                    <img
                        width={24}
                        height={24}
                        className="w-4 h-4"
                        src={require('./icons/folder.svg')}
                    />{' '}
                    All{' '}
                </summary>
                <ul>
                    {showChildren &&
                        _spriteSheets
                            .filter((spriteSheet) => !!spriteSheet)
                            .map((spriteSheet: any) => (
                                <TreeSpriteSheetNode
                                    spriteSheet={spriteSheet}
                                    key={spriteSheet.name}
                                />
                            ))}
                </ul>
            </details>
        </li>
    );
}

////

function TreeViewNode({node, path}: {node: any; path: string}) {
    const {name} = node;

    const [showChildren, setShowChildren] = React.useState(false);

    const handleClick = async () => {
        Logger.log('node', node);
        openLoadingDialog();
        await delay(100);
        parent.postMessage(
            {
                pluginMessage: {
                    type: 'apply',
                    data: {
                        target: `${path}.${node.name}`,
                        filteredIds: DocumentFilter.instance.getSelectedIds(),
                    },
                },
            },
            '*',
        );
    };

    return (
        <li>
            <a onClick={handleClick}>
                {' '}
                <img
                    width={24}
                    height={24}
                    className="w-4 h-4"
                    src={require('./icons/go.svg')}
                />{' '}
                {name}{' '}
            </a>
        </li>
    );
}

function TreeSectorsNode({node}: {node: any}) {
    const {name, id} = node;

    const [showChildren, setShowChildren] = React.useState(false);
    let [checked, setChecked] = React.useState(DocumentFilter.instance.getSelectedById(id));
    let [visible, setVisible] = React.useState(DocumentFilter.instance.getVisibleByName(name));
    checked = DocumentFilter.instance.getSelectedById(id);
    visible = DocumentFilter.instance.getVisibleByName(name);

    const handleClick = () => {
        Logger.log(`NODE ${node.name}`, node);
        setShowChildren(!showChildren);
    };

    const handleChange = () => {
        setChecked(!checked);
        DocumentFilter.instance.setSelectedById(id, !checked);
    };

    return (
        <li style={{display: visible ? 'flex' : 'none'}}>
            <details open={false}>
                <summary onClick={handleClick}>
                    <input
                        onChange={handleChange}
                        checked={checked}
                        type="checkbox"
                        className="checkbox checkbox-xs"
                    />
                    <img
                        width={24}
                        height={24}
                        className="w-4 h-4"
                        src={require('./icons/folder.svg')}
                    />{' '}
                    {name}{' '}
                </summary>
                <ul>
                    {showChildren &&
                        node._children.map((childNode: any) => (
                            <TreeViewNode
                                node={childNode}
                                path={`${node.name}`}
                                key={childNode.id}
                            />
                        ))}
                </ul>
            </details>
        </li>
    );
}

export let updateTree: (figmaData: any) => void;

interface DocumentTreeState {
    counter: number;
    figmaData: IBaseDocument | null;
    allSelected: boolean;
    search: string;
}

export class DocumentTree extends React.Component<Record<string, never>, DocumentTreeState> {
    state: DocumentTreeState = {
        counter: 0,
        figmaData: _figmaData,
        allSelected: false,
        search: '',
    };

    render() {
        const handleAllCheckedChange = () => {
            this.setState((prevState) => ({
                ...prevState,
                allSelected: !this.state.allSelected,
            }));
            if (this.state.allSelected) {
                DocumentFilter.instance.deselectAll();
            } else {
                DocumentFilter.instance.selectAll();
            }
        };

        updateTree = (figmaData) => {
            Logger.log(`updateTree`);

            _figmaData = figmaData;

            if (!DocumentFilter.instance.initialized) {
                DocumentFilter.instance.init(
                    _figmaData._children.map((child) => child.id),
                    () => {
                        setNavigationBarCount(
                            DocumentFilter.instance.selectedCount,
                            this.state.figmaData ? this.state.figmaData._children.length : 0,
                        );
                        this.setState((prevState) => ({
                            ...prevState,
                            allSelected: DocumentFilter.instance.allSelected,
                        }));
                        DocumentFilter.instance.log();
                    },
                );
            }

            this.setState((prevState) => ({
                ...prevState,
                counter: ++this.state.counter,
                figmaData: {
                    components: {
                        _components: [],
                        _componentSets: [],
                    },
                    _children: [],
                    _images: [],
                    atlases: [],
                    _defaults: [],
                },
            }));

            this.setState((prevState) => ({
                ...prevState,
                counter: ++this.state.counter,
                figmaData: figmaData,
            }));

            setNavigationBarCount(
                DocumentFilter.instance.selectedCount,
                this.state.figmaData ? this.state.figmaData._children.length : 0,
            );
        };

        return (
            <div className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                <img src={require('./images/figma_to_pixijs_logo_sm.png')} />
                <div className="form-control w-full max-w-xs py-2">
                    <input
                        value={this.state.search}
                        onChange={(e) => {
                            DocumentFilter.instance.search(e.target.value);
                            this.setState((prevState) => ({
                                ...prevState,
                                search: e.target.value,
                            }));
                        }}
                        type="text"
                        placeholder="filter"
                        className="input input-sm w-full max-w-xs"
                    />
                </div>
                <ul className="menu menu-xs bg-base-200 rounded-lg max-w-xs w-full">
                    <li>
                        <a>
                            {' '}
                            <img
                                width={24}
                                height={24}
                                className="w-4 h-4"
                                src={require('./icons/pdf.svg')}
                            />{' '}
                            readme.txt{' '}
                        </a>
                    </li>
                    <li>
                        <a>
                            {' '}
                            <img
                                width={24}
                                height={24}
                                className="w-4 h-4"
                                src={require('./icons/pdf.svg')}
                            />{' '}
                            about{' '}
                        </a>
                    </li>
                    <li>
                        <details open={false}>
                            <summary>
                                {' '}
                                <img
                                    width={24}
                                    height={24}
                                    className="w-4 h-4"
                                    src={require('./icons/folder.svg')}
                                />{' '}
                                Components{' '}
                            </summary>
                            <ul>
                                {this.state.figmaData &&
                                    this.state.figmaData.components._components.map((node: any) => (
                                        <TreeComponentNode node={node} key={node.id} />
                                    ))}
                            </ul>
                        </details>
                    </li>
                    <li>
                        <details open={false}>
                            <summary>
                                {' '}
                                <img
                                    width={24}
                                    height={24}
                                    className="w-4 h-4"
                                    src={require('./icons/folder.svg')}
                                />{' '}
                                Variants{' '}
                            </summary>
                            <ul>
                                {this.state.figmaData &&
                                    this.state.figmaData.components._componentSets.map(
                                        (node: any) => (
                                            <TreeComponentSetNode node={node} key={node.id} />
                                        ),
                                    )}
                            </ul>
                        </details>
                    </li>
                    <li>
                        <details open={false}>
                            <summary>
                                {' '}
                                <input
                                    type="checkbox"
                                    checked={this.state.allSelected}
                                    onChange={handleAllCheckedChange}
                                    className="checkbox checkbox-xs"
                                />{' '}
                                <img
                                    width={24}
                                    height={24}
                                    className="w-4 h-4"
                                    src={require('./icons/folder.svg')}
                                />{' '}
                                Views{' '}
                            </summary>
                            <ul>
                                {this.state.figmaData &&
                                    this.state.figmaData._children.map((node: any) => (
                                        <TreeSectorsNode node={node} key={node.id} />
                                    ))}
                            </ul>
                        </details>
                    </li>
                    <li>
                        <details open={false}>
                            <summary>
                                {' '}
                                <img
                                    width={24}
                                    height={24}
                                    className="w-4 h-4"
                                    src={require('./icons/folder.svg')}
                                />{' '}
                                SpriteSheets{' '}
                            </summary>
                            <ul>
                                <TreeSpriteSheetsNode />
                            </ul>
                        </details>
                    </li>
                </ul>
            </div>
        );
    }
}
