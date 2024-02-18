import * as React from 'react';
import { exportData } from "./export/index";
import { Spritesheet } from "./export/Spritesheet";
import { IClientStorageData } from "../common/IClientStorageData";
import { DocumentSpritesheets } from "./DocumentSpritesheets";
import { setNavigationBarCount } from './NavigationBar';
import { completeLoadingDialog, openLoadingDialog } from './LoadingDialog';
import { delay } from '../plugin/Utils/utils';
import { IBaseDocument } from '../common/IBaseDocument';
import { Logger } from '../common/Logger';
import { IBaseNode } from '../common/IBaseNode';
import {clientStorageData} from "../plugin/ClientStorageData";
import {DocumentFilter} from "./DocumentFilter";

//export let _figmaData = require("./figma.json");
let _figmaData:IBaseDocument = {
  components:{
    _components:[],
    _componentSets:[]
  },
  _children:[],
  _images:[],
  atlases:[]
};

let openImgDialog: (node:any) => void;

export class ImageDialog extends React.Component {

    state:{
        openImage: boolean;
        node:any;
    } = {
        openImage: false,
        node: null
    };

    render() {

        openImgDialog = (node:any) => {
            this.setState({ 
                openImage: true,
                node: node
            });
        };

        const handleChange = () => {
        };

        const onClose = () => {
            this.setState({ 
                openImage: false,
                node: null
            });
        };
    
        return (
            <>
                <input type="checkbox" checked={this.state.openImage} onChange={handleChange} id="my_modal_6" className="modal-toggle" />
                <div className="modal">
                    <div className="modal-box">
                        <p className="py-4">{this.state.node?.name}</p>
                        <img src={this.state.node?._bytes}/>
                        <div className="modal-action">
                            <label htmlFor="my_modal_6" onClick={onClose} className="btn">OK</label>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

function TreeComponentNode({ node }:{node:any}) {
  const { name } = node;

  const [showChildren, setShowChildren] = React.useState(false);

  const handleClick = () => {
    Logger.log("node", node);
    openImgDialog(node.content);
  };

  return (
    <li>
      <a onClick={handleClick}> <img width={24} height={24} className="w-4 h-4" src={require("./icons/img.svg")}/> {name} </a>
    </li>
  );
}

function TreeVariantsNode({ node }:{node:any}) {
  const { name } = node;

  const [showChildren, setShowChildren] = React.useState(false);

  const handleClick = () => {
    Logger.log("node", node);
    openImgDialog(node);
  };

  return (
    <li>
      <a onClick={handleClick}> <img width={24} height={24} className="w-4 h-4" src={require("./icons/img.svg")}/> {name} </a>
    </li>
  );
}

function TreeComponentSetNode({ node }:{node:any}) {
  const { name } = node;

  const [showChildren, setShowChildren] = React.useState(false);

  const handleClick = () => {
    setShowChildren(!showChildren);
  };

  return (
    <li>
      <details open={false}>
        <summary onClick={handleClick} > <img width={24} height={24} className="w-4 h-4" src={require("./icons/folder.svg")}/> {name} </summary>
        <ul>
          {showChildren && node.variants.map((node:any) => (
            <TreeVariantsNode node={node} key={node.id} />
          ))}
        </ul>
      </details>
    </li>
  );
}

/////////

let _spritesheets:any[] = [];


let openSpritesheetDialog: (spritesheet:any) => void;

export class SpritesheetDialog extends React.Component {

    state:{
        open: boolean;
        spritesheet:any;
    } = {
        open: false,
        spritesheet: null
    };

    render() {

        openSpritesheetDialog = (spritesheet:any) => {
            this.setState({ 
                open: true,
                spritesheet: spritesheet
            });
        };

        const handleChange = () => {
        };

        const onClose = () => {
            this.setState({ 
                open: false,
                node: null
            });
        };
    
        return (
            <>
                <input type="checkbox" checked={this.state.open} onChange={handleChange} id="my_modal_6" className="modal-toggle" />
                <div className="modal">
                    <div className="modal-box">
                        <p className="py-4">{this.state.spritesheet?.name}</p>
                        <img src={this.state.spritesheet?.image}/>
                        <div className="modal-action">
                            <label htmlFor="my_modal_6" onClick={onClose} className="btn">OK</label>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

function TreeSpritesheetNode({ spritesheet }:{spritesheet:any}) {
    const { name, node_id } = spritesheet;
  
    const [showChildren, setShowChildren] = React.useState(false);

    let node = _figmaData._children.find(n => n.id == node_id);
  
    const handleClick = () => {
      Logger.log("spritesheet", spritesheet);
      openSpritesheetDialog(spritesheet);
    };
  
    return (
      <li>
          <a onClick={handleClick}> <img width={24} height={24} className="w-4 h-4" src={require("./icons/img.svg")}/> {node?.name} ({name}) </a>
      </li>
    );
}

function TreeSpritesheetsNode() {

    const [showChildren, setShowChildren] = React.useState(false);

    const handleClick = async () => {
        if(!showChildren){
            openLoadingDialog();
            await delay(100);
            // parent.postMessage({ pluginMessage: { type: "apply", data: { } } }, "*");
            // try{
            // } catch {

            // }


            _spritesheets = await DocumentSpritesheets.build(_figmaData, {
                atlasMaxWidth: clientStorageData.atlasMaxWidth,
                atlasMaxHeight: clientStorageData.atlasMaxHeight,
                margin: clientStorageData.atlasMargin,
            });
            Logger.log("Spritesheets", _spritesheets);
            completeLoadingDialog();
        }
        setShowChildren(!showChildren);
    };

    return (
        <li>
        <details open={false}>
            <summary onClick={handleClick} > <img width={24} height={24} className="w-4 h-4" src={require("./icons/folder.svg")}/> All </summary>
            <ul>
                {showChildren && _spritesheets.filter(spritesheet => !!spritesheet).map((spritesheet:any) => (
                    <TreeSpritesheetNode spritesheet={spritesheet} key={spritesheet.name} />
                ))}
            </ul>
        </details>
        </li>
    );
}

////

function TreeViewNode({ node, path }:{node:any, path: string }) {
    const { name } = node;
  
    const [showChildren, setShowChildren] = React.useState(false);
  
    const handleClick = async () => {
      Logger.log("node", node);
      openLoadingDialog();
      await delay(100);
      parent.postMessage({ pluginMessage: { type: "apply", data: { target: `${path}.${node.name}`, filteredIds: DocumentFilter.instance.getSelectedIds() } } }, "*");
    };
  
    return (
      <li>
        <a onClick={handleClick}> <img width={24} height={24} className="w-4 h-4" src={require("./icons/go.svg")}/> {name} </a>
      </li>
    );
  }

function TreeSectorsNode({ node }:{node:any}) {
  const { name, id } = node;

  const [showChildren, setShowChildren] = React.useState(false);
  let [checked, setChecked] = React.useState(DocumentFilter.instance.getSelectedById(id));
  checked = DocumentFilter.instance.getSelectedById(id);

  const handleClick = () => {
    setShowChildren(!showChildren);
  };

  const handleChange = () => {
      setChecked(!checked)
      DocumentFilter.instance.setSelectedById(id, !checked);
  }

  return (
    <li>
      <details open={false}>
        <summary onClick={handleClick} > <input onChange={handleChange} checked={checked} type="checkbox" className="checkbox checkbox-xs"/> <img width={24} height={24} className="w-4 h-4" src={require("./icons/folder.svg")}/> {name} </summary>
        <ul>
          {showChildren && node._children.map((childNode:any) => (
            <TreeViewNode node={childNode} path={`${node.name}`} key={childNode.id} />
          ))}
        </ul>
      </details>
    </li>
  );
}

export let updateTree:(figmaData:any) => void;

export class DocumentTree extends React.Component {

  state = {
    counter: 0,
    figmaData: _figmaData,
    allSelected: true,
  };

  render() {

      const handleAllCheckedChange = () => {
          this.setState({
              allSelected: !this.state.allSelected
          });
          if (this.state.allSelected) {
              DocumentFilter.instance.deselectAll();
          } else {
              DocumentFilter.instance.selectAll();
          }
      }

      updateTree = (figmaData) => {
        Logger.log(`updateTree`);

        _figmaData = figmaData;

        if (!DocumentFilter.instance.initialized) {
            DocumentFilter.instance.init(_figmaData._children.map(child => child.id), () => {
                setNavigationBarCount(DocumentFilter.instance.selectedCount, this.state.figmaData._children.length);
                this.setState({
                    allSelected: DocumentFilter.instance.allSelected
                });
                DocumentFilter.instance.log();
            });
        }

      this.setState({
        counter: ++this.state.counter,
        figmaData: figmaData
      });

      setNavigationBarCount(DocumentFilter.instance.selectedCount, this.state.figmaData._children.length);
    };

    return (
      <ul className="menu menu-xs bg-base-200 rounded-lg max-w-xs w-full">
        <li><a> <img width={24} height={24} className="w-4 h-4" src={require("./icons/pdf.svg")}/> readme.txt </a></li>
        <li><a> <img width={24} height={24} className="w-4 h-4" src={require("./icons/pdf.svg")}/> about </a></li>
        <li>
          <details open={false}>
            <summary> <img width={24} height={24} className="w-4 h-4" src={require("./icons/folder.svg")}/> Components </summary>
            <ul>
              {this.state.figmaData.components._components.map((node:any) => (
                <TreeComponentNode node={node} key={node.id} />
              ))}
            </ul>
          </details>
        </li>
        <li>
          <details open={false}>
            <summary> <img width={24} height={24} className="w-4 h-4" src={require("./icons/folder.svg")}/> Variants </summary>
            <ul>
              {this.state.figmaData.components._componentSets.map((node:any) => (
                <TreeComponentSetNode node={node} key={node.id} />
              ))}
            </ul>
          </details>
        </li>
        <li>
          <details open={false}>
            <summary> <input type="checkbox" checked={this.state.allSelected} onChange={handleAllCheckedChange} className="checkbox checkbox-xs"/> <img width={24} height={24} className="w-4 h-4" src={require("./icons/folder.svg")}/> Views </summary>
            <ul>
              {this.state.figmaData._children.map((node:any) => (
                <TreeSectorsNode node={node} key={node.id} />
              ))}
            </ul>
          </details>
        </li>
        <li>
          <details open={false}>
            <summary> <img width={24} height={24} className="w-4 h-4" src={require("./icons/folder.svg")}/> Spritesheets </summary>
            <ul>
                <TreeSpritesheetsNode/>
            </ul>
          </details>
        </li>
      </ul>
    );
  }
}