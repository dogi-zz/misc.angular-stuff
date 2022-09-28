import {beforeEach, describe, expect, it} from '@jest/globals';
import {FormDefinition, ValidationTexts} from '../generic-form/generic-form.data';
import {GenericFormState, getCheckedFormModelPromise, getValidationResult} from '../generic-form/generic-form.functions';


describe('generic-form', () => {

  beforeEach(async () => {

  });


  it('Check Some Data', async () => {

    const formDefinition: FormDefinition = {
      name: {caption: null, type: 'text'},
      age: {caption: null, type: 'number'},
    };

    expect((await getCheckedFormModelPromise(formDefinition, {})).model).toEqual({name: null, age: null});
    expect((await getCheckedFormModelPromise(formDefinition, {name: 'foo', age: 32})).model).toEqual({name: 'foo', age: 32});
    expect((await getCheckedFormModelPromise(formDefinition, {name: 'foo', age: 32, bar: true})).model).toEqual({name: 'foo', age: 32});

  });

  it('Validate Some Data', async () => {
    let formDefinition: FormDefinition;

    // Required

    formDefinition = {
      name_1: {caption: null, type: 'text'},
      name_2: {caption: null, type: 'text', required: true},
      age_1: {caption: null, type: 'number'},
      age_2: {caption: null, type: 'number', required: true},
    };

    expect(await getValidationResult('', formDefinition, {})).toEqual({
      '.name_2': ValidationTexts.required,
      '.age_2': ValidationTexts.required,
    });
    expect(await getValidationResult('', formDefinition, {name_1: 123, name_2: 'test'})).toEqual({
      '.name_1': ValidationTexts.typeError,
      '.age_2': ValidationTexts.required,
    });
    expect(await getValidationResult('', formDefinition, {age_1: 123, age_2: 'test'})).toEqual({
      '.name_2': ValidationTexts.required,
      '.age_2': ValidationTexts.typeError,
    });

  });


  it('Check and Validate Boolean', async () => {
    let formDefinition: FormDefinition;

    formDefinition = {
      name: {caption: null, type: 'text'},
      bool1: {caption: null, type: 'boolean', required: true},
      bool2: {caption: null, type: 'boolean', required: false},
    };

    expect((await getCheckedFormModelPromise(formDefinition, {})).model).toEqual({name: null, bool1: null, bool2: null});
    expect(await getValidationResult('', formDefinition, {})).toEqual({
      '.bool1': ValidationTexts.required,
    });


    expect((await getCheckedFormModelPromise(formDefinition, {bool1: true, bool2: true})).model).toEqual({name: null, bool1: true, bool2: true});
    expect(await getValidationResult('', formDefinition, {bool1: true, bool2: true})).toEqual({});

    expect((await getCheckedFormModelPromise(formDefinition, {bool1: false, bool2: false})).model).toEqual({name: null, bool1: false, bool2: false});
    expect(await getValidationResult('', formDefinition, {bool1: false, bool2: false})).toEqual({});

  });


  it('Check and Validate Number Min Max', async () => {
    let formDefinition: FormDefinition;

    // Numbers - Min - Max

    formDefinition = {
      float_1: {caption: null, type: 'number', min: 10, max: 20},
      float_2: {caption: null, type: 'number', min: 11, max: 21, required: true},
      int_1: {caption: null, type: 'integer', min: 12, max: 22},
      int_2: {caption: null, type: 'integer', min: 13, max: 23, required: true},
    };

    expect(await getValidationResult('', formDefinition, {})).toEqual({
      '.float_2': ValidationTexts.required,
      '.int_2': ValidationTexts.required,
    });

    expect(await getValidationResult('', formDefinition, {
      float_1: 9,
      float_2: 9,
      int_1: 9,
      int_2: 9,
    })).toEqual({
      '.float_1': ValidationTexts.numberMin.replace('${}', '10'),
      '.float_2': ValidationTexts.numberMin.replace('${}', '11'),
      '.int_1': ValidationTexts.numberMin.replace('${}', '12'),
      '.int_2': ValidationTexts.numberMin.replace('${}', '13'),
    });

    expect(await getValidationResult('', formDefinition, {
      float_1: 99,
      float_2: 99,
      int_1: 99,
      int_2: 99,
    })).toEqual({
      '.float_1': ValidationTexts.numberMax.replace('${}', '20'),
      '.float_2': ValidationTexts.numberMax.replace('${}', '21'),
      '.int_1': ValidationTexts.numberMax.replace('${}', '22'),
      '.int_2': ValidationTexts.numberMax.replace('${}', '23'),
    });

  });


  it('Check and Validate Objects', async () => {
    let formDefinition: FormDefinition;

    formDefinition = {
      name: {caption: null, type: 'text'},
      position: {
        type: 'object',
        caption: 'Position',
        required: true,
        properties: {
          posX: {caption: null, type: 'integer', required: true},
          posY: {caption: null, type: 'integer', required: true},
        },
      },
    };

    expect((await getCheckedFormModelPromise(formDefinition, {})).model).toEqual({name: null, position: {posX: null, posY: null}});
    expect((await getCheckedFormModelPromise(formDefinition, {name: 123, position: {posX: 12, posY: '13'}})).model).toEqual({name: null, position: {posX: 12, posY: null}});
    expect((await getCheckedFormModelPromise(formDefinition, {name: 'foo', position: []})).model).toEqual({name: 'foo', position: {posX: null, posY: null}});

    expect(await getValidationResult('', formDefinition, {})).toEqual({
      '.position': ValidationTexts.required,
    });

    expect(await getValidationResult('', formDefinition, {
      position: [],
    })).toEqual({
      '.position': ValidationTexts.typeError,
    });

    expect(await getValidationResult('', formDefinition, {
      position: '',
    })).toEqual({
      '.position': ValidationTexts.typeError,
    });

    expect(await getValidationResult('', formDefinition, {
      position: {},
    })).toEqual({
      '.position.posX': ValidationTexts.required,
      '.position.posY': ValidationTexts.required,
    });

    expect(await getValidationResult('', formDefinition, {
      position: {posX: 12, posY: 23},
    })).toEqual({});


    formDefinition = {
      name: {caption: null, type: 'text'},
      position: {
        type: 'object',
        caption: 'Position',
        required: false,
        properties: {
          posX: {caption: null, type: 'integer', required: true},
          posY: {caption: null, type: 'integer', required: true},
        },
      },
    };

    expect((await getCheckedFormModelPromise(formDefinition, {name: [], position: []})).model).toEqual({name: null, position: null});

    expect(await getValidationResult('', formDefinition, {})).toEqual({});

    expect(await getValidationResult('', formDefinition, {
      position: [],
    })).toEqual({
      '.position': ValidationTexts.typeError,
    });

    expect(await getValidationResult('', formDefinition, {
      position: null,
    })).toEqual({});

    expect(await getValidationResult('', formDefinition, {
      position: {},
    })).toEqual({
      '.position.posX': ValidationTexts.required,
      '.position.posY': ValidationTexts.required,
    });

    expect(await getValidationResult('', formDefinition, {
      position: {posX: 12, posY: 23},
    })).toEqual({});


    // Inline

    formDefinition = {
      name: {caption: null, type: 'text'},
      position: {
        type: 'object',
        inline: true,
        properties: {
          posX: {caption: null, type: 'integer', required: true},
          posY: {caption: null, type: 'integer', required: true},
        },
      },
    };

    expect((await getCheckedFormModelPromise(formDefinition, {name: [], position: []})).model).toEqual({name: null, position: {posX: null, posY: null}});

  });


  it('Check and Validate Selection', async () => {
    let formDefinition: FormDefinition;
    let formState: GenericFormState;

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
      sel2: {
        type: 'selection',
        caption: 'SelectValue',
        required: false,
        options: [
          {label: 'var1', value: 123},
          {label: 'var1', value: 'test'},
          {label: 'var1', value: false},
        ],
      },
    };

    formState = {
      unknownValues: [],
      selectionOptions: [
        {path: '.sel1', observable: null, options: (formDefinition as any).sel1.options},
        {path: '.sel2', observable: null, options: (formDefinition as any).sel2.options},
      ],
    };

    expect((await getCheckedFormModelPromise(formDefinition, {})).model).toEqual({name: null, sel1: null, sel2: null});
    expect((await getCheckedFormModelPromise(formDefinition, {sel1: true})).model).toEqual({name: null, sel1: null, sel2: null});
    expect((await getCheckedFormModelPromise(formDefinition, {sel1: false})).model).toEqual({name: null, sel1: false, sel2: null});
    expect((await getCheckedFormModelPromise(formDefinition, {sel1: 'false'})).model).toEqual({name: null, sel1: null, sel2: null});
    expect((await getCheckedFormModelPromise(formDefinition, {sel1: 'test'})).model).toEqual({name: null, sel1: 'test', sel2: null});

    expect(await getValidationResult('', formDefinition, {}, formState)).toEqual({
      '.sel1': ValidationTexts.required,
    });

    expect(await getValidationResult('', formDefinition, {sel1: true}, formState)).toEqual({
      '.sel1': ValidationTexts.optionError,
    });
    expect(await getValidationResult('', formDefinition, {sel1: false}, formState)).toEqual({});
    expect(await getValidationResult('', formDefinition, {sel1: null}, formState)).toEqual({
      '.sel1': ValidationTexts.required,
    });
    expect(await getValidationResult('', formDefinition, {sel1: 123}, formState)).toEqual({});
    expect(await getValidationResult('', formDefinition, {sel1: 124}, formState)).toEqual({
      '.sel1': ValidationTexts.optionError,
    });

    expect(await getValidationResult('', formDefinition, {sel2: true}, formState)).toEqual({
      '.sel1': ValidationTexts.required,
      '.sel2': ValidationTexts.optionError,
    });


  });


  it('Check and Validate Array', async () => {
    let formDefinition: FormDefinition;

    formDefinition = {
      name: {caption: null, type: 'text'},
      array1: {
        type: 'array',
        caption: 'String Array',
        elements: {
          type: 'text',
          required: true,
        },
      },
      array2: {
        type: 'array',
        caption: 'Object Array',
        required: true,
        elements: {
          type: 'object',
          required: true,
          properties: {
            posX: {caption: null, type: 'integer', required: true},
            posY: {caption: null, type: 'integer', required: true},
          },
        },
      },

    };

    expect((await getCheckedFormModelPromise(formDefinition, {})).model).toEqual({name: null, array1: null, array2: []});
    expect((await getCheckedFormModelPromise(formDefinition, {array1: true})).model).toEqual({name: null, array1: null, array2: []});
    expect((await getCheckedFormModelPromise(formDefinition, {array1: []})).model).toEqual({name: null, array1: [], array2: []});
    expect((await getCheckedFormModelPromise(formDefinition, {array1: [123]})).model).toEqual({name: null, array1: [null], array2: []});
    expect((await getCheckedFormModelPromise(formDefinition, {array1: [123, '123']})).model).toEqual({name: null, array1: [null, '123'], array2: []});

    expect((await getCheckedFormModelPromise(formDefinition, {array1: ['123'], array2: ['123']})).model).toEqual({name: null, array1: ['123'], array2: [{posX: null, posY: null}]});
    expect((await getCheckedFormModelPromise(formDefinition, {array1: ['123'], array2: [{posX: 2, posY: 3}]})).model).toEqual({name: null, array1: ['123'], array2: [{posX: 2, posY: 3}]});


    expect(await getValidationResult('', formDefinition, {})).toEqual({
      '.array2': ValidationTexts.required,
    });

    expect(await getValidationResult('', formDefinition, {array1: 123})).toEqual({
      '.array1': ValidationTexts.typeError,
      '.array2': ValidationTexts.required,
    });
    expect(await getValidationResult('', formDefinition, {array1: [123]})).toEqual({
      '.array1.0': ValidationTexts.typeError,
      '.array2': ValidationTexts.required,
    });
    expect(await getValidationResult('', formDefinition, {array1: ['123']})).toEqual({
      '.array2': ValidationTexts.required,
    });

    expect(await getValidationResult('', formDefinition, {array1: ['123'], array2: [123]})).toEqual({
      '.array2.0': ValidationTexts.typeError,
    });
    expect(await getValidationResult('', formDefinition, {array1: ['123'], array2: [{posX: 1, posY: ''}]})).toEqual({
      '.array2.0.posY': ValidationTexts.typeError,
    });
    expect(await getValidationResult('', formDefinition, {array1: ['123'], array2: [{posX: 1, posY: 2}]})).toEqual({});


    formDefinition = {
      array1: {
        type: 'array',
        caption: 'String Array',
        elements: {
          type: 'text',
          required: true,
        },
        minLength: 2,
        maxLength: 4,
      },
    };

    expect(await getValidationResult('', formDefinition, {})).toEqual({});
    expect(await getValidationResult('', formDefinition, {array1: null})).toEqual({});
    expect(await getValidationResult('', formDefinition, {array1: ['1']})).toEqual({
      '.array1': ValidationTexts.arrayMin.replace('${}', '2'),
    });
    expect(await getValidationResult('', formDefinition, {array1: ['1', '2']})).toEqual({});
    expect(await getValidationResult('', formDefinition, {array1: ['1', '2', '3']})).toEqual({});
    expect(await getValidationResult('', formDefinition, {array1: ['1', '2', '3', '4']})).toEqual({});
    expect(await getValidationResult('', formDefinition, {array1: ['1', '2', '3', '4', '5']})).toEqual({
      '.array1': ValidationTexts.arrayMax.replace('${}', '4'),
    });


  });


  it('Check Object With Unknown Path', async () => {
    let formDefinition: FormDefinition;

    formDefinition = {
      name: {caption: null, type: 'text'},
      position: {
        type: 'object',
        caption: 'Position',
        required: true,
        properties: {
          posX: {caption: null, type: 'integer', required: true},
          posY: {caption: null, type: 'integer', required: true},
        },
      },
    };

    let result;

    result = await getCheckedFormModelPromise(formDefinition, {
      name: null,
      position: null,
      foo: 'bar',
    });

    expect(result.model).toEqual({
      name: null,
      position: {posX: null, posY: null},
    });
    expect(result.state.unknownValues).toEqual([{path: '.foo', value: 'bar'}]);

    result = await getCheckedFormModelPromise(formDefinition, {
      name: null,
      position: {posX: 1, posZ: 2},
    });
    expect(result.model).toEqual({
      name: null,
      position: {posX: 1, posY: null},
    });
    expect(result.state.unknownValues).toEqual([{path: '.position.posZ', value: 2}]);
  });

});
