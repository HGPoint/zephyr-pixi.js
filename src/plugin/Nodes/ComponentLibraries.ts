import { Logger } from "../../common/Logger";

class Queue<T> {
  
    public constructor(
        private elements: Record<number, T> = {},
        private head: number = 0,
        private tail: number = 0
    ) { }

    public enqueue(element: T): void {
        this.elements[this.tail] = element;
        this.tail++;
    }

    public dequeue(): T {
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;

        return item;
    }

    public peek(): T {
        return this.elements[this.head];
    }

    public get length(): number {
        return this.tail - this.head;
    }

    public get isEmpty(): boolean {
        return this.length === 0;
    }

}

export const componentContentLoadQueue = new Queue<{
    node: SceneNode;
    componentContent: FigmaComponentContent;
}>();

export class FigmaComponentContent {
    public name: string = "";
    public type: string = "";
    public id: string = "";
    private _bytes: string = "";
    private _size: {
        width: number;
        height: number;
    } = {
            width: 0,
            height: 0
        };

    private _isLoaded = false;
    public get isLoaded(){
        return this._isLoaded;
    }

    constructor(node: SceneNode) {

        this.id = node.id;
        this.type = node.type;
        this.name = node.name;

        //this.render(node);

        componentContentLoadQueue.enqueue({
            node: node,
            componentContent: this
        });
    }

    private _hideText(node: SceneNode, hiddenTextNodes: string[] = []){
        if (node.type == 'INSTANCE' || node.type == 'COMPONENT' || node.type == 'FRAME' || node.type == 'GROUP'){
            for(let child of node.children){
                if(!child.visible){
                    continue;
                }
    
                switch(child.type){
                    case 'TEXT':{
                        child.visible = false;
                        hiddenTextNodes.push(child.id);
                        break;
                    }
                    default: 
                        this._hideText(child, hiddenTextNodes);
                }
            }
        }
        return hiddenTextNodes;
    }

    private _showText(node: SceneNode, hiddenTextNodes: string[]){
        if (node.type == 'INSTANCE' || node.type == 'COMPONENT' || node.type == 'FRAME' || node.type == 'GROUP'){
            for(let child of node.children){
                switch(child.type){
                    case 'TEXT':{
                        if(hiddenTextNodes.indexOf(child.id) >= 0){
                            child.visible = true;

                        }
                        break;
                    }
                    default: 
                        this._showText(child, hiddenTextNodes);
                }
            }
        }
    }

    async render(node: SceneNode){
        const hiddenTextNodes = this._hideText(node);
        
        const bytes = await node.exportAsync({
            format: 'PNG',
            constraint: { type: 'SCALE', value: 1 },
        })
        const image = figma.createImage(bytes);
        this._bytes = "data:image/png;base64," + figma.base64Encode(bytes);
        this._size = await image.getSizeAsync();
        this._isLoaded = true;
        this._showText(node, hiddenTextNodes);
    }

    public clear(){
        this._bytes = "";
    }
}

export class FigmaComponentNode {
    public type: string = "";
    public id: string = "";
    public name: string = "";

    public content:FigmaComponentContent|null = null;
    public componentSetId: string = "";

    public get isLoaded(){
        return this.content == null || this.content.isLoaded;
    }

    constructor(node: InstanceNode) {
        if(!node.mainComponent){
            return;
        }
        
        this.id = node.mainComponent.id;
        this.type = node.mainComponent.type;
        this.name = node.name;

        if(node.mainComponent.parent?.type == "COMPONENT_SET"){
            this.content = null;
        }else{
            this.content = new FigmaComponentContent(node.mainComponent);
        }
        
    }
}

export class FigmaComponentSetNode {
    public type: string = "";
    public id: string = "";
    public name: string = "";
    
    //readonly defaultVariant: string = "";
    readonly variantGroupProperties: {
        [property: string]: {
            values: string[]
        }
    } = {};

    public variatns: FigmaComponentContent[] = [];

    public get isLoaded(){
        return !this.variatns.find(v => !v.isLoaded);
    }

    constructor(componentSetNode: ComponentSetNode) {

        this.id = componentSetNode.id;
        this.type = componentSetNode.type;
        this.name = componentSetNode.name;

        // const variantGroupProperties = componentSetNode.variantGroupProperties;
        // console.log("variantGroupProperties", variantGroupProperties);
        // for (const key in variantGroupProperties){
        //     const variantGroupProperty = variantGroupProperties[key];
        //     this.variantGroupProperties[key] = {
        //         values: variantGroupProperty.values?.map(v => v)
        //     }
        // }

        for (let i = 0; i < componentSetNode.children.length; i++) {
            const node = componentSetNode.children[i];
            
            this.variatns.push(new FigmaComponentContent(node))
        }

        //this.defaultVariant = this.variatns[0]?.id;
    }

}

export class ComponentLibraries {
    
    private static _currentInstance: ComponentLibraries;

    public static get currentInstance(){
        if(!ComponentLibraries._currentInstance){
            new ComponentLibraries();
        }
        return this._currentInstance;
    }

    public _components: Array<FigmaComponentNode> = [];
    public get components() {
        return this._components;
    }

    public _componentSets: Array<FigmaComponentSetNode> = [];
    public get componentSets() {
        return this._componentSets;
    }

    constructor() {
        ComponentLibraries._currentInstance = this;
    }

    public static addComponent(node: InstanceNode, overrides: {
        id: string
        overriddenFields: {
            field: string,
            value: any
        }[]
    }[]){
        if(!node.mainComponent){
            return;
        }
        const component = this._currentInstance.components.find(component => { 
            return component.id == node.mainComponent?.id; 
        });
        if (component) return;

        const componentNode = new FigmaComponentNode(node)
        this._currentInstance.components.push(componentNode);

        if(node.mainComponent.parent?.type == "COMPONENT_SET"){
            let componentSetNode = this._currentInstance.componentSets.find(componentSet => { 
                return componentSet.id == node.mainComponent?.parent?.id; 
            });
            if(!componentSetNode){
                componentSetNode = new FigmaComponentSetNode(node.mainComponent.parent);
                this._currentInstance.componentSets.push(componentSetNode);
            }
            componentNode.componentSetId = componentSetNode.id;
        }
    }
}