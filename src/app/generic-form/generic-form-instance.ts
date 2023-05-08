// tslint:disable:no-any

import * as _ from 'lodash';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {
  FormDefArray,
  FormDefBaseElementRequired,
  FormDefBaseInlineElement,
  FormDefCondition,
  FormDefElement,
  FormDefElementBoolean,
  FormDefElementInteger,
  FormDefElementNumber,
  FormDefElementSelect,
  FormDefElementSelectOption,
  FormDefElementText,
  FormDefinition,
  FormDefObject,
  FormModel,
  ValidationTexts,
} from './generic-form.data';
import {UiConverters} from './generic-form.definitions';
import {elementIsRequired, GenFormSubject, getValidationResultAsPromise, objectIsRequired} from './generic-form.functions';

type ResolvedFormItemDefinition = {
  path: string,
  def: FormDefElement,
  conditions: FormDefCondition[],
};

type ResolvedFormItemInstance = {
  path: string,
  definition: ResolvedFormItemDefinition;

  originalValue: any;
  //userValue: any;
  //userValueSet?: boolean;

  objectChildren?: { [propertyName: string]: ResolvedFormItemInstance };
  arrayChildren?: ResolvedFormItemInstance[];
  resolvedOptions?: FormDefElementSelectOption[];

  actualValue: any;
};

const getSubPath = (path: string, subPath: string | number) => {
  return `${path}.${subPath}`;
};
const getParentPath = (path: string) => {
  return path.substring(0, path.lastIndexOf('.'));
};

const getBaseName = (path: string) => {
  const name = path.substring(path.lastIndexOf('.'));
  return name.match(/^\d+$/) ? parseInt(name, 10) : name;
};

const mergeConditions = (conditions: FormDefCondition[], condition: FormDefCondition): FormDefCondition[] => {
  return condition ? [...conditions, condition] : conditions;
};

const getPathForCondition = (parentPath: string, conditionPath) => {
  let path = `${parentPath}.${conditionPath}`;
  const parentRegex = /(\.[^.]+\.\\)/;
  let match = path.match(parentRegex);
  while (match) {
    path = path.replace(match[1], '');
    match = path.match(parentRegex);
  }
  return path;
};

const splitArrayIndexFromPath = (arrayPath: string, childPath: string, callback: (index: number, newSubPathTail: string) => void) => {
  if (childPath.startsWith(`${arrayPath}.`)) {
    const subPath = childPath.substring(`${arrayPath}.`.length);
    const match = subPath.match(/^(\d+)(.*)/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (!isNaN(index)) {
        callback(index, match[2]);
      }
    }
  }
};


const VERBOSE = false;
const verbose: (...items: any[]) => void = VERBOSE ? console.info : () => {
};

const isObject = (obj: any) => {
  return !!obj && typeof obj === 'object' && !Array.isArray(obj);
};
const isArray = (obj: any) => {
  return !!obj && Array.isArray(obj);
};

export class GenericFormInstance {

  public inputModel: FormModel;
  public internItemInstance: { [propertyName: string]: ResolvedFormItemInstance };
  public visiblePaths: { [path: string]: boolean };

  private resolvedDefinitions: ResolvedFormItemDefinition[];
  private conditionValueObservers: { [observedPath: string]: string[] } = {};
  private setUserValues: { [path: string]: any } = {};

  public outputModel = new GenFormSubject<FormModel>();
  public errors = new BehaviorSubject<{ [path: string]: string }>({});

  private selectionSubscriptions: Subscription[] = [];
  private isReadingObject = false;

  private validationPromises: Promise<void>[] = [];

  constructor(
    public formDef: FormDefinition,
    private maxConditionApplyCount = 100,
  ) {
    this.resolvedDefinitions = [];
    this.resolveDefinitions('', formDef, []);
  }

  // ==========================================================================
  // EXTERN GETTERS/SETTERS
  // ==========================================================================


