import {
    IBaseFrameNodeProp,
    IInstanceNodeProp,
    IRectangleNodeProp,
    ITextNodeProp,
    IVectorNodeProp,
} from '../plugin/Nodes/BaseNodeContainer';

export interface IBaseNode {
    type:
        | 'FRAME'
        | 'GROUP'
        | 'SLICE'
        | 'RECTANGLE'
        | 'LINE'
        | 'ELLIPSE'
        | 'POLYGON'
        | 'STAR'
        | 'VECTOR'
        | 'TEXT'
        | 'COMPONENT_SET'
        | 'COMPONENT'
        | 'INSTANCE'
        | 'BOOLEAN_OPERATION'
        | 'STICKY'
        | 'STAMP'
        | 'HIGHLIGHT'
        | 'WASHI_TAPE'
        | 'SHAPE_WITH_TEXT'
        | 'CODE_BLOCK'
        | 'CONNECTOR'
        | 'WIDGET'
        | 'EMBED'
        | 'LINK_UNFURL'
        | 'MEDIA'
        | 'SECTION'
        | '';
    id: string;
    name: string;
    visible: boolean;
    height: number;
    width: number;
    x: number;
    y: number;

    properties:
        | IVectorNodeProp
        | IRectangleNodeProp
        | ITextNodeProp
        | IBaseFrameNodeProp
        | IInstanceNodeProp
        | null;

    _children: Array<IBaseNode>;
}

export interface IBaseInstanceNode extends IBaseNode {
    type: 'INSTANCE';
    properties: IInstanceNodeProp;
}

export interface IBaseRectangleNode extends IBaseNode {
    type: 'RECTANGLE';
    properties: IRectangleNodeProp;
}

export interface IBaseVectorNode extends IBaseNode {
    type: 'VECTOR';
    properties: IVectorNodeProp;
}
