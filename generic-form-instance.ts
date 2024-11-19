// tslint:disable:no-any
import {BehaviorSubject} from 'rxjs';
import {createFromDefinitionObservable, SubscriptionList} from './tools/generic-form-async';
import {getValueForArray, getValueForObject, getValueForPrimitive, isArray, isNotEmpty, isObject, isPrimitiveElement} from './tools/generic-form-object-functions';
import {Path, PathItems, PathMap} from './tools/generic-form-path';
import {UiConverters, ValidationTexts} from './generic-form-commons';
import {
  asFormDefBaseConditionElement,
  asFormDefBaseElementInline,
  FormDefArray,
  FormDefBaseElementCaption,
  FormDefBaseElementInline,
  FormDefCondition,
  FormDefinition,
  FormDefObject,
  FormDefPrimitive,
  FormModelArray,
  FormModelObject,
  FormModelValue,
  getCaption,
} from './generic-form-definition';
import {GenericFormModelInspector} from "./tools/generic-form-model-inspector";
import * as _ from 'lodash';


export type FormUiItemObject = { [key: string]: FormUiItem };
export type FormUiItemArray = FormUiItem[];
export type FormUiItem = FormUiItemPrimitiveItem |
  FormUiItemObjectItem |
  FormUiItemArrayItem;

export type FormUiItemPrimitiveItem = { path: Path, type: 'input', caption: FormDefBaseElementCaption, inputType: string, def: FormDefPrimitive };
export type FormUiItemObjectItem = { path: Path, type: 'object', caption: FormDefBaseElementCaption, required: boolean, children: FormUiItemObject };
export type FormUiItemArrayItem = { path: Path, type: 'array', caption: FormDefBaseElementCaption, required: boolean, canAdd: boolean, children: FormUiItemArray };


//
// const mergeConditions = (parentConditions: FormDefCondition[], newCondition: FormDefCondition) => {
//   return newCondition ? [...parentConditions, newCondition] : [...parentConditions];
// };
//

const pathListsMatches = (a: Path[], b: Path[]) => {
  return a.length === b.length && a.every(ap => b.find(bp => ap.equals(bp))) && b.every(bp => a.find(ap => ap.equals(bp)));
};
const resolveGlobalPath = (currentParentPath: Path, relativePath: string) => {
  const parentPath = [...currentParentPath.items];
  const relativePathItems = relativePath.split('.');
  while (relativePathItems[0] === '-') {
    parentPath.pop();
    relativePathItems.shift();
  }
  return [...parentPath, ...relativePathItems];
};

type GenericFormInstanceValue =
  { type: 'unknown', path: Path, visibility: 'true' | 'false' | 'n.a.' } |
  { type: 'primitive', path: Path, originalValue: any, actualValue: any, visibility: 'true' | 'false' | 'n.a.' } |
  { type: 'object', path: Path, originalValue: any, visibility: 'true' | 'false' | 'n.a.', children: { [property: string]: GenericFormInstanceValue } } |
  { type: 'array', path: Path, originalValue: any, visibility: 'true' | 'false' | 'n.a.', children: GenericFormInstanceArray };
type GenericFormInstanceObject = { [property: string]: GenericFormInstanceValue };
type GenericFormInstanceArray = GenericFormInstanceValue[];

export class GenericFormInstance {

  public inputsByPath = new PathMap<any>();
  private arraySizeMap: PathMap<number> = new PathMap<number>();

  public outputModel: FormModelObject = {};
  public outputErrors = new BehaviorSubject<PathMap<string>>(new PathMap());
  public uiItems: FormUiItemObject = {};
  public valueMap: PathMap<any> = new PathMap();
  public validationMap: PathMap<(value: any, parent: any, inspector: GenericFormModelInspector) => Promise<(string | null)> | (string | null)> = new PathMap();

  private calculatedResult: GenericFormInstanceObject;
  private calculationNotAvailablePaths: Path[];
  private calculationErrors: PathMap<string>;
  private validationErrors: PathMap<string>;

  public formDef: FormDefinition;
  public inputModel: FormModelObject;
  private subscriptionList: SubscriptionList;

  public updateState = new BehaviorSubject<void>(null);

  public constructor(
    formDef: FormDefinition,
    inputModel: FormModelObject,
    //private maxConditionApplyCount = 100,
  ) {
    const {form, subscriptionList} = createFromDefinitionObservable(formDef);

    this.formDef = form;
    this.inputModel = JSON.parse(JSON.stringify(inputModel));

    if (subscriptionList.length) {
      subscriptionList.onData = () => {
        this.update();
      };
    }
    this.update();
  }

