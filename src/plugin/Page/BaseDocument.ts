import { ImageRes } from "./ImageRes";
import { BaseContainer } from "../Nodes/BaseNodeContainer";
import { delay } from "../Utils/utils";
import { ComponentLibraries, componentContentLoadQueue } from "../Nodes/ComponentLibraries";
import { IBaseDocument } from "../../common/IBaseDocument";
import { Logger } from "../../common/Logger";

export function loadProgress(value:number, desc:string){
    Logger.log("loadProgress", value, desc);
    figma.ui.postMessage({type: "loadProgress", data: {
        value:value,
        desc: desc
    }  }, { origin: "*" });
}

export class BaseDocument implements IBaseDocument {

    private static _currentPage: BaseDocument;

    atlases: string[] = [];

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

        let componentContentLoad = componentContentLoadQueue.peek();
        let start = componentContentLoadQueue.length;
        
        while(componentContentLoad){
            let progress = (1-componentContentLoadQueue.length/start);
            try{

                loadProgress(progress, `LOADING....COMPONENTS ${componentContentLoad.componentContent.name}`);

                //Logger.log("LOADING....COMPONENTS", componentContentLoad.componentContent.name);

                await componentContentLoad.componentContent.render(componentContentLoad.node);
            } catch (error) {
                Logger.log("LOADING....COMPONENTS - ERROR", error);

                loadProgress(progress, `LOADING....COMPONENTS - ERROR! ${componentContentLoad.componentContent.name}`);
            }
            componentContentLoadQueue.dequeue();
            componentContentLoad = componentContentLoadQueue.peek();
        }
        loadProgress(1, `LOADING....DONE`);
        //Logger.log("LOADING....DONE")
    }
    
    // public clearResources(){

    //     this.components.components.forEach(component => {
    //         component.content && component.content.clear();
    //     }); 

    //     this.components.componentSets.forEach(component => {
    //         component.variants.forEach(variant => variant.clear());
    //     });

    //     this.images.forEach(image => {
    //         image.clear();
    //     });
    // }
}