  public setModel(model: FormModel) {
    this.inputModel = _.cloneDeep(model);
    this.internItemInstance = {};
    this.setUserValues = {};
    this.visiblePaths = {};

    this.selectionSubscriptions.splice(0).forEach(s => s.unsubscribe());

    verbose('setModel ......', model);

    verbose('readObject ....');
    this.isReadingObject = true;
    this.readObject('', this.inputModel, this.inputModel, this.internItemInstance);
    this.isReadingObject = false;
    verbose('readObject .... done');
    verbose(this);

    verbose('apply ....');
    this.reapply();
    verbose('apply .... done');

    verbose(this, JSON.stringify(this.outputModel.value, null, 2));
  }

  private setUserValue(path: string, value: any) {
    this.setUserValues[path] = value;
    if (isObject(value)) {
      Object.entries(value).forEach(([k, v]) => this.setUserValue(getSubPath(path, k), v));
    }
    if (isArray(value)) {
      value.forEach((v, i) => this.setUserValue(getSubPath(path, i), v));
    }
  }

  public setValue(path: string, value: any) {
    this.setUserValue(path, value);
    verbose('setValue ....', path, value);
    const instanceItem = this.getInternItemForPath(path);
    if (instanceItem) {
      this.setValueOnItem(path, instanceItem, value);
      this.reapply();
    }
    verbose('setValue ....', path, 'done');
  }


  // ==========================================================================
  // INTERN GETTERS/SETTERS
  // ==========================================================================

  private selectOptionsReceived() {
    this.reapply();
  }

  private getObjectDefinition(path: string): [string, ResolvedFormItemDefinition][] {
    const pathParts = path.split('.').slice(1);
    const result: [string, ResolvedFormItemDefinition][] = [];
    this.resolvedDefinitions.forEach(resolvedDefinition => {
      const definitionPathParts = resolvedDefinition.path.split('.').slice(1);
      if (definitionPathParts.length === pathParts.length + 1) {
        if (pathParts.every((part, i) => definitionPathParts[i] === (part.match(/^\d+$/) ? '[]' : part))) {
          result.push([definitionPathParts[pathParts.length], resolvedDefinition]);
        }
      }
    });
    return result;
  }

  private getSingleDefinition(path: string): ResolvedFormItemDefinition[] {
    const pathParts = path.split('.').slice(1);
    const result: ResolvedFormItemDefinition[] = [];
    this.resolvedDefinitions.forEach(resolvedDefinition => {
      const definitionPathParts = resolvedDefinition.path.split('.').slice(1);
      if (definitionPathParts.length === pathParts.length) {
        if (pathParts.every((part, i) => definitionPathParts[i] === (part.match(/^\d+$/) ? '[]' : part))) {
          result.push(resolvedDefinition);
        }
      }
    });
    return result;
  }

  private getInternItemForPath(path: string): ResolvedFormItemInstance {
    if (!path.length) {
      return null;
    }
    const pathParts = path.split('.').slice(1);
    let actualItem: ResolvedFormItemInstance = {objectChildren: this.internItemInstance} as ResolvedFormItemInstance;
    pathParts.forEach(pathPart => {
      if (actualItem?.objectChildren) {
        actualItem = actualItem.objectChildren[pathPart];
      } else if (actualItem?.arrayChildren) {
        actualItem = actualItem.arrayChildren[parseInt(pathPart, 10)];
      }
    });
    return actualItem;
  }


  private reapply() {
    const newResultValue: any = {};
    const changedPathList: string[] = [];
    this.applyObject('', newResultValue, this.internItemInstance, changedPathList);
    let counter = 0;
    while (changedPathList.length && counter < Math.min(this.maxConditionApplyCount, 1)) {
      counter++;
      changedPathList.splice(0);
      this.visiblePaths = {};
      this.readObject('', this.inputModel, newResultValue, this.internItemInstance);
      this.applyObject('', newResultValue, this.internItemInstance, changedPathList);
    }

    this.validationPromises = [];
    this.outputModel.next(newResultValue);

    const errors: { [path: string]: string } = {};
    this.validateObject('', errors, this.internItemInstance);
    this.errors.next(errors);
  }


  // ==========================================================================
  // RESOLVE DEFINITIONS
  // ==========================================================================

