// tslint:disable:no-any

import * as _ from 'lodash';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {
  FormDefArray, FormDefBaseElementCaption,
  FormDefElement,
  FormDefElementBoolean,
  FormDefElementCaption,
  FormDefElementInteger,
  FormDefElementNumber,
  FormDefElementSelect,
  FormDefElementSelectOption,
  FormDefElementText,
  FormDefinition,
  FormDefInline,
  FormDefObject,
  FormModel,
  ValidationTexts,
} from './generic-form.data';
import {UiConverters} from './generic-form.definitions';
import {elementIsRequired, GenFormSubject, objectIsRequired} from './generic-form.functions';

type GenericFormInstanceItem = {
  originalValue: any;
  userValue: any;
  userValueSet?: boolean;

  arrayValue?: GenericFormInstanceItem[];
  objectValue?: { [key: string]: GenericFormInstanceItem };
  resolvedOptions?: FormDefElementSelectOption[];
  resolvedDefinitions?: { [name: string]: FormDefElementCaption | FormDefInline };
};

export class GenericFormInstance {

  public inputModel: FormModel;
  public internInstanceItem: { [key: string]: GenericFormInstanceItem };

  private resolvedDefinitions: { [name: string]: FormDefElementCaption | FormDefInline };

  public outputModel = new GenFormSubject<FormModel>();
  public errors = new BehaviorSubject<{ [path: string]: string }>({});

  private selectionSubscriptions: Subscription[] = [];
  private isReadObject = false;

  constructor(
    public formDef: FormDefinition,
  ) {
  }

  public setModel(model: FormModel) {
    this.inputModel = _.cloneDeep(model);
    this.internInstanceItem = {};
    this.resolvedDefinitions = {};

    this.selectionSubscriptions.splice(0).forEach(s => s.unsubscribe());

    this.isReadObject = true;
    this.readObject(this.formDef, this.inputModel, this.internInstanceItem, this.resolvedDefinitions);
    this.isReadObject = false;

    this.reapply();
  }

  private selectOptionsReceived() {
    this.reapply();
  }


  public setValue(path: string, value: any) {
    const {instanceItem, def} = this.getItemFromPath(path, this.resolvedDefinitions, this.internInstanceItem);
    this.setValueOnItem(def, instanceItem, value);
    this.reapply();
  }

  public addToArray(path: string, value: any) {
    const {instanceItem, def} = this.getItemFromPath(path, this.resolvedDefinitions, this.internInstanceItem);
    if (def.type !== 'array') {
      throw new Error('Not an Array at path ' + path);
    }
    if (!instanceItem.arrayValue) {
      this.setValue(path, []);
    }
    const resultItem = this.readSingleElement(def.elements, value);
    instanceItem.arrayValue.push(resultItem);
    this.reapply();
  }

  public deleteFromArray(path: string, idx: number) {
    const {instanceItem, def} = this.getItemFromPath(path, this.resolvedDefinitions, this.internInstanceItem);
    if (def.type !== 'array') {
      throw new Error('Not an Array at path ' + path);
    }
    instanceItem.arrayValue.splice(idx, 1);
    this.reapply();
  }

  private reapply() {
    const newResultValue: any = {};
    this.applyObject(this.formDef, this.internInstanceItem, newResultValue);
    this.outputModel.next(newResultValue);

    const errors: { [path: string]: string } = {};
    this.validateObject('', this.resolvedDefinitions, this.internInstanceItem, errors);
    this.errors.next(errors);
  }


  private getItemFromPath(path: string, defs: { [name: string]: FormDefElement }, items: { [key: string]: GenericFormInstanceItem }): { instanceItem: GenericFormInstanceItem, def: FormDefElement } {
    const pathMatch = path.match(/\.([^.]*)/);
    const itemPath = pathMatch ? pathMatch[1] : path;
    const subPath = path.substring(pathMatch[0].length);
    const instanceItem = items[itemPath];
    const def = defs[itemPath];
    if (!def){
      throw new Error(`No definition for path "${itemPath}" from "${path}"`);
    }
    if (!subPath.length) {
      return {instanceItem, def};
    }
    if (def.type === 'object') {
      if (!instanceItem.objectValue) {
        this.setValueOnItem(def, instanceItem, {});
      }
      return this.getItemFromPath(subPath, instanceItem.resolvedDefinitions, instanceItem.objectValue);
    } else if (def.type === 'array') {
      return this.getItemFromPathInArray(subPath, def, instanceItem);
    } else {
      if (subPath.length) {
        throw new Error('Illegal path to set value');
      }
    }
    return null;
  }

