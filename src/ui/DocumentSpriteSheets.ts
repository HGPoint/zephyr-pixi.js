import {IBaseDocument} from '../common/IBaseDocument';
import {IBaseInstanceNode, IBaseNode} from '../common/IBaseNode';
import {delay} from '../plugin/Utils/utils';

import {SpriteSheet} from './export/SpriteSheet';
import {setProgressLoadingDialog} from './LoadingDialog';

export class DocumentSpriteSheets {
    public static getResourcesIds = (data: IBaseDocument, node: IBaseNode, ids: string[] = []) => {
        node._children.forEach((baseNode: IBaseNode) => {
            if (baseNode.type == 'INSTANCE') {
                const instanceNode = baseNode as IBaseInstanceNode;

                if (instanceNode.properties.mainComponent) {
                    const componentSets: {id: string; variants: any[]}[] =
                        data.components._componentSets;

                    const setIds: string[] = [];
                    componentSets.forEach((component) => {
                        if (
                            component.variants.filter(
                                (v) => v.id == instanceNode.properties.mainComponent,
                            ).length
                        )
                            setIds.push(component.id);
                    });

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

    public static arrayMatch(arr1: string[], arr2: string[]) {
        const ret = [];
        for (const i in arr1) {
            if (arr2.indexOf(arr1[i]) > -1) {
                ret.push(arr1[i]);
            }
        }
        return ret;
    }

    public static arrayUnique(array: string[]) {
        const a = array.concat();
        for (let i = 0; i < a.length; ++i) {
            for (let j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j]) a.splice(j--, 1);
            }
        }

        return a;
    }

    public static async buildAtlas(
        size: number,
        data: IBaseDocument,
        sprites: string[],
        key: string,
        expand = true,
    ) {
        const components = data.components._components;
        const componentSets = data.components._componentSets;

        const images: {
            src: string;
            name: string;
            id: string;
        }[] = [];

        componentSets.forEach((component) => {
            if (
                sprites.includes(component.id) ||
                component.variants.filter((v: any) => sprites.includes(v.id)).length
            )
                component.variants.forEach((variant: any) => {
                    images.push({
                        src: variant._bytes,
                        id: variant.id,
                        name: variant.id.replace(':', '_'),
                    });
                });
        });
        components
            .filter((c) => c.content)
            .forEach((component: any) => {
                if (component.name.endsWith('.jpg')) {
                    return;
                }
                if (sprites.includes(component.id))
                    images.push({
                        src: component.content._bytes,
                        id: component.id,
                        name: component.id.replace(':', '_'),
                    });
            });

        //console.log("images:", images);

        const atlasImages = images.map((image: any) => {
            return {
                src: image.src,
                name: image.name,
            };
        });

        //console.log("atlasImages:", atlasImages);

        const atlas = new SpriteSheet(size, atlasImages, 1, 2, key, expand);
        await atlas.addImages();
        const result = await atlas.getOutput();

        //console.log("result:", result);

        if (result) {
            return result.bitmaps;
        }
        return [];
    }

    public static async build(data: IBaseDocument, isAllData: boolean) {
        const nodeResourcesIds: Array<{
            key: string;
            id: string;
            name: string;
            data: string[];
        }> = [];

        data._children.forEach((node: IBaseNode) => {
            if (!node.type) {
                return;
            }
            nodeResourcesIds.push({
                key: node.id.split(':').join('_'),
                id: node.id,
                name: node.name,
                data: this.getResourcesIds(data, node),
            });
        });

        //console.log("ids:", nodeResourcesIds);

        // for (let i = 0; i < nodeResourcesIds.length; i++) {
        //     const element = nodeResourcesIds[i];
        //     console.log(element.key + " ids:", element.data);
        // }

        let matchResourcesIds: string[] = [];

        const atlases = [];

        if (isAllData) {
            let matchI = 0;
            for (let i = 0; i < nodeResourcesIds.length; i++) {
                const array1 = nodeResourcesIds[i].data;
                //console.log("array:", array1);
                for (let j = matchI++; j < nodeResourcesIds.length; j++) {
                    if (i == j) continue;
                    const array2 = nodeResourcesIds[j].data;
                    matchResourcesIds = this.arrayUnique(
                        matchResourcesIds.concat(this.arrayMatch(array1, array2)),
                    );
                }
            }

            //console.log("match:", matchResourcesIds);

            for (let i = 0; i < nodeResourcesIds.length; i++) {
                const array1 = nodeResourcesIds[i].data;
                nodeResourcesIds[i].data = array1.filter((el) => !matchResourcesIds.includes(el));
                //console.log("array:", nodeResourcesIds[i].data);
            }

            setProgressLoadingDialog(0, `BUILD SPRITE SHEET - common`);
            await delay(50);

            atlases.push(
                ...(await this.buildAtlas(2048, data, matchResourcesIds, 'common', false)),
            );
        }

        for (let i = 0; i < nodeResourcesIds.length; i++) {
            setProgressLoadingDialog(
                i / nodeResourcesIds.length,
                `BUILD SPRITE SHEET - ${nodeResourcesIds[i].key}`,
            );
            await delay(50);

            const atlas = await this.buildAtlas(
                48,
                data,
                nodeResourcesIds[i].data,
                nodeResourcesIds[i].key,
            );
            if (atlas) {
                //@ts-expect-error: добавляем свойство node_id к объекту atlas
                atlas['node_id'] = nodeResourcesIds[i].id;
            }
            atlases.push(...atlas);
        }

        return atlases;
    }
}