  private resolveDefinitions(path: string, formDef: FormDefinition, conditions: FormDefCondition[]) {
    for (const [propertyName, def] of Object.entries(formDef)) {
      const entryConditions = mergeConditions(conditions, def.condition);
      if (def.type === 'subform') {
        this.resolveDefinitions(path, def.content, entryConditions);
      } else {
        const subPath = getSubPath(path, propertyName);
        entryConditions.forEach(condition => {
          const conditionPath = getPathForCondition(path, condition.path);
          this.addConditionPath(conditionPath, subPath);
        });
        this.resolvedDefinitions.push({path: subPath, def, conditions: entryConditions});
        if (def.type === 'object') {
          this.resolveDefinitions(subPath, def.properties, entryConditions.map(c => ({...c, path: `\\.${c.path}`})));
        }
        if (def.type === 'array') {
          this.resolveDefinitions(subPath, {'[]': def.elements as any}, entryConditions.map(c => ({...c, path: `\\.${c.path}`})));
        }
      }
    }
  }

  private addConditionPath(conditionPath, subPath) {
    this.conditionValueObservers[conditionPath] = this.conditionValueObservers[conditionPath] || [];
    if (!this.conditionValueObservers[conditionPath].includes(subPath)) {
      this.checkPathRecursion(conditionPath, subPath);
      this.conditionValueObservers[conditionPath].push(subPath);
    }
  }

  private checkPathRecursion(conditionPath, subPath) {
    Object.entries(this.conditionValueObservers).forEach((([cConditionPath, cSubPath]) => {
      if (cSubPath === conditionPath) {
        if (cConditionPath === subPath) {
          throw new Error('Condition Loop!');
        }
        this.checkPathRecursion(cConditionPath, subPath);
      }
    }));
  }

  // ==========================================================================
  // READ DATA FROM MODEL
  // ==========================================================================

  private readObject(path: string, originalValue: any, actualValue: any, target: { [propertyName: string]: ResolvedFormItemInstance }): void {
    verbose('....readObject', path);
    for (const [propertyName, definition] of this.getObjectDefinition(path)) {
      if (definition.def.type === 'subform') {
        //this.readObject(def.content, originalValue, target, resolvedDefinitions, conditions);
        throw new Error('Not Implemented'); //TODO
      } else {
        const subPath = getSubPath(path, propertyName);
        let resolvedOriginalValue;
        if (isObject(this.setUserValues[path])){
          resolvedOriginalValue = this.setUserValues[path];
        } else if (isObject(originalValue) && originalValue[propertyName] !== undefined){
          resolvedOriginalValue = originalValue;
        } else if (isObject(actualValue) && actualValue[propertyName] !== undefined){
          resolvedOriginalValue = actualValue;
        }
        this.readSingleElement(subPath, resolvedOriginalValue?.[propertyName], actualValue?.[propertyName], target, propertyName);
      }
    }
  }

  private readArray(def: FormDefArray, path: string, originalValue: any, actualValue: any, target: ResolvedFormItemInstance[]) {
    verbose('....readArray', path);
    const resolvedOriginalValue: any[] = isArray(this.setUserValues[path]) ? this.setUserValues[path] : isArray(originalValue) ? originalValue : [];

    resolvedOriginalValue.forEach((originalValueItem, idx) => {
      const subPath = getSubPath(path, idx);
      this.readSingleElement(subPath, resolvedOriginalValue?.[idx], actualValue?.[idx], target, idx);
    });
    for (let idx = target.length; idx < def.minLength || 0; idx++ ){
      const subPath = getSubPath(path, idx);
      this.readSingleElement(subPath, null, null, target, idx);
    }
  }

  private checkConditions(path: string, conditions: FormDefCondition[]): boolean {
    const parentPath = getParentPath(path);
    let result = true;
    conditions.forEach(c => {
      const conditionPath = getPathForCondition(parentPath, c.path);
      const conditionElement = this.getInternItemForPath(conditionPath);
      if ((c.condition ?? null) === null || c.condition === 'eq') {
        if ((conditionElement?.actualValue ?? null) !== (c.value ?? null)) {
          result = false;
        }
      }
      if (c.condition === 'ne') {
        if ((conditionElement?.actualValue ?? null) === (c.value ?? null)) {
          result = false;
        }
      }
    });
    return result;
  }

