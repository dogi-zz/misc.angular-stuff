import {combineLatest, filter, Observable, Subscriber, Subscription} from 'rxjs';
import {FormDefElement, FormDefElementSelectOption, FormDefinition, FormModel, FormModelValue, FormValidationResult, ValidationTexts} from './generic-form.data';
import {UiConverters} from './generic-form.definitions';


export type GenericFormState = {
  observableChanges?: boolean,
  unknownValues: { path: string, value: any }[],
  selectionOptions: { path: any, observable: Observable<any>, options: FormDefElementSelectOption[] }[],
};

export type GenericFormCheckResult = { model: FormModel, state: GenericFormState };


class DcReplaySubject<T> extends Observable<T> {
  private observers: Subscriber<T>[] = [];
  public value: T;
  private haveValue = false;

  private updatePromises: ((item: T) => void)[] = [];

  private onStart: () => void;
  private onStop: () => void;

  constructor(startValue?: T) {
    super((observer) => {
      this.observers.push(observer);
      if (this.haveValue) {
        observer.next(this.value);
      }
      if (this.observers.length === 1 && this.onStart) {
        this.onStart();
      }
      return {
        unsubscribe: () => {
          this.observers = this.observers.filter((o) => o !== observer);
          if (this.observers.length === 0 && this.onStop) {
            this.onStop();
          }
        },
      };
    });
    if (startValue !== undefined) {
      setTimeout(() => {
        this.next(startValue);
      });
    }
  }

  public getFromNow(): Observable<T> {
    if (this.haveValue) {
      let firstValueReceived = false;
      return this.pipe(filter(() => {
        if (firstValueReceived) {
          return true;
        } else {
          firstValueReceived = true;
          return false;
        }
      }));
    } else {
      return this;
    }
  }

  public setActions(onStart: () => void, onStop: () => void) {
    this.onStart = onStart;
    this.onStop = onStop;
    if (this.observers.length && this.onStart) {
      this.onStart();
    }
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
    this.updatePromises.splice(0).forEach((res) => {
      try {
        res(this.value);
      } catch (e) {
        console.error(e);
      }
    });
  }

  public isNew() {
    return !this.haveValue;
  }

  public getNextAsPromise(): Promise<T> {
    return new Promise((res) => this.updatePromises.push(res));
  }
}

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
    const replaySubject = new DcReplaySubject<T>();
    value.then(v => replaySubject.next(v));
    return replaySubject;
  }
  if (value instanceof Observable) {
    return value;
  }
  return new DcReplaySubject<T>(value);
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

const getCheckedFormModelSync: (path: string, formDef: FormDefinition, model: FormModel,  state: GenericFormState) => FormModel =
  (path, formDef, model,  state) => {
    state.unknownValues = state.unknownValues.filter(uv => uv.path !== path);

    const resultItem: any = {};
    const knownProperties: string[] = [];

    if (!model || typeof model !== 'object' || Array.isArray(model)) {
      model = {};
    }

    // Primitives
    for (const [prop, def] of Object.entries(formDef)) {
      knownProperties.push(prop);
      resultItem[prop] = getCheckedFormModelValue(`${path}.${prop}`, def, model[prop], state);
    }

    Object.entries(model).forEach(([prop, value]) => {
      if (!knownProperties.includes(prop)) {
        state.unknownValues.push({path: `${path}.${prop}`, value});
      }
    });

    return resultItem;
  };