  public unsubscribe() {
    this.subscriptionList?.unsubscribe();
  }


  public setValue(path: Path | PathItems, value: any) {
    const resolvedPath = path instanceof Path ? path : new Path(path);

    this.inputsByPath.setValue(resolvedPath, value);

    const actualModelObject = this.getCalculatedResultByPath(resolvedPath);
    if (actualModelObject?.type === 'object') {
      this.inputsByPath.deleteChildren(resolvedPath);
    }
    if (actualModelObject?.type === 'array') {
      this.inputsByPath.deleteChildren(resolvedPath);
      this.arraySizeMap.setValue(resolvedPath, 0);
    }

    this.update();
  }

  public addToArray(path: Path | PathItems) {
    const resolvedPath = path instanceof Path ? path : new Path(path);
    const actualSize = this.arraySizeMap.getValue(path) || 0;
    this.arraySizeMap.setValue(resolvedPath, actualSize + 1);

    this.update();
  }

  public removeFromArray(path: Path | PathItems) {
    const resolvedPath = path instanceof Path ? path : new Path(path);
    const index = resolvedPath.tail;
    if (typeof index !== 'number') {
      throw new Error(`Path is not an array Element ${resolvedPath.string}`);
    }
    this.inputsByPath.removeElementsAt(resolvedPath);
    this.arraySizeMap.removeElementsAt(resolvedPath);
    const actualSize = this.arraySizeMap.getValue(resolvedPath.parent) || 0;
    this.arraySizeMap.setValue(resolvedPath.parent, actualSize - 1);
    // remove from input Object, because not all elements may be in "inputsByPath"
    const parentItems = resolvedPath.parent.items;
    let inputModel: FormModelValue = this.inputModel;
    for (const key of parentItems) {
      if (typeof key === 'string' && isObject(inputModel)) {
        inputModel = inputModel[key];
        continue;
      }
      if (typeof key === 'number' && isArray(inputModel)) {
        inputModel = inputModel[key];
        continue;
      }
      inputModel = null;
      break;
    }
    if (isArray(inputModel)) {
      (inputModel as any[]).splice(index, 1);
    }

    this.update();
  }

  private getCalculatedResultByPath(path: Path) {
    let formModelObject: GenericFormInstanceValue;
    let formModelValue: GenericFormInstanceObject | GenericFormInstanceArray = this.calculatedResult;
    for (const pathItem of path.items) {
      if (typeof pathItem === 'string' && isObject(formModelValue)) {
        formModelObject = formModelValue[pathItem];
        formModelValue = formModelObject?.type === 'object' ? formModelObject?.children : formModelObject?.type === 'array' ? formModelObject?.children : null;
      } else if (typeof pathItem === 'number' && isArray(formModelValue)) {
        formModelObject = formModelValue[pathItem];
        formModelValue = formModelObject?.type === 'object' ? formModelObject?.children : formModelObject?.type === 'array' ? formModelObject?.children : null;
      } else {
        return null;
      }
    }
    return formModelObject;
  }


  public update() {
    this.calculationErrors = new PathMap();
    this.validationErrors = new PathMap();
    this.valueMap = new PathMap();
    this.validationMap = new PathMap();
    this.uiItems = {};
    this.calculatedResult = {};

    const rootPath = new Path([]);

    let lastNotAvailablePaths: Path[] = [];
    this.calculationNotAvailablePaths = [];
    do {
      lastNotAvailablePaths = this.calculationNotAvailablePaths;
      this.calculationNotAvailablePaths = [];
      this.analyzeObject(this.calculatedResult, this.formDef, this.inputModel, rootPath, this.uiItems);
    } while (!pathListsMatches(lastNotAvailablePaths, this.calculationNotAvailablePaths));


    this.outputModel = {};
    this.convertOutputModel(rootPath, this.calculatedResult, this.outputModel);


    this.validationMap.forEach((path, validate) => {
      if (this.calculationErrors.hasValue(path)) {
        return;
      }
      const inspector = this.getInspector(path);
      const validationResult = validate(inspector.value(), inspector.parentValue(), inspector);
      if (!validationResult) {
        return;
      }
      if (typeof validationResult === 'string') {
        this.calculationErrors.setValue(path, validationResult);
      }
      if (validationResult instanceof Promise) {
        validationResult.then(result => {
          if (result) {
            this.calculationErrors.setValue(path, result);
            this.outputErrors.next(this.calculationErrors);
            this.updateState.next();
          }
        });
      }
    });

    this.validate();
  }