  private readSingleElement(path: string, originalValue: any, actualValue: any, target: { [propertyName: string]: ResolvedFormItemInstance } | ResolvedFormItemInstance[], propertyName: string | number): void {
    verbose('....readSingleElement', path, target);
    let fondMatchedCondition = false;
    this.visiblePaths[path] = false;
    for (const definition of this.getSingleDefinition(path)) {
      if (definition.conditions.length) {
        if (!this.checkConditions(path, definition.conditions)) {
          continue;
        }
      }
      fondMatchedCondition = true;
      this.visiblePaths[path] = true;

      const result: ResolvedFormItemInstance = target[propertyName] || {path, definition, originalValue: actualValue === undefined ? originalValue : actualValue, userValue: null, actualValue: null};
      target[propertyName] = result;
      //result.actualValue = null;
      result.originalValue = originalValue;
      result.definition = definition;

      const def = definition.def;
      if (def.type === 'selection') {
        result.objectChildren = null;
        result.arrayChildren = null;
        result.resolvedOptions = [];
        if (Array.isArray(def.options)) {
          result.resolvedOptions = def.options;
        } else if (def.options instanceof Observable) {
          this.selectionSubscriptions.push(def.options.subscribe(options => {
            result.resolvedOptions = options;
            if (!this.isReadingObject) {
              this.selectOptionsReceived();
            }
          }));
        } else {
          console.error(def.options);
          throw new Error('Option type not supported');
        }
        target[propertyName] = result;
      } else if (def.type === 'text' || def.type === 'number' || def.type === 'integer' || def.type === 'boolean') {
        result.objectChildren = null;
        result.arrayChildren = null;
        //result.actualValue = null;
      } else if (def.type === 'object') {
        result.objectChildren = result.objectChildren || {};
        result.arrayChildren = null;
        this.readObject(path, originalValue, actualValue, result.objectChildren);
      } else if (def.type === 'array') {
        result.objectChildren = null;
        result.arrayChildren = result.arrayChildren || [];
        this.readArray(def, path, originalValue, actualValue, result.arrayChildren);
      } else {
        throw new Error(`invalid form value definition ${(def as any).type}`);
      }
    }

    if (!fondMatchedCondition) {
      if ((target[propertyName] ?? null) !== null) {
        delete target[propertyName];
      }
    }
    return null;
  }

  // ==========================================================================
  // APPLY DATA TO OUTPUT MODEL
  // ==========================================================================


  private applyObject(path: string, target: any, itemInstance: { [propertyName: string]: ResolvedFormItemInstance }, changedPathList: string[]) {
    verbose('....applyObject', path);

    const existingProperties: string[] = [];
    for (const [propertyName, definition] of this.getObjectDefinition(path)) {
      if (definition.def.type !== 'subform') {
        const subPath = getSubPath(path, propertyName);
        const item = itemInstance[propertyName];
        if (item) {
          existingProperties.push(propertyName);
          this.applySingleElement(subPath, item, target, propertyName, changedPathList);
        }
      } else {
        throw new Error('Invalid call');
      }
    }
    Object.keys(target).forEach(propertyName => {
      if (!existingProperties.includes(propertyName)) {
        delete target[propertyName];
      }
    });
  }

  private applySingleElement(path: string, item: ResolvedFormItemInstance, targetObject: any, propertyName: string | number, changedPathList: string[]): void {
    verbose('....applySingleElement', path);
    const def = item.definition.def;
    if (def.type === 'selection') {
      this.applySelection(path, item, targetObject, propertyName, changedPathList);
    } else if (def.type === 'text' || def.type === 'number' || def.type === 'integer' || def.type === 'boolean') {
      this.applyPrimitive(path, item, targetObject, propertyName, changedPathList);
    } else if (def.type === 'object') {
      return this.applyObjectValue(path, item, targetObject, propertyName, changedPathList);
    } else if (def.type === 'array') {
      return this.applyArrayValue(path, item, targetObject, propertyName, changedPathList);
    } else {
      throw new Error(`invalid form value definition ${(def as any).type}`);
    }
  }

