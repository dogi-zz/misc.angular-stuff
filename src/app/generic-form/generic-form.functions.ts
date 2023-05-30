import {Observable, Subscriber} from 'rxjs';
import {FormDefBaseElementRequired, FormDefElement, FormDefElementInline, FormDefElementNotInline, FormDefObject} from './generic-form.data';


export const elementIsRequired = (def: FormDefElement | { required?: boolean }) => {
  return (def as { required?: boolean }).required;
};

export const objectIsRequired = (def: FormDefObject | FormDefElementNotInline | FormDefElementInline) => {
  return (def as FormDefBaseElementRequired).required || (def as FormDefElementInline).inline;
};

export const formDefIsInline = (def: FormDefElement) => {
  if (def.type === 'object') {
    return (def as FormDefElementInline).inline;
  }
  if (def.type === 'subform') {
    return (def as FormDefElementInline).inline;
  }
  return false;
};

export const formDefGetInlineProperties = (def: FormDefElement) => {
  if (def.type === 'object') {
    return def.properties;
  }
  if (def.type === 'subform') {
    return def.content;
  }
  return null;
};


export const formDefGetChildByPath = (object: any, path: string) => {
  const pathParts = path.split('.');
  let result = object ?? null;
  pathParts.forEach(part => {
    if (result !== null && part.match(/^\d+$/)) {
      result = result[parseInt(part, 10)]
    } else if (result !== null) {
      result = result[part]
    } else {
      result = null;
    }
  });
  return result;
};


export class GenFormSubject<T> extends Observable<T> {
  private observers: Subscriber<T>[] = [];
  public value: T;
  private haveValue = false;

  constructor() {
    super((observer) => {
      this.observers.push(observer);
      if (this.haveValue) {
        observer.next(this.value);
      }
      return {
        unsubscribe: () => {
          this.observers = this.observers.filter((o) => o !== observer);
        },
      };
    });
  }

  public next(value: T) {
    this.haveValue = true;
    this.value = value;
    this.observers.forEach((o) => {
      try {
        o.next(this.value);
      } catch (e) {
        console.error(e);
      }
    });
  }

  public isNew() {
    return !this.haveValue;
  }
}

export const getValidationResultAsPromise = (validationResult: Promise<(string | null)> | (string | null)) => {
  return validationResult instanceof Promise ? validationResult : Promise.resolve(validationResult);
};

export const checkConditionTargetObjectGetObjectByPath = (path: string[], target: any) => {
  if (path.length > 1) {
    return checkConditionTargetObjectGetObjectByPath(path.slice(1), target?.[path[0]]);
  } else if (path.length === 1) {
    return target?.[path[0]];
  } else {
    return undefined;
  }
};