  public validate() {
    this.validationErrors = new PathMap();
    this.calculationErrors.forEach((path, value) => this.validationErrors.setValue(path, value));
    this.validationMap.forEach((path, validate) => {
      if (this.calculationErrors.hasValue(path)) {
        return;
      }
      const inspector = this.getInspector(path);
      const validationResult = validate(inspector.value(), inspector.parentValue(), inspector);
      if (!validationResult) {
        return;
      }
      if (typeof validationResult === 'string') {
        this.validationErrors.setValue(path, validationResult);
      }
      if (validationResult instanceof Promise) {
        validationResult.then(result => {
          if (this.validationMap.getValue(path) !== validate) {
            return;
          }
          if (result) {
            this.validationErrors.setValue(path, result);
            this.outputErrors.next(this.validationErrors);
            this.updateState.next();
          }
        });
      }
    });
    this.outputErrors.next(this.validationErrors);
    this.updateState.next();
  }

  private analyzeObject(target: GenericFormInstanceObject, formDef: FormDefinition, inputModel: FormModelObject, parentPath: Path, uiItems: FormUiItemObject): void {
    for (const [key, def] of Object.entries(formDef)) {
      const path: Path = parentPath.child(key);

      if (this.analyzeObjectHaveToSkip(target, key, asFormDefBaseConditionElement(def).condition, parentPath)) {
        continue;
      }

      if (isPrimitiveElement(def)) {
        this.analyzePrimitiveChild(target, key, def as FormDefPrimitive, inputModel, path, uiItems);

      } else if (def.type === 'object') {
        this.analyzeObjectChild(target, key, def as FormDefObject, inputModel, path, uiItems);

      } else if (def.type === 'array') {
        this.analyzeArrayChild(target, key, def as FormDefArray, inputModel, path, uiItems);

      } else if (def.type === 'subform') {

        if (asFormDefBaseElementInline(def).inline) {
          this.analyzeObject(target, def.content, inputModel, parentPath, uiItems);
        } else {
          const childUiItems: FormUiItemObject = {};
          uiItems[key] = {path, type: 'object', caption: getCaption(def), required: true, children: childUiItems};
          this.analyzeObject(target, def.content, inputModel, parentPath, childUiItems);
        }

      } else {
        throw new Error('Not Implemented');
      }

    }
  }

  private analyzeArray(target: GenericFormInstanceArray, formDef: FormDefArray, inputModel: FormModelObject[], parentPath: Path, uiItems: FormUiItemArray): void {
    const minItems = formDef.minLength || 0;
    let actualItems = Math.max(minItems, inputModel.length);
    if (this.arraySizeMap.hasValue(parentPath)) {
      actualItems = Math.max(minItems, this.arraySizeMap.getValue(parentPath));
    }
    this.arraySizeMap.setValue(parentPath, actualItems);
    for (let idx = 0; idx < actualItems; idx++) {
      const path: Path = parentPath.child(idx);
      if (isPrimitiveElement(formDef.elements)) {
        this.analyzePrimitiveChild(target, idx, formDef.elements as FormDefPrimitive, inputModel, path, uiItems);

      } else if (formDef.elements.type === 'object') {
        this.analyzeObjectChild(target, idx, formDef.elements as FormDefObject & FormDefBaseElementInline, inputModel, path, uiItems);

      } else if (formDef.elements.type === 'array') {
        this.analyzeArrayChild(target, idx, formDef.elements as FormDefArray, inputModel, path, uiItems);

      } else {
        throw new Error('Not Implemented');
      }
    }
  }