  private applyPrimitive(path: string, item: ResolvedFormItemInstance, targetObject: any, propertyName: string | number, changedPathList: string[]): void {
    const def: FormDefElementText | FormDefElementNumber | FormDefElementInteger | FormDefElementBoolean = item.definition.def as any;
    const actualValue = Object.keys(this.setUserValues).includes(path) ? this.setUserValues[path] : item?.originalValue;
    if (def.type === 'text') {
      targetObject[propertyName] = typeof actualValue === 'string' ? actualValue : null;
    } else if (def.type === 'number') {
      targetObject[propertyName] = typeof actualValue === 'number' && !isNaN(actualValue) ? actualValue : null;
    } else if (def.type === 'integer') {
      targetObject[propertyName] = typeof actualValue === 'number' && !isNaN(actualValue) ? Math.round(actualValue) : null;
    } else if (def.type === 'boolean') {
      targetObject[propertyName] = typeof actualValue === 'boolean' ? actualValue : null;
    } else {
      throw new Error(`invalid value def type ${(def as any).type}`);
    }
    if (!_.isEqual(item.actualValue, targetObject[propertyName])) {
      changedPathList.push(path);
    }
    item.actualValue = targetObject[propertyName];
  }

  private applySelection(path: string, item: ResolvedFormItemInstance, targetObject: any, propertyName: string | number, changedPathList: string[]): void {
    const actualValue = Object.keys(this.setUserValues).includes(path) ? this.setUserValues[path] : item?.originalValue;
    const options: FormDefElementSelectOption[] = item?.resolvedOptions;
    if (options && Array.isArray(options) && options.some(option => actualValue === option.value)) {
      targetObject[propertyName] = actualValue;
    } else {
      targetObject[propertyName] = null;
    }
    if (!_.isEqual(item.actualValue, targetObject[propertyName])) {
      changedPathList.push(path);
    }
    item.actualValue = targetObject[propertyName];
  }

  private applyObjectValue(path: string, item: ResolvedFormItemInstance, targetObject: any, propertyName: string | number, changedPathList: string[]): void {
    const def: FormDefObject = item.definition.def as any;
    const actualValue = Object.keys(this.setUserValues).includes(path) ? this.setUserValues[path] : item?.originalValue;
    if (!actualValue && !isObject(item.originalValue)) {
      targetObject[propertyName] = null;
    }
    if (isObject(actualValue) || objectIsRequired(def)) {
      item.actualValue = {};
      this.applyObject(path, item.actualValue, item.objectChildren, changedPathList);
      targetObject[propertyName] = item.actualValue;
    } else {
      targetObject[propertyName] = null;
    }
    if (!_.isEqual(item.actualValue, targetObject[propertyName])) {
      changedPathList.push(path);
    }
    item.actualValue = targetObject[propertyName];
  }

  private applyArrayValue(path: string, item: ResolvedFormItemInstance, targetObject: any, propertyName: string | number, changedPathList: string[]): void {
    const def: FormDefArray = item.definition.def as any;
    const actualValue = Object.keys(this.setUserValues).includes(path) ? this.setUserValues[path] : item?.originalValue;
    if (!actualValue && !isArray(actualValue)) {
      targetObject[propertyName] = null;
    }
    if (isArray(actualValue) || elementIsRequired(def)) {
      item.actualValue = [];
      targetObject[propertyName] = item.actualValue;
      (item.arrayChildren || []).forEach((child, index) => {
        const subPath = getSubPath(path, index);
        this.applySingleElement(subPath, child, targetObject[propertyName], index, changedPathList);
      });
    } else {
      targetObject[propertyName] = null;
    }
    if (!_.isEqual(item.actualValue, targetObject[propertyName])) {
      changedPathList.push(path);
    }
    item.actualValue = targetObject[propertyName];
  }


