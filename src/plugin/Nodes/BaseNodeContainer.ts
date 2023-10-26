import { ComponentLibraries } from "./ComponentLibraries"
import { IBaseNode } from "../../common/IBaseNode"

export interface IDefaultNode {
    absoluteTransform: Transform
    relativeTransform: Transform
    x: number
    y: number
    width: number
    height: number
    absoluteBoundingBox: Rect | null
}

export interface IBaseFrameNodeProp extends IDefaultNode {
    opacity: number;
    rotation: number;
    layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL'
    primaryAxisSizingMode: 'FIXED' | 'AUTO'
    counterAxisSizingMode: 'FIXED' | 'AUTO'
    primaryAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN'
    counterAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE'
    paddingLeft: number
    paddingRight: number
    paddingTop: number
    paddingBottom: number
    itemSpacing: number
    itemReverseZIndex: boolean
    strokesIncludedInLayout: boolean
    //horizontalPadding: number //is no longer supported
    //verticalPadding: number //is no longer supported
    //layoutGrids: ReadonlyArray<LayoutGrid>
    gridStyleId: string
    clipsContent: boolean
}

export interface IInstanceNodeProp extends IDefaultNode {
    mainComponent: string | null;
    overrides: {
        id: string
        overriddenFields: {
            field: string,
            value: any
        }[]
    }[];
}


export interface IRectangleNodeProp extends IDefaultNode {

}

export interface ITextNodeProp extends IDefaultNode {
    textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
    textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM';
    textAutoResize: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE';
    autoRename: boolean;
    textStyleId: string;// | PluginAPI['mixed']
    paragraphIndent: number;
    paragraphSpacing: number;
    fontSize: number;
    fontName: {
        family: string
        style: string
    };
    fontWeight: number;
    textCase: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
    textDecoration: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
    letterSpacing: {
        value: number
        unit: 'PIXELS' | 'PERCENT'
    };
    lineHeight: {
        value: number
        unit: 'AUTO'| 'PIXELS' | 'PERCENT'
    };
    hyperlink: {
        type: 'URL' | 'NODE'
        value: string
    } | null;
    characters: string;
    strokeWeight: number;
}

export class BaseContainer implements IBaseNode {
    public type: 'FRAME' | 'GROUP' | 'SLICE' | 'RECTANGLE' | 'LINE' | 'ELLIPSE' | 'POLYGON' |'STAR'
    |'VECTOR'|'TEXT'|'COMPONENT_SET'|'COMPONENT'|'INSTANCE'|'BOOLEAN_OPERATION'|'STICKY' |'STAMP'|'HIGHLIGHT'|'WASHI_TAPE'|'SHAPE_WITH_TEXT'
    |'CODE_BLOCK'|'CONNECTOR'|'WIDGET'|'EMBED'|'LINK_UNFURL'|'MEDIA'|'SECTION'|"" = "";
    public id: string = "";
    public name: string = "";

    public isMeta = false;
    public visible = false;
    public height = 0;
    public width = 0;
    public x = 0;
    public y = 0;

    public properties: IRectangleNodeProp | ITextNodeProp | IBaseFrameNodeProp | IInstanceNodeProp | null = null;

    constructor(node: SceneNode) {
        this.type = node.type;
        this.id = node.id;
        this.name = node.name;
        this.visible = node.visible;
        this.height = node.height;
        this.width = node.width;
        this.x = node.x;
        this.y = node.y;

        if(node.type == "FRAME"){
            this.properties = {
                opacity: node.opacity,
                rotation: node.rotation,
                layoutMode: node.layoutMode,
                primaryAxisSizingMode: node.primaryAxisSizingMode,
                counterAxisSizingMode: node.counterAxisSizingMode, 
                primaryAxisAlignItems: node.primaryAxisAlignItems,
                counterAxisAlignItems: node.counterAxisAlignItems,
                paddingLeft: node.paddingLeft,
                paddingRight: node.paddingRight,
                paddingTop: node.paddingTop,
                paddingBottom: node.paddingBottom,
                itemSpacing: node.itemSpacing,
                itemReverseZIndex: node.itemReverseZIndex,
                strokesIncludedInLayout: node.strokesIncludedInLayout,
                gridStyleId: node.gridStyleId,
                clipsContent: node.clipsContent,
            } as IBaseFrameNodeProp;
        } else if(node.type == "INSTANCE"){
            this.properties =  {
                mainComponent: node.mainComponent?.id,
                overrides: node.overrides.map(ov => {
                    return {
                        id: ov.id,
                        overriddenFields: ov.overriddenFields.map(of => {
                            return {
                                field: of,
                                //@ts-ignore
                                value: node[`${of}`] as any
                            };
                        })
                    }
                })
            } as IInstanceNodeProp;

            node.mainComponent && ComponentLibraries.addComponent(node, (this.properties as IInstanceNodeProp).overrides);

        } else if(node.type == "TEXT"){
            this.properties = {
                textAlignHorizontal: node.textAlignHorizontal,
                textAlignVertical: node.textAlignVertical,
                textAutoResize: node.textAutoResize,
                autoRename: node.autoRename,
                textStyleId: node.textStyleId,
                paragraphIndent: node.paragraphIndent,
                paragraphSpacing: node.paragraphSpacing,
                fontSize: node.fontSize,
                fontName: {
                    //@ts-ignore
                    family: node.fontName?.family,
                    //@ts-ignore
                    style: node.fontName?.style
                },
                fontWeight: node.fontWeight,
                textCase: node.textCase,
                textDecoration: node.textDecoration,
                letterSpacing: {
                    //@ts-ignore
                    value: node.letterSpacing?.value,
                    //@ts-ignore
                    unit: node.letterSpacing?.unit
                },
                lineHeight: {
                    //@ts-ignore
                    value: node.lineHeight?.value,
                    //@ts-ignore
                    unit: node.lineHeight?.unit
                },
                hyperlink: {
                    //@ts-ignore
                    type: node.hyperlink?.type,
                    //@ts-ignore
                    value: node.hyperlink?.value
                },
                characters: node.characters,
                strokeWeight: node.strokeWeight
            } as ITextNodeProp
        } else if(node.type == "RECTANGLE"){
            this.properties = {

            } as IRectangleNodeProp;
        }

        if(this.properties){
            this.properties.height = node.height;
            this.properties.width = node.width;
            this.properties.x = node.x;
            this.properties.y = node.y;
            this.properties.absoluteTransform = [
                [node.absoluteTransform[0][0],node.absoluteTransform[0][1], node.absoluteTransform[0][2]],
                [node.absoluteTransform[1][0],node.absoluteTransform[1][1], node.absoluteTransform[1][2]]
            ];
            this.properties.relativeTransform = [
                [node.relativeTransform[0][0],node.relativeTransform[0][1], node.relativeTransform[0][2]],
                [node.relativeTransform[1][0],node.relativeTransform[1][1], node.relativeTransform[1][2]]
            ];
        }
    }

    public _children: Array<BaseContainer> = [];
    public get children() {
        return this._children;
    }

    addChild(...children: BaseContainer[]) {
        this._children.push(...children);
    }
}
