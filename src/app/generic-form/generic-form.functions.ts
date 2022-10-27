import {combineLatest, filter, Observable, Subscriber, Subscription} from 'rxjs';
import {FormDefElement, FormDefElementCaption, FormDefElementSelectOption, FormDefinition, FormDefInline, FormDefObject, FormModel, FormModelValue, FormValidationResult} from './generic-form.data';


export const elementIsRequired = (def: FormDefElement | {required?: boolean}) => {
  return (def as {required?: boolean}).required;
};

export const objectIsRequired = (def: FormDefObject | FormDefElementCaption | FormDefInline) => {
  return (def as FormDefElementCaption).required || (def as FormDefInline).inline;
};

export const formDefIsInline = (def: FormDefElement ) => {
  if (def.type === 'object'){
    return (def as FormDefInline).inline;
  }
  if (def.type === 'subform'){
    return (def as FormDefInline).inline;
  }
  return false;
};

export const formDefGetInlineProperties = (def: FormDefElement ) => {
  if (def.type === 'object'){
    return def.properties;
  }
  if (def.type === 'subform'){
    return def.content;
  }
  return null;
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



// TODO: ===================== ALT

export type GenericFormState = {
  observableChanges?: boolean,
  unknownValues: { path: string, value: any }[],
  selectionOptions: { path: any, observable: Observable<any>, options: FormDefElementSelectOption[] }[],
};

export type GenericFormCheckResult = { model: FormModel, state: GenericFormState };


export const optionDefinitionToPromise = <T>(value: T | Promise<T> | Observable<T>) => {
  if (value instanceof Promise) {
    return value;
  }
  if (value instanceof Observable) {
    return new Promise<T>(res => {
      const subscription = value.subscribe(val => {
        res(val);
        setTimeout(() => subscription?.unsubscribe());
      });
    });
  }
  return Promise.resolve(value);
};

export const optionDefinitionToObservable = <T>(value: T | Promise<T> | Observable<T>) => {
  if (value instanceof Promise) {
    const replaySubject = new GenFormSubject<T>();
    value.then(v => replaySubject.next(v));
    return replaySubject;
  }
  if (value instanceof Observable) {
    return value;
  }
  const result = new GenFormSubject<T>();
  setTimeout(()=>result.next(value));
  return result;
};

export const observableToPromise = <T>(observable: Observable<T>, filter?: (subject: T) => boolean, timeout?: number) => {
  return new Promise<T>(res => {
    let firstRun = true;
    let to = null;
    const subscription = observable.subscribe((next) => {
      if (firstRun && (!filter || filter(next))) {
        firstRun = false;
        if (to) {
          clearTimeout(to);
        }
        res(next);
        to = setTimeout(() => subscription.unsubscribe());
      }
    });
    if (timeout) {
      to = setTimeout(() => subscription.unsubscribe(), timeout);
    }
  });
};


export const getCheckedFormModelObservable: (formDef: FormDefinition, model: FormModel, state?: GenericFormState) => Observable<GenericFormCheckResult> =
  (formDef, model, state) => {
    state = state || {
      observableChanges: false,
      unknownValues: [],
      selectionOptions: [],
    };

    let actualFormModel = getCheckedFormModelSync('', formDef, model, state);

    let subscribers: Subscriber<GenericFormCheckResult>[] = [];
    let subscription: Subscription;
    return new Observable<GenericFormCheckResult>(subscriber => {
      subscriber.next({model: actualFormModel, state});
      subscribers.push(subscriber);

      if (subscribers.length === 1) {
        subscription = combineLatest(state.selectionOptions.map(v => v.observable)).subscribe((valuesResults) => {
          state.selectionOptions.forEach((v, i) => v.options = valuesResults[i]);
          actualFormModel = getCheckedFormModelSync('', formDef, model, state);
          subscribers.forEach(s => s.next({model: actualFormModel, state}));
        });
      }

      return {
        unsubscribe() {
          subscribers = subscribers.filter(s => s !== subscriber);
          if (!subscribers.length) {
            subscription?.unsubscribe();
          }
        },
      };
    });
  };

export const getCheckedFormModelPromise: (formDef: FormDefinition, model: FormModel, state?: GenericFormState) => Promise<GenericFormCheckResult> =
  async (formDef, model, state) => {
    state = state || {
      observableChanges: false,
      unknownValues: [],
      selectionOptions: [],
    };

    state.observableChanges = false;
    const result = getCheckedFormModelSync('', formDef, model, state);
    if (state.observableChanges) {
      return Promise.all(state.selectionOptions.map(({observable}) => observableToPromise(observable))).then((values) => {
        state.selectionOptions.forEach((v, i) => v.options = values[i]);
        const newResult = getCheckedFormModelSync('', formDef, model, state);
        return {model: newResult, state};
      });
    } else {
      return {model: result, state};
    }

  };

const getCheckedFormModelSync: (path: string, formDef: FormDefinition, model: FormModel, state: GenericFormState) => FormModel =
  (path, formDef, model, state) => {
    state.unknownValues = state.unknownValues.filter(uv => uv.path !== path);

    const resultItem: any = {};
    const knownProperties: string[] = [];

    if (!model || typeof model !== 'object' || Array.isArray(model)) {
      model = {};
    }

    // Primitives
    for (const [prop, def] of Object.entries(formDef)) {
      knownProperties.push(prop);
      if (def.type === 'subform') {
        const subResult = getCheckedFormModelSync(path, def.content, model, state);
        Object.entries(subResult).forEach(([key, value]) => resultItem[key] = value);
      } else {
        resultItem[prop] = getCheckedFormModelValue(`${path}.${prop}`, def, model[prop], state);
      }
    }

    for (const [prop, value] of Object.entries(model)) {
      if (!knownProperties.includes(prop)) {
        state.unknownValues.push({path: `${path}.${prop}`, value});
      }
    }

    return resultItem;
  };


const getCheckedFormModelValue = (path: string, def: FormDefElement, modelValue: FormModelValue, state: GenericFormState) => {
  modelValue = modelValue ?? state.unknownValues.find(uv => uv.path === path)?.value;
  state.unknownValues = state.unknownValues.filter(uv => uv.path !== path);


  return null;
};


export const getValidationResultSync = (path: string, formDef: FormDefinition, model: FormModel, state?: GenericFormState) => {
  state = state || {
    observableChanges: false,
    unknownValues: [],
    selectionOptions: [],
  };

  const validationResult: FormValidationResult = {};

  for (const [prop, def] of Object.entries(formDef)) {
    if (def.type === 'subform') {
      const subResult = getValidationResultSync(path, def.content, model, state);
      Object.entries(subResult).forEach(([key, value]) => validationResult[key] = value);
    } else {
      getValidationValueResultSync(validationResult, `${path}.${prop}`, def, model[prop], state);
    }
  }

  return validationResult;
};


const getValidationValueResultSync = (validationResult: FormValidationResult, path: string, def: FormDefElement, value: any, state: GenericFormState) => {
  value = value ?? state.unknownValues.find(uv => uv.path === path)?.value;


};