  // ==========================================================================
  // VALIDATE DATA
  // ==========================================================================

  protected validateObject(path: string, errors: { [path: string]: string }, itemInstance: { [propertyName: string]: ResolvedFormItemInstance }) {
    verbose('....validateObject', path);
    for (const [propertyName, definition] of this.getObjectDefinition(path)) {
      if (definition.def.type === 'subform') {
        if (definition.def.condition) {
          // const active = checkConditionTargetObject(def.condition, target);
          // if (!active){
          //   continue;
          // }
        }
        throw new Error('Not impemented');
        //this.validateObject(path, def.content, source, errors);
      } else {
        const subPath = getSubPath(path, propertyName);
        const item = itemInstance[propertyName];
        this.validateSingleElement(subPath, item, errors);
      }
    }
  }

  protected validateSingleElement(path: string, item: ResolvedFormItemInstance, errors: { [path: string]: string }) {
    if (!item) {
      return;
    }
    verbose('....validateSingleElement', path);
    const def = item.definition.def;
    if (def.type === 'selection') {
      this.validateSelection(path, item, errors);
    } else if (def.type === 'text' || def.type === 'number' || def.type === 'integer' || def.type === 'boolean') {
      this.validatePrimitive(path, item, errors);
    } else if (def.type === 'object') {
      this.validateObjectValue(path, item, errors);
    } else if (def.type === 'array') {
      this.validateArrayValue(path, item, errors);
    } else {
      throw new Error(`invalid form value definition ${(def as any).type}`);
    }
  }

  protected validatePrimitive(path: string, item: ResolvedFormItemInstance, errors: { [p: string]: string }) {
    const def: FormDefElementText | FormDefElementNumber | FormDefElementInteger | FormDefElementBoolean = item.definition.def as any;
    const actualValue = Object.keys(this.setUserValues).includes(path) ? this.setUserValues[path] : item?.originalValue;

    if (def.validate) {
      const validationPromise = getValidationResultAsPromise(def.validate(actualValue, this.outputModel.value));
      this.validationPromises.push(validationPromise.then(result => {
        if (result) {
          errors[path] = result;
        } else {
          delete errors[path];
        }
      }));
      return;
    }

    if ((actualValue ?? null) === null) {
      if (elementIsRequired(def)) {
        errors[path] = ValidationTexts.required;
      }
      return;
    }

    if (def.type === 'text') {
      if (typeof actualValue !== 'string') {
        errors[path] = ValidationTexts.typeError;
      }
    } else if (def.type === 'number') {
      if (typeof actualValue !== 'number') {
        errors[path] = ValidationTexts.typeError;
      } else {
        GenericFormInstance.validatePrimitive_number(path, def, actualValue, errors);
      }
    } else if (def.type === 'integer') {
      if (typeof actualValue !== 'number') {
        errors[path] = ValidationTexts.typeError;
      } else {
        GenericFormInstance.validatePrimitive_number(path, def, actualValue, errors);
      }
    } else if (def.type === 'boolean') {
      if (typeof actualValue !== 'boolean') {
        errors[path] = ValidationTexts.typeError;
      }
    } else {
      throw new Error(`invalid value def type ${(def as any).type}`);
    }

  }

  protected validateSelection(path: string, item: ResolvedFormItemInstance, errors: { [path: string]: string }) {
    const def: FormDefElementSelect = item.definition.def as any;
    const actualValue = Object.keys(this.setUserValues).includes(path) ? this.setUserValues[path] : item?.originalValue;

    if (def.validate) {
      const validationPromise = getValidationResultAsPromise(def.validate(item.actualValue, this.outputModel.value));
      this.validationPromises.push(validationPromise.then(result => {
        if (result) {
          errors[path] = result;
        } else {
          delete errors[path];
        }
      }));
      return;
    }

    if ((actualValue ?? null) === null) {
      if (elementIsRequired(def)) {
        errors[path] = ValidationTexts.required;
      }
      return;
    }

    const options: FormDefElementSelectOption[] = item.resolvedOptions;
    if (!options.some(option => actualValue === option.value)) {
      errors[path] = ValidationTexts.optionError;
    }
  }

