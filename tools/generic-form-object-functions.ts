import {Observable} from 'rxjs';
import {ValidationTexts} from '../generic-form-commons';
import {asFormDefBaseElementInline, FormDefArray, FormDefElement, FormDefElementInteger, FormDefElementNumber, FormDefObject, FormDefPrimitiveType, FormDefPrimitiveTypes} from '../generic-form-definition';
import {Path} from './generic-form-path';

export const isPrimitive = (obj: any) => {
  return (obj ?? null) === null || typeof obj === 'string'|| typeof obj === 'number'|| typeof obj === 'boolean';
};


export const isObject = (obj: any) => {
  return !!obj && typeof obj === 'object' && !Array.isArray(obj);
};

export const isArray = (obj: any) => {
  return !!obj && Array.isArray(obj);
};

export const isEmpty = (obj: any) => {
  return (obj ?? null) === null;
};
export const isNotEmpty = (obj: any) => {
  return !isEmpty(obj);
};

export const isPrimitiveElement = (obj: FormDefElement) => {
  return FormDefPrimitiveTypes.includes(obj.type);
};

const getJsonObject = (obj: any) => {
  if ((obj ?? null) === null) {
    return obj;
  }
  if (obj instanceof Promise || obj instanceof Observable) {
    throw new Error('async not supported');
  }
  if (obj instanceof Path ) {
    return obj.string;
  }
  if (isArray(obj)) {
    return obj.map(item => getJsonObject(item));
  } else if (isObject(obj)) {
    const result = {};
    const keys = Object.keys(obj);
    keys.sort((a, b) => a.localeCompare(b));
    keys.forEach(key => result[key] = getJsonObject(obj[key]));
    return result;
  } else {
    return obj;
  }
};
export const getJson = (obj: any) => {
  return JSON.stringify(getJsonObject(obj));
};

//
// export const isEqual = (a: any, b: any) => {
//   if ((a === null && b === null) || (a === undefined && b === undefined)) {
//     return true;
//   }
//   if (a === null || b === null || a === undefined || b === undefined) {
//     return false;
//   }
//   if (a instanceof Promise || b instanceof Promise) {
//     throw new Error('Promise not supported');
//   }
//   if (a instanceof Observable || b instanceof Observable) {
//     throw new Error('Observable not supported');
//   }
//   if (a instanceof Path || b instanceof Path) {
//     if (!(a instanceof Path) || !(b instanceof Path)) {
//       return false;
//     }
//     return a.equals(b);
//   }
//   if (isArray(a) || isArray(b)) {
//     if (!isArray(a) || !isArray(b)) {
//       return false;
//     }
//     if (a.length !== b.length) {
//       return false;
//     }
//     for (let i = 0; i < a.length; i++) {
//       if (!isEqual(a[0], b[0])) {
//         return false;
//       }
//     }
//   } else if (isObject(a) || isObject(b)) {
//     if (!isObject(a) || !isObject(b)) {
//       return false;
//     }
//     if (Object.keys(a).some(key => !b.hasOwnProperty(key)) || Object.keys(b).some(key => !a.hasOwnProperty(key))) {
//       return false;
//     }
//     for (const key of Object.keys(a)) {
//       if (!isEqual(a[key], b[key])) {
//         return false;
//       }
//     }
//   } else {
//     if (a === b) {
//       return true;
//     }
//   }
//
//
//   return false;
// };


const validateMinMax = (def: FormDefElementNumber | FormDefElementInteger, value: number): [any, string] => {
  if (typeof def.min === 'number' && value < def.min) {
    return [value, ValidationTexts.numberMin.replace('${}', `${def.min}`)];
  }
  if (typeof def.max === 'number' && value > def.max) {
    return [value, ValidationTexts.numberMax.replace('${}', `${def.max}`)];
  }
  return [value, null];
};

export const getValueForPrimitive = (def: FormDefPrimitiveType, value: any): [any, string] => {
  if ((value ?? null) === null) {
    return def.required ? [null, ValidationTexts.required] : [null, null];
  }
  if (def.type === 'text') {
    return typeof value === 'string' ? value.length ? [value, null] : ['', ValidationTexts.required] : [null, ValidationTexts.typeError];
  }
  if (def.type === 'integer') {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return [null, ValidationTexts.typeError];
    }
    return validateMinMax(def, Math.round(value));
  }
  if (def.type === 'number') {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return [null, ValidationTexts.typeError];
    }
    return validateMinMax(def, value);
  }
  if (def.type === 'boolean') {
    return typeof value === 'boolean' ? [value, null] : [null, ValidationTexts.typeError];
  }
  if (def.type === 'selection') {
    const options = def.options;
    if (Array.isArray(options)) {
      if (options.find(o => o.value === value)) {
        return [value, null];
      } else {
        return [null, ValidationTexts.optionError];
      }
    } else {
      throw new Error('Option were not converted to array');
    }
  }
  return null;
};

export const getValueForObject = (def: FormDefObject, value: any): [any, string] => {
  if (isEmpty(value)) {
    if (def.required || asFormDefBaseElementInline(def).inline ){
      return [{}, null];
    } else {
      return [null, null];
    }
  }
  if (!isObject(value)) {
    return [def.required ? {} : null, ValidationTexts.typeError];
  }
  return [{}, null];
};

export const getValueForArray = (def: FormDefArray, value: any): [any, string] => {
  if (isEmpty(value)) {
    if (def.required) {
      return [[], null];
    } else {
      return [null, null];
    }
  }
  if (!isArray(value)) {
    return [def.required ? [] : null, ValidationTexts.typeError];
  }
  return [[], null];
};