const getCheckedFormModelValue = (path: string, def: FormDefElement, modelValue: FormModelValue, state: GenericFormState) => {
  modelValue = modelValue ?? state.unknownValues.find(uv => uv.path === path)?.value;
  state.unknownValues = state.unknownValues.filter(uv => uv.path !== path);

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
    let options: FormDefElementSelectOption[];
    const optionsSelection = state.selectionOptions.find(so => so.path === path);
    if (optionsSelection) {
      options = optionsSelection.options;
    } else {
      state.observableChanges = true;
      state.selectionOptions.push({path, observable: optionDefinitionToObservable(def.options), options: []});
      options = [];
    }
    if (options.some(option => modelValue === option.value)) {
      return modelValue;
    } else {
      state.unknownValues.push({path, value: modelValue});
      return null;
    }
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
      return getCheckedFormModelSync(path, def.properties, childModel, state);
    }
  }

  // Array
  if (def.type === 'array') {
    if ((modelValue ?? null) === null || !Array.isArray(modelValue)) {
      return def.required ? [] : null;
    } else {
      const result = [];
      for (let i = 0; i < (modelValue as any[]).length; i++) {
        const childModel = (modelValue as any[])[i];
        const checkedModel = getCheckedFormModelValue(`${path}.${i}`, def.elements, childModel, state);
        result.push(checkedModel);
      }
      return result;
    }
  }

  return null;
};


export const getValidationResult = (path: string, formDef: FormDefinition, model: FormModel, state?: GenericFormState) => {
  state = state || {
    observableChanges: false,
    unknownValues: [],
    selectionOptions: [],
  };

  const validationResult: FormValidationResult = {};

  for (const [prop, def] of Object.entries(formDef)) {
    getValidationValueResult(validationResult, `${path}.${prop}`, def, model[prop], state);
  }

  return validationResult;
};


const getValidationValueResult = (validationResult: FormValidationResult, path: string, def: FormDefElement, value: any, state: GenericFormState) => {
  value = value ?? state.unknownValues.find(uv => uv.path === path)?.value;

  if ((value ?? null) === null) {
    if (def.required) {
      validationResult[path] = ValidationTexts.required;
      return;
    }
    return;
  }

  if (def.type === 'text') {
    if (typeof value !== 'string') {
      validationResult[path] = ValidationTexts.typeError;
      return;
    }
  }

  if (def.type === 'number' || def.type === 'integer') {
    if (typeof value !== 'number') {
      validationResult[path] = ValidationTexts.typeError;
      return;
    }
    if (isNaN(value)) {
      validationResult[path] = ValidationTexts.NaN;
      return;
    }
    if (typeof def.min === 'number' && value < def.min) {
      validationResult[path] = ValidationTexts.numberMin.replace('${}', `${UiConverters.number.toString(def.min)}`);
      return;
    }
    if (typeof def.max === 'number' && value > def.max) {
      validationResult[path] = ValidationTexts.numberMax.replace('${}', `${UiConverters.number.toString(def.max)}`);
      return;
    }
  }

  if (def.type === 'boolean') {
    if (typeof value !== 'boolean') {
      validationResult[path] = ValidationTexts.typeError;
      return;
    }
  }

  if (def.type === 'selection') {
    const options = state.selectionOptions.find(so => so.path === path)?.options || [];
    if (!options.some(option => value === option.value)) {
      validationResult[path] = ValidationTexts.optionError;
      return;
    }
  }

  if (def.type === 'object') {
    if (typeof value !== 'object' || Array.isArray(value)) {
      validationResult[path] = ValidationTexts.typeError;
      return;
    }
    const childResult = getValidationResult(path, def.properties, value, state);
    Object.assign(validationResult, childResult);
  }


  if (def.type === 'array') {
    if (!Array.isArray(value)) {
      validationResult[path] = ValidationTexts.typeError;
      return;
    }
    if (typeof def.minLength === 'number') {
      if (value.length < def.minLength) {
        validationResult[path] = ValidationTexts.arrayMin.replace('${}', `${UiConverters.number.toString(def.minLength)}`);
      }
    }
    if (typeof def.maxLength === 'number') {
      if (value.length > def.maxLength) {
        validationResult[path] = ValidationTexts.arrayMax.replace('${}', `${UiConverters.number.toString(def.maxLength)}`);
      }
    }
    for (let i = 0; i < value.length; i++) {
      getValidationValueResult(validationResult, `${path}.${i}`, def.elements, value[i], state);
    }
  }

};

