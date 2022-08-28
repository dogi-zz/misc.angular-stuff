import {BehaviorSubject, Observable} from 'rxjs';
import {FormDefElement, FormDefinition, FormModel, FormModelValue, FormValidationResult, FormValidationResultValue, ValidationTexts} from './generic-form.data';
import {UiConverters} from "./generic-form.module";


export const optionDefinitionToPromise = <T>(value: T | Promise<T> | Observable<T>) => {
  if (value instanceof Promise) {
    return value;
  }
  if (value instanceof Observable) {
    return new Promise<T>(res => {
      const subscription = value.subscribe(val => {
        res(val);
        if (subscription) {
          subscription.unsubscribe();
        } else {
          setTimeout(() => subscription?.unsubscribe());
        }
      });
    });
  }
  return Promise.resolve(value);
};

export const optionDefinitionToObservable = <T>(value: T | Promise<T> | Observable<T>) => {
  if (value instanceof Promise) {
    const behaviorSubject = new BehaviorSubject<T>(null);
    value.then(v => behaviorSubject.next(v));
    return behaviorSubject;
  }
  if (value instanceof Observable) {
    return value;
  }
  return new BehaviorSubject<T>(value);
};

const getCheckedFormModelValue = async (def: FormDefElement, modelValue: FormModelValue, keepUnknown: boolean) => {

  // Primitives
  if (def.type === 'text') {
    return typeof modelValue === 'string' ? modelValue : null;
  }
  if (def.type === 'number') {
    return typeof modelValue === 'number' ? modelValue : null;
  }
  if (def.type === 'integer') {
    return typeof modelValue === 'number' ? modelValue : null;
  }
  if (def.type === 'boolean') {
    return typeof modelValue === 'boolean' ? modelValue : null;
  }
  if (def.type === 'selection') {
    const options = await optionDefinitionToPromise(def.options);
    return options.some(option => modelValue === option.value) || keepUnknown ? modelValue : null;
  }

  // Nested
  if (def.type === 'object') {
    let childModel = modelValue as FormModel;
    if (typeof modelValue !== 'object' || Array.isArray(modelValue)) {
      childModel = null;
    }
    if (childModel === null && (def.required || def.inline)) {
      childModel = {};
    }
    if (childModel === null) {
      return null;
    } else {
      return getCheckedFormModel(def.properties, childModel, keepUnknown);
    }
  }

  // Array
  if (def.type === 'array') {
    if ((modelValue ?? null) === null || !Array.isArray(modelValue)) {
      return def.required ? [] : null;
    } else {
      const result = [];
      for (const childModel of (modelValue as any[])) {
        const checkedModel = await getCheckedFormModelValue(def.elements, childModel, keepUnknown);
        result.push(checkedModel);
      }
      return result;
    }
  }

  return null;
};

export const getCheckedFormModel: (formDef: FormDefinition, model: FormModel, keepUnknown: boolean) => Promise<FormModel> =
  async (formDef, model, keepUnknown) => {
    const resultItem: any = {};
    const knownProperties: string[] = [];

    if (!model || typeof model !== 'object' || Array.isArray(model)) {
      model = {};
    }

    // Primitives
    for (const [prop, def] of Object.entries(formDef)) {
      knownProperties.push(prop);
      resultItem[prop] = await getCheckedFormModelValue(def, model[prop], keepUnknown);
    }

    if (keepUnknown) {
      Object.entries(model).forEach(([prop, value]) => {
        if (!knownProperties.includes(prop)) {
          resultItem[prop] = value;
        }
      });
    }

    return resultItem;
  };


const getValidationValueResult = async (def: FormDefElement, value: any) => {
  if ((value ?? null) === null) {
    if (def.required) {
      return ValidationTexts.required;
    }
    return null;
  }

  if (def.type === 'text') {
    if (typeof value !== 'string') {
      return ValidationTexts.typeError;
    }
  }

  if (def.type === 'number' || def.type === 'integer') {
    if (typeof value !== 'number') {
      return ValidationTexts.typeError;
    }
    if (isNaN(value)) {
      return ValidationTexts.typeError;
    }
    if (typeof def.min === 'number' && value < def.min) {
      return ValidationTexts.numberMin.replace('${}', `${UiConverters.number.toString(def.min)}`);
    }
    if (typeof def.max === 'number' && value > def.max) {
      return ValidationTexts.numberMax.replace('${}', `${UiConverters.number.toString(def.max)}`);
    }
  }

  if (def.type === 'boolean') {
    if (typeof value !== 'boolean') {
      return ValidationTexts.typeError;
    }
  }

  if (def.type === 'selection') {
    const options = await optionDefinitionToPromise(def.options);
    if (!options.some(option => value === option.value)) {
      return ValidationTexts.optionError;
    }
  }

  if (def.type === 'object') {
    if (typeof value !== 'object' || Array.isArray(value)) {
      return ValidationTexts.typeError;
    }
    const childResult = await getValidationResult(def.properties, value);
    if (Object.keys(childResult).length) {
      if (typeof childResult === 'object') {
        return {type: 'object', value: childResult} as FormValidationResultValue;
      }
      return childResult as string;
    }
  }


  if (def.type === 'array') {
    if (!Array.isArray(value)) {
      return ValidationTexts.typeError;
    }
    const result: FormValidationResultValue = {type: 'array',  value: []};
    if (typeof def.minLength === 'number') {
      if (value.length < def.minLength) {
        result.error = ValidationTexts.arrayMin.replace('${}', `${UiConverters.number.toString(def.minLength)}`);
      }
    }
    if (typeof def.maxLength === 'number') {
      if (value.length > def.maxLength) {
        result.error = ValidationTexts.arrayMax.replace('${}', `${UiConverters.number.toString(def.maxLength)}`);
      }
    }
    for (let i = 0; i < value.length; i++) {
      result.value[i] = await getValidationValueResult(def.elements, value[i]);
    }
    if (result.error || result.value.some(v => !!v)) {
      return result;
    }
  }

  return null as FormValidationResultValue;
};

export const getValidationResult = async (formDef: FormDefinition, model: FormModel) => {
  const validationResult: FormValidationResult = {};

  for (const [prop, def] of Object.entries(formDef)) {
    const validationValueResult = await getValidationValueResult(def, model[prop]);
    if (validationValueResult) {
      validationResult[prop] = validationValueResult;
    }
  }

  return validationResult;
};


