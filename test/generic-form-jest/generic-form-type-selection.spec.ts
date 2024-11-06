import {beforeEach, describe, expect, it} from '@jest/globals';
import {BehaviorSubject} from 'rxjs';
import {ValidationTexts} from '../../libs/generic-form/generic-form-commons';
import {FormDefElementSelectOption, FormDefinition} from '../../libs/generic-form/generic-form-definition';
import {GenericFormInstance} from '../../libs/generic-form/generic-form-instance';
/* eslint  prefer-const: 0 */


describe(__filename, () => {

  beforeEach(async () => {

  });

  it('Set Value on Selection Sync', async () => {

    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      name: {caption: null, type: 'text'},
      sel1: {
        type: 'selection',
        caption: 'SelectValue',
        required: true,
        options: [
          {label: 'var1', value: 123},
          {label: 'var1', value: 'test'},
          {label: 'var1', value: false},
        ],
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(formInstance.outputModel).toEqual({name: null, sel1: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'sel1': ValidationTexts.required,
    });

    formInstance = new GenericFormInstance(formDefinition, {name: null, sel1: null});
    expect(formInstance.outputModel).toEqual({name: null, sel1: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'sel1': ValidationTexts.required,
    });

    formInstance.setValue(['sel1'], 234);
    expect(formInstance.outputModel).toEqual({name: null, sel1: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'sel1': ValidationTexts.optionError,
    });

    formInstance.setValue(['sel1'], 'test');
    expect(formInstance.outputModel).toEqual({name: null, sel1: 'test'});
    expect(formInstance.outputErrors.value.export()).toEqual({});

  });

  it('Check and Validate Selection Async', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const options1 = new BehaviorSubject<FormDefElementSelectOption[]>([]);
    const options2 = new BehaviorSubject<FormDefElementSelectOption[]>([]);


    formDefinition = {
      name: {caption: null, type: 'text'},
      sel1: {
        type: 'selection',
        caption: 'SelectValue',
        required: true,
        options: options1,
      },
      sel2: {
        type: 'selection',
        caption: 'SelectValue',
        required: false,
        options: options2,
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {name: null, sel1: null, sel2: null});
    expect(formInstance.outputModel).toEqual({name: null, sel1: null, sel2: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'sel1': ValidationTexts.required,
    });

    formInstance.unsubscribe();


    formInstance = new GenericFormInstance(formDefinition, {sel1: 'foo', sel2: 'bar'});
    expect(formInstance.outputModel).toEqual({name: null, sel1: null, sel2: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'sel1': ValidationTexts.optionError,
      'sel2': ValidationTexts.optionError,
    });


    options1.next([
      {label: 'var1', value: 'foo'},
      {label: 'var2', value: 'bar'},
    ]);
    expect(formInstance.outputModel).toEqual({name: null, sel1: 'foo', sel2: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'sel2': ValidationTexts.optionError,
    });

    options1.next([
      {label: 'var2', value: 'bar'},
    ]);

    expect(formInstance.outputModel).toEqual({name: null, sel1: null, sel2: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'sel1': ValidationTexts.optionError,
      'sel2': ValidationTexts.optionError,
    });

    options2.next([
      {label: 'var1', value: 'foo'},
      {label: 'var2', value: 'bar'},
    ]);

    expect(formInstance.outputModel).toEqual({name: null, sel1: null, sel2: 'bar'});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'sel1': ValidationTexts.optionError,
    });


    formInstance.unsubscribe();

  });


});
