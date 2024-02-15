// https://github.com/gopherwood/node-bin-packing
// https://github.com/jsmarkus/node-bin-packing


export type PackerNode = {
    id?: string;
    name?: string,
    src?: string,
    used?: boolean,
    x?: number,
    y?: number,
    width: number,
    height: number,
    down?: PackerNode,
    right?: PackerNode,
    fit?: PackerNode | undefined | null,
}

export class GrowingPacker
{
    private max: PackerNode;
    private node: PackerNode | undefined;
    // @ts-ignore
    public root: PackerNode;

    // @ts-ignore
    public nofit: PackerNode[];

    // @ts-ignore
    private overmax: PackerNode[];

    constructor(width = Infinity, height = Infinity) {
        this.max = {
            x: 0, y: 0, width, height,
        };
        this.node = undefined;
    }

    private overMaxSize(width: number, height: number) {
        // @ts-ignore
        return width > this.max.width || height > this.max.height;
    }

    public fit(blocks: PackerNode[]) {
        const len = blocks.length;
        const width = Math.min(len > 0 ? blocks[0].width : 0, this.max.width);
        const height = Math.min(len > 0 ? blocks[0].height : 0, this.max.height);

        this.root = {
            x: 0, y: 0, width, height,
        };
        this.nofit = [];
        this.overmax = [];

        for (let n = 0; n < len; n += 1) {
            const block = blocks[n];
            this.node = this.findNode(this.root, block.width, block.height);
            if (this.node) block.fit = this.splitNode(block.width, block.height);
            else block.fit = this.growNode(block.width, block.height);

            if (!block.fit) {
                if (this.overMaxSize(block.width, block.height)) this.overmax.push(block);
                else this.nofit.push(block);
            }
        }
    }

    private findNode(root: any, width: number, height: number): PackerNode | undefined {
        if (root.used) {
            return this.findNode(root.right, width, height) || this.findNode(root.down, width, height);
        }
        if ((width <= root.width) && (height <= root.height)) return root;
        return undefined;
    }

    private splitNode(width: number, height: number): PackerNode | undefined {
        const { node } = this;
        if (node) {
            node.used = true;
            node.down = {
                // @ts-ignore
                x: node.x, y: node.y + height, width: node.width, height: node.height - height,
            };
            node.right = {
                // @ts-ignore
                x: node.x + width, y: node.y, width: node.width - width, height,
            };
        }
        return node;
    }

    private growNode(width: number, height: number) {
        // dont allow it to grow beyond the max
        const canGrowRight = (height <= this.root.height)
            && (this.root.width + width <= this.max.width);
        const canGrowDown = (width <= this.root.width)
            && (this.root.height + height <= this.max.height);
        // attempt to keep square-ish by growing right when height is much greater than width
        const shouldGrowRight = canGrowRight && (this.root.height >= (this.root.width + width));
        // attempt to keep square-ish by growing down  when width  is much greater than height
        const shouldGrowDown = canGrowDown && (this.root.width >= (this.root.height + height));

        if (shouldGrowRight) return this.growRight(width, height);
        if (shouldGrowDown) return this.growDown(width, height);
        if (canGrowRight) return this.growRight(width, height);
        if (canGrowDown) return this.growDown(width, height);
        return null; // need to ensure sensible root starting size to avoid this happening
    }

    private growRight(width: number, height: number) {
        this.root = {
            used: true,
            x: 0,
            y: 0,
            width: this.root.width + width,
            height: this.root.height,
            down: this.root,
            right: {
                x: this.root.width, y: 0, width, height: this.root.height,
            },
        };
        this.node = this.findNode(this.root, width, height);
        if (this.node) return this.splitNode(width, height);
        return null;
    }

    private growDown(width: number, height: number) {
        this.root = {
            used: true,
            x: 0,
            y: 0,
            width: this.root.width,
            height: this.root.height + height,
            down: {
                x: 0, y: this.root.height, width: this.root.width, height,
            },
            right: this.root,
        };
        this.node = this.findNode(this.root, width, height);
        if (this.node) return this.splitNode(width, height);
        return null;
    }
}