import { ImageRes } from "./ImageRes";
import { BaseContainer } from "../Nodes/BaseNodeContainer";
import { delay } from "../Utils/utils";
import { ComponentLibraries } from "../Nodes/ComponentLibraries";
import { IBaseDocument } from "../../common/IBaseDocument";
import { Logger } from "../../common/Logger";

export class BaseDocument implements IBaseDocument {

    private static _currentPage: BaseDocument;

    public static set current(value: BaseDocument){
        this._currentPage = value;
    }

    public static get current(){
        return this._currentPage;
    }
    
    components: ComponentLibraries;

    public name: string = "";
    public id: string = "";

    constructor(node: DocumentNode) {

        this.name = node.name;
        this.id = node.id;
        this.components = ComponentLibraries.currentInstance;
    }

    public static addImage(hash: string) {
        BaseDocument._currentPage._addImage(hash);
    }

    public _images: Array<ImageRes> = [];
    public get images() {
        return this._images;
    }

    public _children: Array<BaseContainer> = [];
    public get children() {
        return this._children;
    }

    addChild(...children: BaseContainer[]) {
        this._children.push(...children);
    }

    private _addImage(hash: string) {
        if (!hash) return;
        const img = this._images.find(img => { return img.hash == hash; });
        if (img) return;
        this._images.push(new ImageRes(hash));
    }

    public async load(){
        Logger.log("LOADING....IMAGES");
        do {
            await delay(50);
        } while (this._images.find(img => !img.isLoaded));

        Logger.log("LOADING....COMPONENTS");
        do {
            await delay(50);
        } while (this.components.components.find(component => !component.isLoaded));

        Logger.log("LOADING....COMPONENT SETS");
        do {
            await delay(50);
        } while (this.components.componentSets.find(component => !component.isLoaded));
        Logger.log("LOADING....DONE")
    }
    
    // public clearResources(){

    //     this.components.components.forEach(component => {
    //         component.content && component.content.clear();
    //     }); 

    //     this.components.componentSets.forEach(component => {
    //         component.variatns.forEach(variatn => variatn.clear());
    //     });

    //     this.images.forEach(image => {
    //         image.clear();
    //     });
    // }
}