  private analyzeObjectChild(target: GenericFormInstanceObject | GenericFormInstanceArray, key: string | number, def: FormDefObject, inputModel: FormModelObject | FormModelArray, path: Path, uiItems: FormUiItemObject | FormUiItemArray) {
    let children: GenericFormInstanceObject;
    let childUiItems: FormUiItemObject;

    if (target[key]?.visibility === 'true') {
      const calculatedResultObject = target[key];
      if (calculatedResultObject.type === 'object') {
        children = calculatedResultObject.children;
        childUiItems = (asFormDefBaseElementInline(def).inline ? uiItems : uiItems[key]) as any as FormUiItemObject;
      } else {
        return;
      }
    } else {
      const [actualValue, error] = getValueForObject(def, this.resolveActualValue(isNotEmpty(inputModel?.[key]) ? inputModel?.[key] : null, path));
      if (error) {
        this.calculationErrors.setValue(path, error);
      }
      if (def.validate) {
        this.validationMap.setValue(path, def.validate);
      }

      children = actualValue ? {} : null;
      target[key] = {type: 'object', path, originalValue: inputModel?.[key], visibility: 'true', children};

      childUiItems = {};
      if (asFormDefBaseElementInline(def).inline) {
        childUiItems = uiItems as any as FormUiItemObject;
      } else {
        uiItems[key] = {path, type: 'object', caption: getCaption(def), required: def.required || false, children: childUiItems};
      }
    }

    if (children) {
      const childInputModel: any = this.inputsByPath.hasValue(path) ? this.inputsByPath.getValue(path) : inputModel?.[key];
      this.analyzeObject(children, def.properties, childInputModel, path, childUiItems);
    }
  }

  private analyzeArrayChild(target: GenericFormInstanceObject | GenericFormInstanceArray, key: string | number, def: FormDefArray, inputModel: FormModelObject | FormModelArray, path: Path, uiItems: FormUiItemObject | FormUiItemArray) {
    let children: GenericFormInstanceArray;
    let childUiItems: FormUiItemArray;

    if (target[key]?.visibility === 'true') {
      const calculatedResultObject = target[key];
      if (calculatedResultObject.type === 'array') {
        children = calculatedResultObject.children;
        childUiItems = uiItems[key] as any as FormUiItemArray;
      } else {
        return;
      }
    } else {
      const [actualValue, error] = getValueForArray(def, this.resolveActualValue(isNotEmpty(inputModel?.[key]) ? inputModel?.[key] : null, path));
      if (error) {
        this.calculationErrors.setValue(path, error);
      }
      if (def.validate) {
        this.validationMap.setValue(path, def.validate);
      }

      childUiItems = actualValue === null ? null : [];
      uiItems[key] = {path, type: 'array', caption: getCaption(def), required: def.required || false, canAdd: false, children: childUiItems};

      children = actualValue ? [] : null;
      target[key] = {type: 'array', path, originalValue: inputModel?.[key], visibility: 'true', children};
    }

    if (children) {
      const childInputModel: any = this.inputsByPath.hasValue(path) ? this.inputsByPath.getValue(path) : inputModel?.[key];
      this.analyzeArray(children, def, isArray(childInputModel) ? childInputModel : [], path, childUiItems);

      if (!this.calculationErrors.hasValue(path)) {
        if (typeof def.minLength === 'number') {
          if (children.length < def.minLength) {
            this.calculationErrors.setValue(path, ValidationTexts.arrayMin.replace('${}', `${UiConverters.number.toString(def.minLength)}`));
          }
        }
        if (typeof def.maxLength === 'number') {
          if (children.length > def.maxLength) {
            this.calculationErrors.setValue(path, ValidationTexts.arrayMax.replace('${}', `${UiConverters.number.toString(def.maxLength)}`));
          }
        }
      }

      uiItems[key].canAdd = !def.maxLength || childUiItems.length < def.maxLength;
    }


  }

  private analyzePrimitiveChild(target: GenericFormInstanceObject | GenericFormInstanceArray, key: string | number,
                                def: FormDefPrimitive, inputModel: FormModelObject | FormModelArray,
                                path: Path, uiItems: FormUiItemObject | FormUiItemArray) {

    uiItems[key] = {path, type: 'input', caption: getCaption(def), inputType: def.type, def};

    if (target[key]?.visibility === 'true') {
      return;
    }
    if (def.validate) {
      this.validationMap.setValue(path, def.validate);
    }

    // Calculate Value
    const [actualValue, error] = getValueForPrimitive(def, this.resolveActualValue(inputModel?.[key] ?? null, path));
    if (error) {
      this.calculationErrors.setValue(path, error);
    }
    target[key] = {type: 'primitive', path, actualValue, originalValue: inputModel?.[key], visibility: 'true'};

  }

