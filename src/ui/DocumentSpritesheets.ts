import { IBaseDocument } from "../common/IBaseDocument";
import { IBaseInstanceNode, IBaseNode } from "../common/IBaseNode";
import { Spritesheet } from "./export/Spritesheet";

export class DocumentSpritesheets {
    
    public static getResourcesIds = (data:IBaseDocument, node:IBaseNode, ids:string[] = []) => {
        node._children.forEach((baseNode:IBaseNode) => {

          if(baseNode.type == "INSTANCE"){
            const instanceNode = baseNode as IBaseInstanceNode;
            
            if(instanceNode.properties.mainComponent) {
              const componentSets: {id:string;variatns:any[]}[] =  data.components._componentSets;
              
              componentSets.forEach((component) => {
                component.variatns.filter(v => v.id == instanceNode.properties.mainComponent).length &&
                ids.push(component.id);
              })
              //ids.push(node.id);
              ids.push(instanceNode.properties.mainComponent);
            }else{
              ids.push(instanceNode.id);
            }
            return;
          }

          this.getResourcesIds(data, baseNode, ids);

        });
        return ids;
    };

    public static arrayMatch (arr1:string[], arr2:string[]) {
        var ret = [];
        for(var i in arr1) {   
            if(arr2.indexOf(arr1[i]) > -1){
                ret.push(arr1[i]);
            }
        }
        return ret;
    }

    public static arrayUnique (array:string[]) {
        var a = array.concat();
        for(var i=0; i<a.length; ++i) {
            for(var j=i+1; j<a.length; ++j) {
                if(a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
    
        return a;
    }

    public static async buildAtlas (data:IBaseDocument, sprites:string[], key:string) {
        const components = data.components._components;
        const componentSets =  data.components._componentSets;

        let images:{
            src: string,
            name: string,
            id: string
        }[] = [];

        componentSets.forEach((component) => {
            (sprites.includes(component.id) || component.variatns.filter((v:any) => sprites.includes(v.id)).length) &&
            component.variatns.forEach((variatn:any) => {
                images.push({
                src: variatn._bytes,
                id: variatn.id,
                name: variatn.id.replace(":","_")
                });
            })
        })
        components.filter(c => c.content).forEach((component:any) => {
            sprites.includes(component.id) &&
            images.push({
                src: component.content._bytes,
                id: component.id,
                name: component.id.replace(":","_")
            });
        });

        //console.log("images:", images);

        const atlasimages = images.map((image:any) => {
            return {
                src: image.src,
                name: image.name
            }
        });

        //console.log("atlasimages:", atlasimages);

        const atlas = new Spritesheet(48, atlasimages, 1, 1, key);
        await atlas.addImages();
        const result = await atlas.getOutput();
        
        //console.log("result:", result);

        if(result && result.bitmaps[0]){
            return result.bitmaps[0]
        }
        return null;
    }

    public static async build(data:IBaseDocument){

        const nodeResourcesIds:Array<{
            key:string;
            id:string;
            name:string;
            data:string[];
        }> = [];

        data._children.forEach((node:IBaseNode) => {
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

        let matchResourcesIds:string[] = [];

        let match_i = 0;
        for (let i = 0; i < nodeResourcesIds.length; i++) {
            const array1 = nodeResourcesIds[i].data;
            //console.log("array:", array1);
            for (let j = match_i++; j < nodeResourcesIds.length; j++) {
                if(i == j) continue;
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
          
        atlases.push(await this.buildAtlas(data, matchResourcesIds, "common"));

        for (let i = 0; i < nodeResourcesIds.length; i++) {
            const atlas = await this.buildAtlas(data, nodeResourcesIds[i].data, nodeResourcesIds[i].key);
            if(atlas){
                //@ts-ignore
                atlas["node_id"] = nodeResourcesIds[i].id;
            }
            atlases.push(atlas);
        }

        return atlases;
    }
}