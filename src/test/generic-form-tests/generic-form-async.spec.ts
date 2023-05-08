import {beforeEach, describe, expect, it} from '@jest/globals';
import {BehaviorSubject} from 'rxjs';
import {GenericFormInstance} from '../../app/generic-form/generic-form-instance';
import {FormDefElementSelectOption, FormDefinition} from '../../app/generic-form/generic-form.data';


describe('generic-form', () => {

  beforeEach(async () => {

  });

  it('Async Validation of Primitive Data', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    // tslint:disable:no-any
    let object: any;
    let fistErrors: any;
    let secondErrors: any;

    const getValidationResults = async (model: any) => {
      formInstance.setModel(model);
      fistErrors = {...formInstance.errors.value};
      await new Promise(res => setTimeout(res, 10));
      secondErrors = {...formInstance.errors.value};
      return {object, fistErrors, secondErrors};
    };
    // tslint:enable:no-any


    formDefinition = {
      name_1: {
        caption: null, type: 'text',
        validate: (value, item) => {
          object = item;
          return new Promise<string | null>(res => res(value === 'invalid' ? 'my text error' : null));
        },
      },
      age_1: {
        caption: null, type: 'integer',
        validate: (value, item) => {
          object = item;
          return new Promise<string | null>(res => res(value === 123 ? 'my integer error' : null));
        },
      },
      weight_1: {
        caption: null, type: 'number',
        validate: (value, item) => {
          object = item;
          return new Promise<string | null>(res => res(value === 123 ? 'my number error' : null));
        },
      },
      employed_1: {
        caption: null, type: 'boolean',
        validate: (value, item) => {
          object = item;
          return new Promise<string | null>(res => res(value === false ? 'my boolean error' : null));
        },
      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(await getValidationResults({})).toEqual({
      object: {
        name_1: null,
        age_1: null,
        weight_1: null,
        employed_1: null,
      },
      fistErrors: {},
      secondErrors: {},
    });

    expect(await getValidationResults({name_1: 'invalid'})).toEqual({
      object: {
        name_1: 'invalid',
        age_1: null,
        weight_1: null,
        employed_1: null,
      },
      fistErrors: {},
      secondErrors: {
        '.name_1': 'my text error',
      },
    });

    expect(await getValidationResults({name_1: 'valid'})).toEqual({
      object: {
        name_1: 'valid',
        age_1: null,
        weight_1: null,
        employed_1: null,
      },
      fistErrors: {},
      secondErrors: {},
    });

    expect(await getValidationResults({age_1: 123})).toEqual({
      object: {
        name_1: null,
        age_1: 123,
        weight_1: null,
        employed_1: null,
      },
      fistErrors: {},
      secondErrors: {
        '.age_1': 'my integer error',
      },
    });

    expect(await getValidationResults({age_1: 124})).toEqual({
      object: {
        name_1: null,
        age_1: 124,
        weight_1: null,
        employed_1: null,
      },
      fistErrors: {},
      secondErrors: {},
    });

    expect(await getValidationResults({weight_1: 123})).toEqual({
      object: {
        name_1: null,
        age_1: null,
        weight_1: 123,
        employed_1: null,
      },
      fistErrors: {},
      secondErrors: {
        '.weight_1': 'my number error',
      },
    });

    expect(await getValidationResults({weight_1: 124})).toEqual({
      object: {
        name_1: null,
        age_1: null,
        weight_1: 124,
        employed_1: null,
      },
      fistErrors: {},
      secondErrors: {},
    });

    expect(await getValidationResults({employed_1: false})).toEqual({
      object: {
        name_1: null,
        age_1: null,
        weight_1: null,
        employed_1: false,
      },
      fistErrors: {},
      secondErrors: {
        '.employed_1': 'my boolean error',
      },
    });

    expect(await getValidationResults({employed_1: true})).toEqual({
      object: {
        name_1: null,
        age_1: null,
        weight_1: null,
        employed_1: true,
      },
      fistErrors: {},
      secondErrors: {},
    });


  });


  it('Validate Selection Async', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    // tslint:disable:no-any
    let object: any;
    let fistErrors: any;
    let secondErrors: any;

    const getValidationResults = async (model: any) => {
      formInstance.setModel(model);
      fistErrors = {...formInstance.errors.value};
      await new Promise(res => setTimeout(res, 10));
      secondErrors = {...formInstance.errors.value};
      return {object, fistErrors, secondErrors};
    };
    // tslint:enable:no-any

    const options = new BehaviorSubject<FormDefElementSelectOption[]>([]);


    formDefinition = {
      selection: {
        type: 'selection',
        caption: 'SelectValue',
        options,
        validate: (value, item) => {
          object = item;
          return new Promise<string | null>(res => res(value === 123 ? 'my selection error' : null));
        },
      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(await getValidationResults({})).toEqual({
      object: {
        selection: null,
      },
      fistErrors: {},
      secondErrors: {},
    });

    expect(await getValidationResults({selection: 123})).toEqual({
      object: {
        selection: null,
      },
      fistErrors: {},
      secondErrors: {},
    });

    options.next([
      {label: 'var1', value: 122},
      {label: 'var2', value: 123},
    ]);

    await new Promise(res => setTimeout(res, 10));

    expect({object, secondErrors}).toEqual({
      object: {
        selection: 123,
      },
      secondErrors: {},
    });

  });


  it('Validate Array Async', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    // tslint:disable:no-any
    let object: any;
    let fistErrors: any;
    let secondErrors: any;

    const getValidationResults = async (model: any) => {
      formInstance.setModel(model);
      fistErrors = {...formInstance.errors.value};
      await new Promise(res => setTimeout(res, 10));
      secondErrors = {...formInstance.errors.value};
      return {object, fistErrors, secondErrors};
    };
    // tslint:enable:no-any


    formDefinition = {
      myArray: {
        type: 'array',
        caption: 'String Array',
        elements: {
          type: 'object',
          properties: {
            posX: {caption: null, type: 'integer', required: true},
            posY: {caption: null, type: 'integer', required: true},
          },
        },
        validate: (value, item) => {
          object = item;
          return new Promise<string | null>(res => res(value[0]?.posX !== value[1]?.posX ? 'my array error' : null));
        },

      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(await getValidationResults({myArray: [{}]})).toEqual({
      object: {
        myArray: [
          {posX: null, posY: null},
        ],
      },
      fistErrors: {
        '.myArray.0.posX': 'this is required',
        '.myArray.0.posY': 'this is required',
      },
      secondErrors: {
        '.myArray': 'my array error',
        '.myArray.0.posX': 'this is required',
        '.myArray.0.posY': 'this is required',
      },
    });

    expect(await getValidationResults({myArray: [{posX: 1, posY: 2}, {posX: 3, posY: 4}]})).toEqual({
      object: {
        myArray: [
          {posX: 1, posY: 2},
          {posX: 3, posY: 4},
        ],
      },
      fistErrors: {},
      secondErrors: {
        '.myArray': 'my array error',
      },
    });

    expect(await getValidationResults({myArray: [{posX: 1, posY: 2}, {posX: 1, posY: 4}]})).toEqual({
      object: {
        myArray: [
          {posX: 1, posY: 2},
          {posX: 1, posY: 4},
        ],
      },
      fistErrors: {},
      secondErrors: {},
    });

  });


  it('Validate Object Async', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    // tslint:disable:no-any
    let object: any;
    let fistErrors: any;
    let secondErrors: any;

    const getValidationResults = async (model: any) => {
      formInstance.setModel(model);
      fistErrors = {...formInstance.errors.value};
      await new Promise(res => setTimeout(res, 10));
      secondErrors = {...formInstance.errors.value};
      return {object, fistErrors, secondErrors};
    };
    // tslint:enable:no-any


    formDefinition = {
      position: {
        type: 'object',
        caption: 'Position',
        required: true,
        properties: {
          posX: {caption: null, type: 'integer', required: true},
          posY: {caption: null, type: 'integer', required: true},
        },
        validate: (value, item) => {
          object = item;
          return new Promise<string | null>(res => res(value?.posX === value?.posY ? 'my object error' : null));
        },
      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(await getValidationResults({position: null})).toEqual({
      object: {
        position: {
          posX: null,
          posY: null,
        },
      },
      fistErrors: {
        '.position.posX': 'this is required',
        '.position.posY': 'this is required',
      },
      secondErrors: {
        '.position': 'my object error',
        '.position.posX': 'this is required',
        '.position.posY': 'this is required',
      },
    });

    expect(await getValidationResults({position: {posX: 1}})).toEqual({
      object: {
        position: {posX: 1, posY: null},
      },
      fistErrors: {
        '.position.posY': 'this is required',
      },
      secondErrors: {
        '.position.posY': 'this is required',
      },
    });

    expect(await getValidationResults({position: {posX: 1, posY: 1}})).toEqual({
      object: {
        position: {posX: 1, posY: 1},
      },
      fistErrors: {},
      secondErrors: {
        '.position': 'my object error',
      },
    });


  });


});
