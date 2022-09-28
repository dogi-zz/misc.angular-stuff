import {beforeEach, describe, expect, it} from '@jest/globals';
import {BehaviorSubject, Observable} from 'rxjs';
import {FormDefElementSelectOption, FormDefinition, ValidationTexts} from '../generic-form/generic-form.data';
import {GenericFormState, getCheckedFormModelObservable, getCheckedFormModelPromise, getValidationResult} from '../generic-form/generic-form.functions';


describe('generic-form', () => {

  beforeEach(async () => {

  });



  it('Check and Validate Selection', async () => {
    let formDefinition: FormDefinition;
    let formState : GenericFormState;

    // Async

    let subject: BehaviorSubject<FormDefElementSelectOption[]>;

    subject = new BehaviorSubject<FormDefElementSelectOption[]>([]);

    formDefinition = {
      selection1: {
        type: 'selection',
        caption: 'SelectValue',
        required: true,
        options: subject,
      },
    };

    expect((await getCheckedFormModelPromise(formDefinition, {selection1: 'foo'})).model).toEqual({selection1: null});

    subject.next([
      {label: 'var1', value: 123},
      {label: 'var1', value: 'test'},
      {label: 'var1', value: false},
    ]);

    expect((await getCheckedFormModelPromise(formDefinition, {selection1: 'foo'})).model).toEqual({selection1: null});

    subject.next([
      {label: 'var1', value: 'foo'},
      {label: 'var1', value: 'test'},
      {label: 'var1', value: false},
    ]);

    expect((await getCheckedFormModelPromise(formDefinition, {selection1: 'foo'})).model).toEqual({selection1: 'foo'});

    expect((await getCheckedFormModelPromise(formDefinition,
      {selection1: null},
      {selectionOptions: [], unknownValues: [{path: '.selection1', value: 'test'}]},
    )).model).toEqual({selection1: 'test'});


    subject = new BehaviorSubject<FormDefElementSelectOption[]>([]);
    formDefinition = {
      name1: {type: 'text', caption: 'Name 1'},
      selection1: {
        type: 'selection',
        caption: 'SelectValue',
        required: true,
        options: subject,
      },
    };

    const checkedObservable = getCheckedFormModelObservable(formDefinition, {name1: 'IronMan', selection1: 'foo'});
    let tempResult: any;
    checkedObservable.subscribe(res => tempResult = res);

    expect(tempResult.model).toEqual({name1: 'IronMan', selection1: null});
    expect(tempResult.state.unknownValues).toEqual([{path: '.selection1', value: 'foo'}]);

    subject.next([
      {label: 'var1', value: 'foo'},
      {label: 'var1', value: 'test'},
      {label: 'var1', value: false},
    ]);

    expect(tempResult.model).toEqual({name1: 'IronMan', selection1: 'foo'});

  });


});
