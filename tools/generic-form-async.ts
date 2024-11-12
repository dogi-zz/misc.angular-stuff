import {Observable, Observer, Subscription} from 'rxjs';
import {FormDefArray, FormDefElement, FormDefinition, FormDefObject} from '../generic-form-definition';
import {isPrimitiveElement} from './generic-form-object-functions';

export class SubscriptionList {

  private subscriptions: Subscription[] = [];

  public onData: ()=>void;

  public constructor() {
  }

  public get length(){
    return this.subscriptions.length;
  }

  public subscribe(observable: Observable<any>, callback: (data: any) => void) {
    this.subscriptions.push(observable.subscribe((data)=>{
      callback(data);
      this.onData?.();
    }));
  }

  public unsubscribe() {
    this.subscriptions.splice(0).forEach(s => s.unsubscribe());
  }
}

const promiseAsObservable = (source: Promise<any>) => {
  return new Observable((observer: Observer<any>) => {
    let isActive = true;
    source.then((value) => {
      if (isActive) {
        observer.next(value);
        observer.complete();
      }
    });
    return {
      unsubscribe: () => {
        isActive = false;
      },
    };
  });
};

const convertPrimitive = (source: FormDefElement, subscriptionList: SubscriptionList) => {
  const result = {...source};
  if (result.type === 'selection') {
    if (result.options instanceof Promise) {
      result.options = promiseAsObservable(result.options);
    }
    if (result.options instanceof Observable) {
      const sourceObservable = result.options;
      result.options = [];
      subscriptionList.subscribe(sourceObservable, (options) => {
        result.options = options;
      });
    }
  }
  return result;
};

const walkArray = (source: FormDefArray, target: FormDefArray, subscriptionList: SubscriptionList) => {
  target.elements = {...source.elements};
  if (isPrimitiveElement(source.elements)) {
    target.elements = convertPrimitive(source.elements, subscriptionList);
  } else if (source.elements.type === 'object') {
    target.elements = {...source.elements};
    const targetObject = target.elements as FormDefObject;
    targetObject.properties = {};
    walkObject(source.elements.properties, targetObject.properties, subscriptionList);
  } else if (target.elements.type === 'array') {
    target.elements = {...source.elements};
    const targetArray = target.elements as FormDefArray;
    walkArray(source.elements as FormDefArray, targetArray, subscriptionList);
  } else {
    throw new Error('Not Implemented');
  }
};
const walkObject = (source: FormDefinition, target: FormDefinition, subscriptionList: SubscriptionList) => {
  Object.entries(source).forEach(([key, def]) => {
    if (isPrimitiveElement(def)) {
      target[key] = convertPrimitive(source[key], subscriptionList) as any;
    } else if (def.type === 'object') {
      target[key] = {...source[key]};
      const targetObject = target[key] as FormDefObject;
      targetObject.properties = {};
      walkObject(def.properties, targetObject.properties, subscriptionList);
    } else if (def.type === 'array') {
      target[key] = {...source[key]};
      const targetArray = target[key] as FormDefArray;
      walkArray(def, targetArray, subscriptionList);
    } else {
      throw new Error('Not Implemented');
    }
  });
};


export const createFromDefinitionObservable = (formDef: FormDefinition): { form: FormDefinition, subscriptionList: SubscriptionList } => {
  const form: FormDefinition = {};
  const subscriptionList = new SubscriptionList();
  walkObject(formDef, form, subscriptionList);
  return {form, subscriptionList};
};
