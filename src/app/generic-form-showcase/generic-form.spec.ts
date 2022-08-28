import {FormDefinition, ValidationTexts} from '../generic-form/generic-form.data';
import {getCheckedFormModel, getValidationResult} from '../generic-form/generic-form.functions';

describe('generic-form', () => {

  beforeEach(async () => {

  });


  it('Check Some Data', async () => {

    const FormDefinition: FormDefinition = {
      name: {caption: null, type: 'text'},
      age: {caption: null, type: 'number'},
    };

    expect(await getCheckedFormModel(FormDefinition, {}, false)).toEqual({name: null, age: null});
    expect(await getCheckedFormModel(FormDefinition, {name: 'foo', age: 32}, false)).toEqual({name: 'foo', age: 32});
    expect(await getCheckedFormModel(FormDefinition, {name: 'foo', age: 32, bar: true}, false)).toEqual({name: 'foo', age: 32});

  });

  it('Validate Some Data', async () => {
    let FormDefinition: FormDefinition;

    // Required

    FormDefinition = {
      name_1: {caption: null, type: 'text'},
      name_2: {caption: null, type: 'text', required: true},
      age_1: {caption: null, type: 'number'},
      age_2: {caption: null, type: 'number', required: true},
    };

    expect(await getValidationResult(FormDefinition, {})).toEqual({
      name_2: ValidationTexts.required,
      age_2: ValidationTexts.required,
    });
    expect(await getValidationResult(FormDefinition, {
      name_1: 123,
      name_2: 'test',
    })).toEqual({
      name_1: ValidationTexts.typeError,
      age_2: ValidationTexts.required,
    });
    expect(await getValidationResult(FormDefinition, {
      age_1: 123,
      age_2: 'test',
    })).toEqual({
      name_2: ValidationTexts.required,
      age_2: ValidationTexts.typeError,
    });

    // Numbers - Min - Max

    FormDefinition = {
      float_1: {caption: null, type: 'number', min: 10, max: 20},
      float_2: {caption: null, type: 'number', min: 11, max: 21, required: true},
      int_1: {caption: null, type: 'integer', min: 12, max: 22},
      int_2: {caption: null, type: 'integer', min: 13, max: 23, required: true},
    };

    expect(await getValidationResult(FormDefinition, {})).toEqual({
      float_2: ValidationTexts.required,
      int_2: ValidationTexts.required,
    });

    expect(await getValidationResult(FormDefinition, {
      float_1: 9,
      float_2: 9,
      int_1: 9,
      int_2: 9,
    })).toEqual({
      float_1: ValidationTexts.numberMin.replace('${}', '10'),
      float_2: ValidationTexts.numberMin.replace('${}', '11'),
      int_1: ValidationTexts.numberMin.replace('${}', '12'),
      int_2: ValidationTexts.numberMin.replace('${}', '13'),
    });

    expect(await getValidationResult(FormDefinition, {
      float_1: 99,
      float_2: 99,
      int_1: 99,
      int_2: 99,
    })).toEqual({
      float_1: ValidationTexts.numberMax.replace('${}', '20'),
      float_2: ValidationTexts.numberMax.replace('${}', '21'),
      int_1: ValidationTexts.numberMax.replace('${}', '22'),
      int_2: ValidationTexts.numberMax.replace('${}', '23'),
    });

  });


  it('Check and Validate Objects', async () => {
    let FormDefinition: FormDefinition;

    FormDefinition = {
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

    expect(await getCheckedFormModel(FormDefinition, {}, false)).toEqual({name: null, position: {posX: null, posY: null}});
    expect(await getCheckedFormModel(FormDefinition, {name: 123, position: {posX: 12, posY: '13'}}, false)).toEqual({name: null, position: {posX: 12, posY: null}});
    expect(await getCheckedFormModel(FormDefinition, {name: 'foo', position: []}, false)).toEqual({name: 'foo', position: {posX: null, posY: null}});

    expect(await getValidationResult(FormDefinition, {})).toEqual({
      position: ValidationTexts.required,
    });

    expect(await getValidationResult(FormDefinition, {
      position: [],
    })).toEqual({
      position: ValidationTexts.typeError,
    });

    expect(await getValidationResult(FormDefinition, {
      position: '',
    })).toEqual({
      position: ValidationTexts.typeError,
    });

    expect(await getValidationResult(FormDefinition, {
      position: {},
    })).toEqual({
      position: {type: 'object', value: {posX: ValidationTexts.required, posY: ValidationTexts.required}},
    });

    expect(await getValidationResult(FormDefinition, {
      position: {posX: 12, posY: 23},
    })).toEqual({});


    // expect(await getCheckedFormModel(FormDefinition, {name: 'foo', age: 32}, false)).toEqual({name: 'foo', age: 32});
    // expect(await getCheckedFormModel(FormDefinition, {name: 'foo', age: 32, bar: true}, false)).toEqual({name: 'foo', age: 32});

    FormDefinition = {
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

    expect(await getCheckedFormModel(FormDefinition, {name: [], position: []}, false)).toEqual({name: null, position: null});

    expect(await getValidationResult(FormDefinition, {})).toEqual({});

    expect(await getValidationResult(FormDefinition, {
      position: [],
    })).toEqual({
      position: ValidationTexts.typeError,
    });

    expect(await getValidationResult(FormDefinition, {
      position: null,
    })).toEqual({});

    expect(await getValidationResult(FormDefinition, {
      position: {},
    })).toEqual({
      position: {type: 'object', value: {posX: ValidationTexts.required, posY: ValidationTexts.required}},
    });

    expect(await getValidationResult(FormDefinition, {
      position: {posX: 12, posY: 23},
    })).toEqual({});


    // Inline

    FormDefinition = {
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

    expect(await getCheckedFormModel(FormDefinition, {name: [], position: []}, false)).toEqual({name: null, position: {posX: null, posY: null}});


  });

  it('Check and Validate Selection', async () => {
    let FormDefinition: FormDefinition;

    FormDefinition = {
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

    expect(await getCheckedFormModel(FormDefinition, {}, false)).toEqual({name: null, sel1: null, sel2: null});
    expect(await getCheckedFormModel(FormDefinition, {sel1: true}, false)).toEqual({name: null, sel1: null, sel2: null});
    expect(await getCheckedFormModel(FormDefinition, {sel1: false}, false)).toEqual({name: null, sel1: false, sel2: null});
    expect(await getCheckedFormModel(FormDefinition, {sel1: 'false'}, false)).toEqual({name: null, sel1: null, sel2: null});
    expect(await getCheckedFormModel(FormDefinition, {sel1: 'test'}, false)).toEqual({name: null, sel1: 'test', sel2: null});

    expect(await getValidationResult(FormDefinition, {})).toEqual({sel1: ValidationTexts.required});

    expect(await getValidationResult(FormDefinition, {sel1: true})).toEqual({sel1: ValidationTexts.optionError});
    expect(await getValidationResult(FormDefinition, {sel1: false})).toEqual({});
    expect(await getValidationResult(FormDefinition, {sel1: null})).toEqual({sel1: ValidationTexts.required});
    expect(await getValidationResult(FormDefinition, {sel1: 123})).toEqual({});
    expect(await getValidationResult(FormDefinition, {sel1: 124})).toEqual({sel1: ValidationTexts.optionError});

    expect(await getValidationResult(FormDefinition, {sel2: true})).toEqual({sel1: ValidationTexts.required, sel2: ValidationTexts.optionError});

  });


  it('Check and Validate Boolean', async () => {
    let FormDefinition: FormDefinition;

    FormDefinition = {
      name: {caption: null, type: 'text'},
      bool1: {caption: null, type: 'boolean', required: true},
      bool2: {caption: null, type: 'boolean', required: false},
    };

    expect(await getCheckedFormModel(FormDefinition, {}, false)).toEqual({name: null, bool1: null, bool2: null});
    expect(await getValidationResult(FormDefinition, {})).toEqual({bool1: ValidationTexts.required});


    expect(await getCheckedFormModel(FormDefinition, {bool1: true, bool2: true}, false)).toEqual({name: null, bool1: true, bool2: true});
    expect(await getValidationResult(FormDefinition, {bool1: true, bool2: true})).toEqual({});

    expect(await getCheckedFormModel(FormDefinition, {bool1: false, bool2: false}, false)).toEqual({name: null, bool1: false, bool2: false});
    expect(await getValidationResult(FormDefinition, {bool1: false, bool2: false})).toEqual({});

  });


  it('Check and Validate Array', async () => {
    let FormDefinition: FormDefinition;

    FormDefinition = {
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

    expect(await getCheckedFormModel(FormDefinition, {}, false)).toEqual({name: null, array1: null, array2: []});
    expect(await getCheckedFormModel(FormDefinition, {array1: true}, false)).toEqual({name: null, array1: null, array2: []});
    expect(await getCheckedFormModel(FormDefinition, {array1: []}, false)).toEqual({name: null, array1: [], array2: []});
    expect(await getCheckedFormModel(FormDefinition, {array1: [123]}, false)).toEqual({name: null, array1: [null], array2: []});
    expect(await getCheckedFormModel(FormDefinition, {array1: [123, '123']}, false)).toEqual({name: null, array1: [null, '123'], array2: []});

    expect(await getCheckedFormModel(FormDefinition, {array1: ['123'], array2: ['123']}, false)).toEqual({name: null, array1: ['123'], array2: [{posX: null, posY: null}]});
    expect(await getCheckedFormModel(FormDefinition, {array1: ['123'], array2: [{posX: 2, posY: 3}]}, false)).toEqual({name: null, array1: ['123'], array2: [{posX: 2, posY: 3}]});


    expect(await getValidationResult(FormDefinition, {})).toEqual({array2: ValidationTexts.required});

    expect(await getValidationResult(FormDefinition, {array1: 123})).toEqual({array1: ValidationTexts.typeError, array2: ValidationTexts.required});
    expect(await getValidationResult(FormDefinition, {array1: [123]})).toEqual({array1: {type: 'array', value: [ValidationTexts.typeError]}, array2: ValidationTexts.required});
    expect(await getValidationResult(FormDefinition, {array1: ['123']})).toEqual({array2: ValidationTexts.required});

    expect(await getValidationResult(FormDefinition, {array1: ['123'], array2: [123]})).toEqual({array2: {type: 'array', value: [ValidationTexts.typeError]}});
    expect(await getValidationResult(FormDefinition, {array1: ['123'], array2: [{posX: 1, posY: ''}]})).toEqual({array2: {type: 'array', value: [{type: 'object', value: {posY: ValidationTexts.typeError}}]}});
    expect(await getValidationResult(FormDefinition, {array1: ['123'], array2: [{posX: 1, posY: 2}]})).toEqual({});


    FormDefinition = {
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

    expect(await getValidationResult(FormDefinition, {})).toEqual({});
    expect(await getValidationResult(FormDefinition, {array1: null})).toEqual({});
    expect(await getValidationResult(FormDefinition, {array1: ['1']})).toEqual({array1:{type: 'array', error: ValidationTexts.arrayMin.replace('${}', '2'), value: [null]}});
    expect(await getValidationResult(FormDefinition, {array1: ['1', '2']})).toEqual({});
    expect(await getValidationResult(FormDefinition, {array1: ['1', '2', '3']})).toEqual({});
    expect(await getValidationResult(FormDefinition, {array1: ['1', '2', '3', '4']})).toEqual({});
    expect(await getValidationResult(FormDefinition, {array1: ['1', '2', '3', '4', '5']})).toEqual({array1: {type: 'array', error: ValidationTexts.arrayMax.replace('${}', '4'), value: [null, null, null, null, null]}});


  });


});
