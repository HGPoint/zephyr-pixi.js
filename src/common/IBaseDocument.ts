import { IBaseNode } from "./IBaseNode";

export interface IComponentLibraries {
    _components: any[];
    _componentSets: any[];
}

export interface IBaseDocument {
    components: IComponentLibraries;
    _children: Array<IBaseNode>;
    _images:Array<any>;
}