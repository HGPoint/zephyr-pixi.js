import {IBaseDocument} from "../common/IBaseDocument";
import {IBaseInstanceNode, IBaseNode} from "../common/IBaseNode";
import {Spritesheet} from "./export/Spritesheet";
import {ExportOptions} from "../plugin/export";
import {GrowingPacker, PackerNode} from "./export/packer/GrowingPacker";
import {Bitmap} from "./Bitmap";
import {PackerAtlas} from "./export/packer/PackerAtlas";
import {AtlasImage} from "./export/packer/PackerImage";


export class DocumentSpritesheets
{

    public static getResourcesIds = (data: IBaseDocument, node: IBaseNode, ids: string[] = []) =>
    {
        node._children.forEach((baseNode: IBaseNode) =>
        {

            if (baseNode.type == "INSTANCE") {
                const instanceNode = baseNode as IBaseInstanceNode;

                if (instanceNode.properties.mainComponent) {
                    const componentSets: { id: string; variants: any[] }[] = data.components._componentSets;

                    const setIds: string[] = [];
                    componentSets.forEach((component) =>
                    {
                        component.variants.filter(v => v.id == instanceNode.properties.mainComponent).length &&
                        setIds.push(component.id);
                    })

                    if (setIds.length > 0) {
                        ids.push(...setIds);
                    } else {
                        ids.push(instanceNode.properties.mainComponent);
                    }
                } else {
                    ids.push(instanceNode.id);
                }
                return;
            }

            this.getResourcesIds(data, baseNode, ids);

        });
        return ids;
    };

    public static arrayMatch(arr1: string[], arr2: string[])
    {
        var ret = [];
        for (var i in arr1) {
            if (arr2.indexOf(arr1[i]) > -1) {
                ret.push(arr1[i]);
            }
        }
        return ret;
    }

    public static arrayUnique(array: string[])
    {
        var a = array.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }

        return a;
    }

    public static prepareImages(data: IBaseDocument, sprites: string[]): Bitmap[]
    {
        const images: Bitmap[] = [];
        const components = data.components._components;
        const componentSets = data.components._componentSets;

        componentSets.forEach((component) =>
        {
            (sprites.includes(component.id) || component.variants.filter((v: any) => sprites.includes(v.id)).length) &&
            component.variants.forEach((variant: any) =>
            {
                images.push({
                    src: variant._bytes,
                    id: variant.id,
                    name: variant.id.replace(":", "_"),
                    width: variant._size.width,
                    height: variant._size.height,
                    x: NaN,
                    y: NaN,
                });
            })
        })
        components.filter(c => c.content).forEach((component: any) =>
        {
            sprites.includes(component.id) &&
            images.push({
                src: component.content._bytes,
                id: component.id,
                name: component.id.replace(":", "_"),
                width: component.content._size.width,
                height: component.content._size.height,
                x: NaN,
                y: NaN,
            });
        });

        return images;
    }

    public static async buildAtlas(width: number, height: number, images: Bitmap[], key: string, margin: number = 1)
    {
        const atlas = new Spritesheet(width, height, images, 1, margin, key);
        await atlas.addImages();
        const result = await atlas.getOutput();

        //console.log("result:", result);

        if (result && result.bitmaps[0]) {
            return result.bitmaps[0]
        }
        return null;
    }

    public static async build(data: IBaseDocument, options: ExportOptions)
    {

        const nodeResourcesIds: Array<{
            key: string;
            id: string;
            name: string;
            data: string[];
        }> = [];

        data._children.forEach((node: IBaseNode) =>
        {
            nodeResourcesIds.push({
                key: node.id.split(":").join("_"),
                id: node.id,
                name: node.name,
                data: this.getResourcesIds(data, node)
            });
        });

        //console.log("ids:", nodeResourcesIds);

        // for (let i = 0; i < nodeResourcesIds.length; i++) {
        //     const element = nodeResourcesIds[i];
        //     console.log(element.key + " ids:", element.data);
        // }

        let matchResourcesIds: string[] = [];

        let match_i = 0;
        for (let i = 0; i < nodeResourcesIds.length; i++) {
            const array1 = nodeResourcesIds[i].data;
            //console.log("array:", array1);
            for (let j = match_i++; j < nodeResourcesIds.length; j++) {
                if (i == j) continue;
                const array2 = nodeResourcesIds[j].data;
                matchResourcesIds = this.arrayUnique(matchResourcesIds.concat(this.arrayMatch(array1, array2)));
            }
        }

        //console.log("match:", matchResourcesIds);

        for (let i = 0; i < nodeResourcesIds.length; i++) {
            const array1 = nodeResourcesIds[i].data;
            nodeResourcesIds[i].data = array1.filter((el) => !matchResourcesIds.includes(el));
            //console.log("array:", nodeResourcesIds[i].data);
        }

        const atlases = [];

        const images = this.prepareImages(data, matchResourcesIds);

        const commonCalculatedAtlases = this.getGrowingPackerAtlases(images, options);
        console.log(`commonCalculatedAtlases`, commonCalculatedAtlases);
        for (let index = 0; index < commonCalculatedAtlases.length; index ++) {
            const currentAtlas = commonCalculatedAtlases[index];
            const images: Bitmap[] = currentAtlas.files.map(item => {
                return {
                    name: item.name,
                    id: item.id,
                    width: item.width,
                    height: item.height,
                    src: item.src,
                    x: item.x,
                    y: item.y,
                }
            });
            atlases.push(await this.buildAtlas(currentAtlas.width, currentAtlas.height, images, `common_${index}`, options.margin));
        }

        // old version
        //atlases.push(await this.buildAtlas(images, "common"));

        for (let i = 0; i < nodeResourcesIds.length; i++) {
            const images = this.prepareImages(data, nodeResourcesIds[i].data);
            const atlas = await this.buildAtlas(48, 48, images, nodeResourcesIds[i].key);
            if (atlas) {
                //@ts-ignore
                atlas["node_id"] = nodeResourcesIds[i].id;
            }
            atlases.push(atlas);
        }

        return atlases;
    }

    private static getGrowingPackerAtlases(images: Bitmap[], options: ExportOptions): PackerAtlas[]
    {
        const result: PackerAtlas[] = [];

        let noFitImages: PackerNode[] = images.map(item =>
        {
            return {
                id: item.id,
                src: item.src,
                name: item.name,
                width: item.width + 2 * options.margin,
                height: item.height + 2 * options.margin,
                x: 0,
                y: 0
            };
        });

        while (noFitImages.length > 0) {
            const packer = new GrowingPacker(options.atlasMaxWidth, options.atlasMaxHeight);
            packer.fit(noFitImages);
            const atlas = new PackerAtlas(packer);
            noFitImages.forEach((item) =>
            {
                if (item.fit) {
                    const image = new AtlasImage(item, options.margin);
                    atlas.addImage(image);
                }
            });
            result.push(atlas);
            noFitImages = packer.nofit;
        }
        return result;
    }
}