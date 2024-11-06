import {FormDefElement, FormDefElementSelect, FormDefinition, FormDefPrimitiveTypes, FormDefValidationElement} from "../../../libs/generic-form/generic-form-definition";
import {BehaviorSubject} from "rxjs";
import * as _ from 'lodash';
import {ResolvedFormData} from "./generic-form-showcase.component";

const forEachOptions = (path: string[], def: FormDefElement, callback: (path: string[], element: FormDefElementSelect) => void) => {
  if (def.type === 'selection') {
    callback(path, def);
  }
  if (def.type === 'array') {
    forEachOptions([...path, '#'], def.elements, callback);
  }
  if (def.type === 'object') {
    Object.entries(def.properties).forEach(([key, value]) => {
      forEachOptions([...path, key], value, callback);
    });
  }
};

const forEachValidations = (path: string[], def: FormDefElement, callback: (path: string[], element: FormDefValidationElement) => void) => {
  if (FormDefPrimitiveTypes.includes(def.type)) {
    if (def.validate !== undefined) {
      callback(path, def);
    }
  }
  if (def.type === 'array') {
    if (def.validate !== undefined) {
      callback(path, def);
    }
    forEachValidations([...path, '#'], def.elements, callback);
  }
  if (def.type === 'object') {
    if (def.validate !== undefined) {
      callback(path, def);
    }
    Object.entries(def.properties).forEach(([key, value]) => {
      forEachValidations([...path, key], value, callback);
    });
  }
};


export const resolveFormFromInput = (
  formDef: FormDefinition,
): ResolvedFormData => {

  const optionObservables: { [path: string]: BehaviorSubject<{ label: string, value: any }[]> } = {};
  const validationFunctions: { [path: string]: { funcCode: string, time: number } } = {};
  const formDefResolved = _.cloneDeep(formDef);

  Object.entries(formDefResolved).forEach(([key, value]) => {
    forEachOptions([key], value, (path, element) => {
      if (!element.options) {
        const subject = new BehaviorSubject<{ label: string, value: any }[]>([]);
        optionObservables[path.join('.')] = subject;
        element.options = subject;
      }
    });
    forEachValidations([key], value, (path, element) => {
      if (element.validate === null) { // 'console.info("validate....", value, inspector.parentValue(), inspector); return "some error!"'
        const funcDefinition =  {funcCode: '', time: 0};
        validationFunctions[path.join('.')] = funcDefinition;
        element.validate = function(value, parent, inspector){
          if (funcDefinition.time){
            return new Promise<void>(res => setTimeout(res, funcDefinition.time)).then(()=>{
              return new Function('value', 'parent','inspector', funcDefinition.funcCode)(value, parent, inspector);
            });
          } else {
            return new Function('value', 'parent','inspector', funcDefinition.funcCode)(value, parent, inspector);
          }
        } as any;
      }
    });
  });

  return {formDefResolved, optionObservables, validationFunctions};
};