  protected static validatePrimitive_number(path: string, def: FormDefElementNumber | FormDefElementInteger, actualValue: any, errors: { [path: string]: string }) {
    if (isNaN(actualValue) || !isFinite(actualValue)) {
      errors[path] = ValidationTexts.NaN;
      return;
    }
    if (typeof def.min === 'number' && actualValue < def.min) {
      errors[path] = ValidationTexts.numberMin.replace('${}', `${UiConverters.number.toString(def.min)}`);
      return;
    }
    if (typeof def.max === 'number' && actualValue > def.max) {
      errors[path] = ValidationTexts.numberMax.replace('${}', `${UiConverters.number.toString(def.max)}`);
      return;
    }
  }

  protected validateObjectValue(path: string, item: ResolvedFormItemInstance, errors: { [path: string]: string }) {
    const def: FormDefObject | (FormDefObject & FormDefBaseInlineElement) = item.definition.def as any;

    let valueToValidate = Object.keys(this.setUserValues).includes(path) ? this.setUserValues[path] : (item?.originalValue || item.actualValue);

    if ((valueToValidate ?? null) !== null && !isObject(valueToValidate)) {
      errors[path] = ValidationTexts.typeError;
      return;
    }
    if (!valueToValidate && (def as FormDefBaseInlineElement).inline) {
      valueToValidate = {};
    }

    if (!valueToValidate) {
      if (objectIsRequired(def)) {
        errors[path] = ValidationTexts.required;
      }
      return;
    }
    this.validateObject(path, errors, item.objectChildren);

    if (def.validate) {
      const validationPromise = getValidationResultAsPromise(def.validate(item.actualValue, this.outputModel.value));
      this.validationPromises.push(validationPromise.then(result => {
        if (result) {
          errors[path] = result;
        } else {
          delete errors[path];
        }
      }));
    }
  }

  protected validateArrayValue(path: string, item: ResolvedFormItemInstance, errors: { [path: string]: string }) {
    const def: FormDefArray = item.definition.def as any;

    let valueToValidate = Object.keys(this.setUserValues).includes(path) ? this.setUserValues[path] : item?.originalValue;

    if ((valueToValidate ?? null) !== null && !isArray(valueToValidate)) {
      errors[path] = ValidationTexts.typeError;
      return;
    }

    if ((valueToValidate ?? null) === null && (def as FormDefBaseElementRequired).required) {
      // This was auto-replaced in GUI
      valueToValidate = [];
    }

    if (!valueToValidate) {
      if (elementIsRequired(def)) {
        errors[path] = ValidationTexts.required;
      }
      return;
    }

    if (def.validate) {
      const validationPromise = getValidationResultAsPromise(def.validate(item.actualValue, this.outputModel.value));
      this.validationPromises.push(validationPromise.then(result => {
        if (result) {
          errors[path] = result;
        } else {
          delete errors[path];
        }
      }));
    } else {
      if (typeof def.minLength === 'number') {
        if (item.arrayChildren.length < def.minLength) {
          errors[path] = ValidationTexts.arrayMin.replace('${}', `${UiConverters.number.toString(def.minLength)}`);
        }
      }
      if (typeof def.maxLength === 'number') {
        if (item.arrayChildren.length > def.maxLength) {
          errors[path] = ValidationTexts.arrayMax.replace('${}', `${UiConverters.number.toString(def.maxLength)}`);
        }
      }
    }

    item.arrayChildren.forEach((arrayChild, idx) => {
      this.validateSingleElement(`${path}.${idx}`, arrayChild, errors);
    });

  }

  // ==========================================================================
  // SET DATA
  // ==========================================================================

  private setValueOnItem(path: string, instanceItem: ResolvedFormItemInstance, value: any) {
    verbose('setValueOnItem', path, value);
    this.setUserValues[path] = value;
    //this.readSingleElement(path, value, instanceItem);
    if (instanceItem.definition.def.type === 'object') {
      if (!isObject(value)) {
        this.readObject(path, null, null, instanceItem.objectChildren);
      } else {
        this.readObject(path, value, value, instanceItem.objectChildren);
      }
    }
    if (instanceItem.definition.def.type === 'array') {
      if (!isArray(value)) {
        instanceItem.arrayChildren = null;
      } else {
        instanceItem.arrayChildren = [];
        this.readArray(instanceItem.definition.def, path, value, value, instanceItem.arrayChildren);
      }
    }
  }


