import {Logger} from '../common/Logger';

export type DocumentFilterItem = {
    id: string;
    selected: boolean;
};

export class DocumentFilter {
    private static _instance: DocumentFilter;

    public static get instance(): DocumentFilter {
        if (!this._instance) this._instance = new DocumentFilter();

        return this._instance;
    }

    private _initialized: boolean = false;

    private _items: {[id: string]: DocumentFilterItem} = {};

    private _selectedCount: number = 0;
    private _changeCallback: (() => void) | undefined;

    public get selectedItems() {
        console.log('DocumentFilter.selectedItems', this._items);
        const selectedItems = Object.values(this._items)
            .filter((item) => item.selected)
            .map((item) => item.id);
        return selectedItems;
    }

    public init(ids: string[], changeCallback: () => void): void {
        this._changeCallback = changeCallback;
        this._items = {};
        ids.forEach((id) => {
            this._items[id] = {
                id: id,
                selected: false,
            };
        });
        this.updateSelectedCount();
        this._initialized = true;
        Logger.log(`DocumentFilter.initItems`, this._items);
    }

    public get initialized(): boolean {
        return this._initialized;
    }

    public get allSelected(): boolean {
        return this._selectedCount >= Object.values(this._items).length;
    }

    public get selectedCount(): number {
        return this._selectedCount;
    }

    public selectAll(): void {
        Object.values(this._items).forEach((item) => (item.selected = true));
        this.updateSelectedCount();
        this.callChangeCallback();
    }

    public deselectAll(): void {
        Object.values(this._items).forEach((item) => (item.selected = false));
        this.updateSelectedCount();
        this.callChangeCallback();
    }

    public getSelectedById(id: string): boolean {
        return this._items[id].selected ?? false;
    }

    private _search = '';
    public search(name: string) {
        this._search = name;
    }

    public getVisibleByName(name: string): boolean {
        if (!this._search) {
            return true;
        }
        return name.indexOf(this._search) >= 0;
    }

    public setSelectedById(id: string, selected: boolean): void {
        if (this._items[id] && this._items[id].selected !== selected) {
            this._items[id].selected = selected;
            this.updateSelectedCount();
            this.callChangeCallback();
        }
    }

    public getSelectedIds(): string[] {
        return Object.values(this._items)
            .filter((item) => item.selected)
            .map((item) => item.id);
    }

    public log(): void {
        Logger.log(`DocumentFilter.items`, this._items);
    }

    private updateSelectedCount(): void {
        this._selectedCount = Object.values(this._items).filter((item) => item.selected).length;
    }

    private callChangeCallback(): void {
        if (this._changeCallback) this._changeCallback();
    }
}
