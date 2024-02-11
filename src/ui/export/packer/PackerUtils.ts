import {PackerNode} from "./GrowingPacker";

const sorters = {
    width(a: PackerNode, b: PackerNode) { return b.width - a.width; },
    height(a: PackerNode, b: PackerNode) { return b.height - a.height; },
    max(a: PackerNode, b: PackerNode) { return Math.max(b.width, b.height) - Math.max(a.width, a.height); },
    min(a: PackerNode, b: PackerNode) { return Math.min(b.width, b.height) - Math.min(a.width, a.height); },
};

const sortByMultipleCriteria = (a: PackerNode, b: PackerNode, criteria: string[]) => {
    for (let i = 0; i < criteria.length; i += 1) {
        // @ts-ignore
        const diff = sorters[criteria[i]](a, b);
        if (diff !== 0) return diff;
    }
    return 0;
};

function sortImages(images: PackerNode[]) {
    images.sort((a, b) => sortByMultipleCriteria(a, b, ['max', 'min', 'height', 'width']));
};