  public addToArray(path: string, value: any) {
    verbose('addToArray', path, value);
    const instanceItem = this.getInternItemForPath(path);

    if (isArray(instanceItem.originalValue)) {
      instanceItem.originalValue.push(value);
    }

    const newSubPath = getSubPath(path, instanceItem.arrayChildren.length);

    this.setUserValues[newSubPath] = value;
    this.readSingleElement(newSubPath, value, value, instanceItem.arrayChildren, instanceItem.arrayChildren.length);

    this.reapply();
  }


  // ==========================================================================
  // MISC
  // ==========================================================================


  public deleteFromArray(path: string, idx: number) {
    verbose('addToArray', path, idx);
    const instanceItem = this.getInternItemForPath(path);

    instanceItem.actualValue.splice(idx, 1);
    instanceItem.arrayChildren.splice(idx, 1);

    if (isArray(instanceItem.originalValue)) {
      instanceItem.originalValue.splice(idx, 1);
    }

    // Correct array indices in user-values map
    Object.entries(this.setUserValues).forEach(([p, value]) => {
      splitArrayIndexFromPath(path, p, (index, newSubPathTail) => {
        if (index === idx) {
          delete this.setUserValues[p];
        } else if (index > idx) {
          delete this.setUserValues[p];
          this.setUserValues[`${path}.${index - 1}${newSubPathTail}`] = value;
        }
      });
    });

    this.reapply();
  }


  // private getItemFromPathInArray(path: string, resolvedDefinition: ResolvedFormItemDefinition, instanceItem: ResolvedFormItemInstance): { instanceItem: ResolvedFormItemInstance, resolvedDefinition: ResolvedFormItemDefinition } {
  //   // const subPathMatch = path.match(/\.([^.]*)/);
  //   // const subItemIndex = parseInt(subPathMatch[1], 10);
  //   // if (isNaN(subItemIndex)) {
  //   //   throw new Error('Illegal Array index at ' + path);
  //   // }
  //   // const def = resolvedDefinition[1] as FormDefArray;
  //   // const subSubPath = path.substring(subPathMatch[0].length);
  //   // const subInstanceItem = instanceItem.arrayValue[subItemIndex];
  //   // const subDef: FormDefElement = def.elements;
  //   // const resolvedSubDef: ResolvedDefinitionItem = [null, subDef as any, resolvedDefinition[2]];
  //   // if (!subSubPath.length) {
  //   //   return {instanceItem: subInstanceItem, resolvedDefinition: resolvedSubDef};
  //   // } else if (subDef.type === 'object') {
  //   //   return this.getItemFromPath(subSubPath, subInstanceItem.resolvedDefinitions, subInstanceItem.objectValue);
  //   // } else if (subDef.type === 'array') {
  //   //   return this.getItemFromPathInArray(subSubPath, resolvedSubDef, subInstanceItem);
  //   // } else {
  //   //   throw new Error('illegal situation in getItemFromPathInArray');
  //   // }
  //   return null; // TODO
  // }
  //
  //
  // public wasCorrected(path: string, value: any) {
  //   // try {
  //   //   const {instanceItem, resolvedDefinition} = this.getItemFromPath(path, this.resolvedDefinitions, this.internInstanceItem);
  //   //
  //   //   if (resolvedDefinition.type === 'array' && (resolvedDefinition as any as FormDefBaseElementCaption).required) {
  //   //     if (!instanceItem.originalValue && !instanceItem.userValue && _.isEqual(value, [])) {
  //   //       return true;
  //   //     }
  //   //   }
  //   //
  //   //   return false;
  //   // } catch (e) {
  //   //   return false;
  //   // }
  //   return null;//TODO
  // }

}
