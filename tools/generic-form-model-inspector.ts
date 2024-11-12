import {isArray, isObject} from "./generic-form-object-functions";
import {Path, PathMap} from "./generic-form-path";
import {createReadonly} from "../../json-parser/src/object-proxy";

export class GenericFormModelInspector {

  private pathMap = new PathMap<any>();
  private childMap = new PathMap<GenericFormModelInspector>();
  private root: GenericFormModelInspector;

//
  public constructor(
    private subject: any,
    private path?: Path,
  ) {
    if (!this.path) {
      this.subject = createReadonly(subject);
      this.path = new Path([]);
      this.root = this;
      this.analyzeObject(this.subject, this.path);
    }
  }

  public value() {
    return this.subject;
  }

  private analyzeObject(subject: any, path: Path) {
    if (path.items.length){
      this.pathMap.setValue(path, subject);
    }
    if (isArray(subject)) {
      subject.forEach((value, idx) => {
        this.analyzeObject(value, path.child(idx));
      });
    } else if (isObject(subject)) {
      Object.entries(subject).forEach(([key, value]) => {
        this.analyzeObject(value, path.child(key));
      });
    }
  }

  public child(key: string | number) {
    const subPath = this.path.child(key);
    if (!this.childMap.hasValue(subPath)) {
      const newChild = new GenericFormModelInspector(this.pathMap.getValue(subPath), subPath);
      newChild.pathMap = this.pathMap;
      newChild.childMap = this.childMap;
      newChild.root = this.root;
      this.childMap.setValue(subPath, newChild);
    }
    return this.childMap.getValue(subPath);
  }

  public parentValue() {
    return this.parent().value();
  }

  public parent() {
    return this.path.parent ? this.childMap.getValue(this.path.parent) : this.root;
  }
}