  private analyzeObjectHaveToSkip(target: GenericFormInstanceObject | GenericFormInstanceArray, key: string | number, condition: FormDefCondition, parentPath: Path) {
    if (target[key]?.visibility === 'false') {
      return true;
    }
    const path: Path = parentPath.child(key);

    // Calculate Visibility
    let visibility: 'true' | 'false' | 'n.a.' = 'true';
    if (condition) {
      visibility = this.resolveCondition(condition, parentPath);
    }

    if (visibility === 'false') {
      target[key] = {type: 'unknown', path, visibility: 'false'};
      return true;
    }

    if (visibility === 'n.a.') {
      target[key] = {type: 'unknown', path, visibility: 'n.a.'};
      this.calculationNotAvailablePaths.push(path);
      return true;
    }
    return false;
  }

  private resolveActualValue(originalValue: any, path: Path) {
    if (this.inputsByPath.hasValue(path)) {
      return this.inputsByPath.getValue(path);
    } else {
      return originalValue;
    }
  }


  private convertOutputModel(parentPath: Path, fromDefObject: GenericFormInstanceObject, outputValue: FormModelObject) {
    for (const [key, obj] of Object.entries(fromDefObject)) {
      const childPath = parentPath.child(key);
      if (obj.type === 'unknown') {
        // do nothing
      } else if (obj.type === 'primitive') {
        outputValue[key] = obj.actualValue;
        this.valueMap.setValue(childPath, obj.actualValue);
      } else if (obj.type === 'object') {
        outputValue[key] = obj.children ? {} : null;
        if (obj.children) {
          this.convertOutputModel(childPath, obj.children, outputValue[key] as FormModelObject);
        }
      } else if (obj.type === 'array') {
        outputValue[key] = obj.children ? [] : null;
        if (obj.children) {
          this.convertOutputArray(childPath, obj.children, outputValue[key] as FormModelArray);
        }
      } else {
        console.error({obj}, this);
        throw new Error('Not Implemented');
      }
    }
  }

  private convertOutputArray(parentPath: Path, fromDefObject: GenericFormInstanceArray, outputValue: FormModelArray) {
    fromDefObject.forEach((item, idx) => {
      const childPath = parentPath.child(idx);
      if (item.type === 'primitive') {
        outputValue[idx] = item.actualValue;
        this.valueMap.setValue(childPath, item.actualValue);
      } else if (item.type === 'object') {
        outputValue[idx] = item.children ? {} : null;
        if (item.children) {
          this.convertOutputModel(childPath, item.children, outputValue[idx] as FormModelObject);
        }
      } else if (item.type === 'array') {
        outputValue[idx] = item.children ? [] : null;
        if (item.children) {
          this.convertOutputArray(childPath, item.children, outputValue[idx] as FormModelArray);
        }
      } else {
        console.error({item}, this);
        throw new Error('Not Implemented');
      }
    });
  }

  private resolveCondition(condition: FormDefCondition, parentPath: Path): 'true' | 'false' | 'n.a.' {
    if (!condition) {
      return 'true';
    }
    const conditionPath = resolveGlobalPath(parentPath, condition.path);
    let conditionElement: GenericFormInstanceObject | GenericFormInstanceArray = this.calculatedResult;
    let conditionValue: GenericFormInstanceValue;
    while (conditionPath.length) {
      conditionValue = conditionElement?.[conditionPath[0]];
      conditionPath.shift();
      if (!conditionValue) {
        return 'n.a.';
      }
      if (conditionValue.visibility === 'n.a.') {
        return 'n.a.';
      }
      if (conditionValue.type === 'object') {
        conditionElement = conditionValue.children;
      } else if (conditionValue.type === 'array') {
        conditionElement = conditionValue.children;
      } else {
        conditionElement = null;
      }
    }
    if (conditionValue.type === 'primitive') {
      return this.checkConditionValue(condition, conditionValue.actualValue) ? 'true' : 'false';
    }
    return 'n.a.';
  }


  private checkConditionValue(condition: FormDefCondition, value: any): boolean {
    if (condition.condition === 'in' ) {
      return isArray(condition.value) && condition.value.includes(value);
    }
    if (condition.condition === 'not-in' ) {
      return isArray(condition.value) && !condition.value.includes(value);
    }
    if (condition.condition === 'eq' || !condition.condition) {
      return value === condition.value;
    }
    if (condition.condition === 'ne') {
      return value !== condition.value;
    }
    return false;
  }

  public getInspector(path?: Path | PathItems): GenericFormModelInspector {
    let inspector = new GenericFormModelInspector(this.outputModel);
    const resolvedPathItems = path instanceof Path ? path.items : path ? path : [];
    for (let i = 0; i < resolvedPathItems.length; i++) {
      inspector = inspector.child(resolvedPathItems[i]);
    }
    return inspector;
  }

}
