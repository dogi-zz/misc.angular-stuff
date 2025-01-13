export type PathItems = (string | number)[];

export class Path {

  private _parent: Path;
  private _tail: string | number;
  private _string: string;

  public constructor(
      public items: PathItems,
  ) {
  }

  public invalidate() {
    this._parent = undefined;
    this._tail = undefined;
    this._string = undefined;
  }

  public get parent(): Path {
    if (!this._parent && this.items.length > 1) {
      this._parent = new Path(this.items.slice(0, this.items.length - 1));
    }
    return this._parent;
  }

  public get tail(): string | number {
    if (this._tail === undefined) {
      this._tail = this.items[this.items.length - 1];
    }
    return this._tail;
  }

  public get string(): string {
    if (this._string === undefined) {
      this._string = this.items.join('.');
    }
    return this._string;
  }

  public child(newItem: string | number): Path {
    const result = new Path([...this.items, newItem]);
    if (this.items.length) {
      result._parent = this;
    }
    return result;
  }

  public equals(other: Path): boolean {
    if (this.items.length !== other.items.length) {
      return false;
    }
    return this.items.every((value, i) => other.items[i] === value);
  }

  public startsWith(prefix: Path): boolean {
    return this.items.length > prefix.items.length && prefix.items.every((value, i) => this.items[i] === value);
  }


}

type PathMapItem<T> = { path: Path, value: T };

export class PathMap<T> {

  private items: PathMapItem<T>[] = [];
  private itemMap: { [pathString: string]: PathMapItem<T> } = {};

  public constructor() {
  }

  public get length(): number {
    return this.items.length;
  }

  private recalculateItemMap() {
    this.itemMap = {};
    this.items.forEach((value) => this.itemMap[value.path.string] = value);
  }

  public setValue(path: Path, value: T) {
    const item = this.items.find(i => i.path.equals(path));
    if (item) {
      item.value = value;
    } else {
      this.itemMap[path.string] = {path, value};
      this.items.push(this.itemMap[path.string]);
    }
  }


  public hasValue(path: Path | PathItems) {
    return !!this.itemMap[path instanceof Path ? (path.string) : path.join('.')];
  }

  public getValue(path: Path | PathItems) {
    const item = this.itemMap[path instanceof Path ? (path.string) : path.join('.')];
    return item?.value;
  }

  public export(): { [path: string]: T } {
    const result = {};
    this.items.forEach(item => result[item.path.items.join('.')] = item.value);
    return result;
  }

  public deleteChildren(path: Path) {
    this.items = this.items.filter(item => {
      if (!item.path.startsWith(path)) {
        return true;
      }
      delete this.itemMap[item.path.string];
      return false;
    });
  }

  public deleteValue(path: Path) {
    this.items = this.items.filter(item => !item.path.equals(path));
  }

  public removeElementsAt(path: Path) {
    const parent = path.parent;
    const index = path.tail;
    if (typeof index !== 'number') {
      throw new Error(`Path is not an array Element ${path.string}`);
    }
    this.deleteChildren(path);
    this.deleteValue(path);
    this.items.forEach(item => {
      if (item.path.startsWith(parent)) {
        if (typeof item.path.items[parent.items.length] === 'number') {
          if (typeof item.path.items[parent.items.length] === 'number' && item.path.items[parent.items.length] as number > index) {
            item.path.items[parent.items.length] = (item.path.items[parent.items.length] as number) - 1;
            item.path.invalidate();
          }
        }
      }
    });
    this.recalculateItemMap();
  }

  public forEach(callback: (path: Path, value: T) => void) {
    this.items.forEach(item => {
      callback(item.path, item.value);
    });
  }

}