  private getItemFromPathInArray(path: string, def: FormDefArray, instanceItem: GenericFormInstanceItem): { instanceItem: GenericFormInstanceItem, def: FormDefElement } {
    const subPathMatch = path.match(/\.([^.]*)/);
    const subItemIndex = parseInt(subPathMatch[1], 10);
    if (isNaN(subItemIndex)) {
      throw new Error('Illegal Array index at ' + path);
    }
    const subSubPath = path.substring(subPathMatch[0].length);
    const subInstanceItem = instanceItem.arrayValue[subItemIndex];
    const subDef: FormDefElement = def.elements;
    if (!subSubPath.length) {
      return {instanceItem: subInstanceItem, def: subDef};
    } else if (subDef.type === 'object') {
      return this.getItemFromPath(subSubPath, subInstanceItem.resolvedDefinitions, subInstanceItem.objectValue);
    } else if (subDef.type === 'array') {
      return this.getItemFromPathInArray(subSubPath, subDef, subInstanceItem);
    } else {
      throw new Error('illegal situation in getItemFromPathInArray');
    }
  }

  private setValueOnItem(def: FormDefElement, instanceItem: GenericFormInstanceItem, value: any) {
    instanceItem.userValue = value;
    instanceItem.userValueSet = true;
    if (def.type === 'object') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        instanceItem.objectValue = null;
      } else {
        const newItem = this.readSingleElement(def, value);
        instanceItem.objectValue = newItem.objectValue;
        instanceItem.resolvedDefinitions = newItem.resolvedDefinitions;
      }
    }
    if (def.type === 'array') {
      if (!value || typeof value !== 'object' || !Array.isArray(value)) {
        instanceItem.arrayValue = null;
      } else {
        const newItem = this.readSingleElement(def, value);
        instanceItem.arrayValue = newItem.arrayValue;
      }
    }
  }


  private readObject(formDef: FormDefinition, originalValue: any, target: { [key: string]: GenericFormInstanceItem }, resolvedDefinitions: { [name: string]: FormDefElementCaption | FormDefInline }) {
    for (const [prop, def] of Object.entries(formDef)) {
      if (def.type === 'subform') {
        this.readObject(def.content, originalValue, target, resolvedDefinitions);
      } else {
        resolvedDefinitions[prop] = def;
        target[prop] = this.readSingleElement(def, originalValue?.[prop]);
      }
    }
  }

  private readArray(def: FormDefElement, originalValue: any, target: GenericFormInstanceItem[]) {
    if (originalValue && Array.isArray(originalValue)) {
      originalValue.forEach(originalValueItem => {
        const resultItem = this.readSingleElement(def, originalValueItem);
        target.push(resultItem);
      });
    }
  }

  private readSingleElement(def: FormDefElement, originalValue: any): GenericFormInstanceItem {
    if (def.type === 'selection') {
      const result: GenericFormInstanceItem = {originalValue, userValue: null};
      result.resolvedOptions = [];
      if (Array.isArray(def.options)) {
        result.resolvedOptions = def.options;
      } else if (def.options instanceof Observable) {
        this.selectionSubscriptions.push(def.options.subscribe(options => {
          result.resolvedOptions = options;
          if (!this.isReadObject) {
            this.selectOptionsReceived();
          }
        }));
      } else {
        console.error(def.options);
        throw new Error('Option type not supported');
      }
      return result;
    } else if (def.type === 'text' || def.type === 'number' || def.type === 'integer' || def.type === 'boolean') {
      return {originalValue, userValue: null};
    } else if (def.type === 'object') {
      const result: GenericFormInstanceItem = {originalValue, userValue: null, objectValue: null, resolvedDefinitions: {}};
      if (originalValue && typeof originalValue === 'object' && !Array.isArray(originalValue)) {
        result.objectValue = {};
        this.readObject(def.properties, originalValue, result.objectValue, result.resolvedDefinitions);
      }
      return result;
    } else if (def.type === 'array') {
      const result: GenericFormInstanceItem = {originalValue, userValue: null, arrayValue: null};
      if (originalValue && typeof originalValue === 'object' && Array.isArray(originalValue)) {
        result.arrayValue = [];
        this.readArray(def.elements, originalValue, result.arrayValue);
      }
      return result;
    } else {
      throw new Error(`invalid form value definition ${(def as any).type}`);
    }
  }


  private applyObject(formDef: FormDefinition, source: { [key: string]: GenericFormInstanceItem }, target: any) {
    for (const [prop, def] of Object.entries(formDef)) {
      if (def.type === 'subform') {
        this.applyObject(def.content, source, target);
      } else {
        target[prop] = this.applySingleElement(def, source?.[prop]);
      }
    }
  }


  private applyArray(def: FormDefArray, source: GenericFormInstanceItem) {
    if (source?.arrayValue || elementIsRequired(def)) {
      const result = [];
      (source.arrayValue || []).forEach(arrayItem => {
        const actualValue = arrayItem.userValueSet ? arrayItem.userValue : arrayItem.originalValue;
        if ((actualValue ?? null) === null) {
          result.push(null);
        } else {
          result.push(this.applySingleElement(def.elements, arrayItem));
        }
      });
      return result;
    }
    return null;
  }

  private applySingleElement(def: FormDefElement, source: GenericFormInstanceItem) {
    if (def.type === 'selection') {
      return GenericFormInstance.applySelection(def, source);
    } else if (def.type === 'text' || def.type === 'number' || def.type === 'integer' || def.type === 'boolean') {
      return GenericFormInstance.applyPrimitive(def, source);
    } else if (def.type === 'object') {
      return this.applyObjectValue(def, source);
    } else if (def.type === 'array') {
      return this.applyArray(def, source);
    } else {
      throw new Error(`invalid form value definition ${(def as any).type}`);
    }
  }


  private static applyPrimitive(def: FormDefElementText | FormDefElementNumber | FormDefElementInteger | FormDefElementBoolean, source: GenericFormInstanceItem) {
    const actualValue = source?.userValueSet ? source.userValue : source?.originalValue;
    if (def.type === 'text') {
      return typeof actualValue === 'string' ? actualValue : null;
    } else if (def.type === 'number') {
      return typeof actualValue === 'number' && !isNaN(actualValue) ? actualValue : null;
    } else if (def.type === 'integer') {
      return typeof actualValue === 'number' && !isNaN(actualValue) ? Math.round(actualValue) : null;
    } else if (def.type === 'boolean') {
      return typeof actualValue === 'boolean' ? actualValue : null;
    } else {
      throw new Error(`invalid value def type ${(def as any).type}`);
    }
  }

  private static applySelection(def: FormDefElementSelect, source: GenericFormInstanceItem) {
    const actualValue = source?.userValueSet ? source.userValue : source?.originalValue;
    const options: FormDefElementSelectOption[] = source?.resolvedOptions;
    if (options && Array.isArray(options) && options.some(option => actualValue === option.value)) {
      return actualValue;
    } else {
      return null;
    }
  }

  private applyObjectValue(def: FormDefObject, source: GenericFormInstanceItem) {
    if (!source?.userValueSet && source.originalValue && (typeof source.originalValue !== 'object' || Array.isArray(source.originalValue))) {
      return null;
    }
    if ((source?.objectValue) || objectIsRequired(def)) {
      const result = {};
      this.applyObject(def.properties, source.objectValue, result);
      return result;
    }
    return null;
  }


  protected validateObject(path: string, formDef: FormDefinition, source: { [key: string]: GenericFormInstanceItem }, errors: { [path: string]: string }) {
    for (const [prop, def] of Object.entries(formDef)) {
      if (def.type === 'subform') {
        this.validateObject(path, def.content, source, errors);
      } else {
        this.validateSingleElement(`${path}.${prop}`, def, source[prop], errors);
      }
    }
  }


  protected validateArray(path: string, def: FormDefArray, source: GenericFormInstanceItem, errors: { [path: string]: string }) {
    if (!source.userValueSet && source.originalValue && (typeof (source.originalValue ?? null) !== 'object' || !Array.isArray(source.originalValue))) {
      errors[path] = ValidationTexts.typeError;
      return;
    }
    if (!source.arrayValue) {
      if (elementIsRequired(def)) {
        errors[path] = ValidationTexts.required;
      }
      return;
    }
    if (typeof def.minLength === 'number') {
      if (source.arrayValue.length < def.minLength) {
        errors[path] = ValidationTexts.arrayMin.replace('${}', `${UiConverters.number.toString(def.minLength)}`);
      }
    }
    if (typeof def.maxLength === 'number') {
      if (source.arrayValue.length > def.maxLength) {
        errors[path] = ValidationTexts.arrayMax.replace('${}', `${UiConverters.number.toString(def.maxLength)}`);
      }
    }

    source.arrayValue.forEach((arrayElement, idx) => {
      this.validateSingleElement(`${path}.${idx}`, def.elements, arrayElement, errors);
    });
  }

  protected validateSingleElement(path: string, def: FormDefElement, source: GenericFormInstanceItem, errors: { [path: string]: string }) {
    if (def.type === 'selection') {
      this.validateSelection(path, def, source, errors);
    } else if (def.type === 'text' || def.type === 'number' || def.type === 'integer' || def.type === 'boolean') {
      this.validatePrimitive(path, def, source, errors);
    } else if (def.type === 'object') {
      this.validateObjectValue(path, def, source, errors);
    } else if (def.type === 'array') {
      this.validateArray(path, def, source, errors);
    } else {
      throw new Error(`invalid form value definition ${(def as any).type}`);
    }
  }

  protected validatePrimitive(path: string, def: FormDefElementText | FormDefElementNumber | FormDefElementInteger | FormDefElementBoolean, source: GenericFormInstanceItem, errors: { [p: string]: string }) {
    const actualValue = source.userValueSet ? source.userValue : source.originalValue;

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

  protected validateSelection(path: string, def: FormDefElementSelect, source: GenericFormInstanceItem, errors: { [path: string]: string }) {
    const actualValue = source.userValueSet ? source.userValue : source.originalValue;

    if ((actualValue ?? null) === null) {
      if (elementIsRequired(def)) {
        errors[path] = ValidationTexts.required;
      }
      return;
    }

    const options: FormDefElementSelectOption[] = source.resolvedOptions;
    if (!options.some(option => actualValue === option.value)) {
      errors[path] = ValidationTexts.optionError;
    }

  }

  protected validateObjectValue(path: string, def: FormDefObject, source: GenericFormInstanceItem, errors: { [path: string]: string }) {
    if (source.userValueSet) {
      if ((typeof (source.userValue ?? null) !== 'object' || Array.isArray(source.userValue))) {
        errors[path] = ValidationTexts.typeError;
        return;
      }
      if (!source.objectValue) {
        if (objectIsRequired(def)) {
          errors[path] = ValidationTexts.required;
        }
        return;
      }
      this.validateObject(path, def.properties, source.objectValue, errors);
    } else {
      if ((typeof (source.originalValue ?? null) !== 'object' || Array.isArray(source.originalValue))) {
        errors[path] = ValidationTexts.typeError;
        return;
      }
      if (!source.originalValue) {
        if (objectIsRequired(def)) {
          errors[path] = ValidationTexts.required;
        }
        return;
      }
      this.validateObject(path, def.properties, source.objectValue, errors);
    }
  }

  public wasCorrected(path: string, value: any) {
    const {instanceItem, def} = this.getItemFromPath(path, this.resolvedDefinitions, this.internInstanceItem);

    if (def.type === 'array' && (def as any as FormDefBaseElementCaption).required) {
      if (!instanceItem.originalValue && !instanceItem.userValue && _.isEqual(value, [])) {
        return true;
      }
    }

    return false;
  }

}
