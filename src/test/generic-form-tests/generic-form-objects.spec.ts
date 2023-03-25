import {beforeEach, describe, expect, it} from '@jest/globals';
import {BehaviorSubject} from 'rxjs';
import {GenericFormInstance} from '../../app/generic-form/generic-form-instance';
import {FormDefElementSelectOption, FormDefinition, ValidationTexts} from '../../app/generic-form/generic-form.data';


describe('generic-form-objects', () => {

  beforeEach(async () => {

  });


  it('Check and Validate Objects', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const getValidationResult = (model: any) => {
      formInstance.setModel(model);
      return formInstance.errors.value;
    };
    const getOutputValue = (model: any) => {
      formInstance.setModel(model);
      return formInstance.outputModel.value;
    };

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
    formInstance = new GenericFormInstance(formDefinition);

    // expect(getOutputValue({})).toEqual({name: null, position: {posX: null, posY: null}});
    expect(getOutputValue({name: 123, position: {posX: 12, posY: '13'}})).toEqual({name: null, position: {posX: 12, posY: null}});
    expect(getOutputValue({name: 'foo', position: []})).toEqual({name: 'foo', position: {posX: null, posY: null}});

    expect(getValidationResult({})).toEqual({
      '.position': ValidationTexts.required,
    });

    expect(getValidationResult({
      position: [],
    })).toEqual({
      '.position': ValidationTexts.typeError,
    });

    expect(getValidationResult({
      position: '',
    })).toEqual({
      '.position': ValidationTexts.typeError,
    });

    expect(getValidationResult({
      position: {},
    })).toEqual({
      '.position.posX': ValidationTexts.required,
      '.position.posY': ValidationTexts.required,
    });

    expect(getValidationResult({
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
    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({name: [], position: []})).toEqual({name: null, position: null});

    expect(getValidationResult({})).toEqual({});

    expect(getValidationResult({
      position: [],
    })).toEqual({
      '.position': ValidationTexts.typeError,
    });

    expect(getValidationResult({
      position: null,
    })).toEqual({});

    expect(getValidationResult({
      position: {},
    })).toEqual({
      '.position.posX': ValidationTexts.required,
      '.position.posY': ValidationTexts.required,
    });

    expect(getValidationResult({
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
    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({name: [], position: []})).toEqual({name: null, position: {posX: null, posY: null}});
    expect(getOutputValue({name: [], position: {}})).toEqual({name: null, position: {posX: null, posY: null}});

  });


  it('Set Value on  Objects', async () => {
    let formInstance: GenericFormInstance;
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
    formInstance = new GenericFormInstance(formDefinition);

    formInstance.setModel({});

    expect(formInstance.outputModel.value).toEqual({name: null, position: {posX: null, posY: null}});
    expect(formInstance.errors.value['.position']).toEqual(ValidationTexts.required);

    formInstance.setValue('.position', {});
    expect(formInstance.outputModel.value).toEqual({name: null, position: {posX: null, posY: null}});
    expect(formInstance.errors.value['.position']).toEqual(undefined);
    expect(formInstance.errors.value['.position.posX']).toEqual(ValidationTexts.required);

    formInstance.setValue('.position.posX', 'foo');
    expect(formInstance.outputModel.value).toEqual({name: null, position: {posX: null, posY: null}});
    expect(formInstance.errors.value['.position']).toEqual(undefined);
    expect(formInstance.errors.value['.position.posX']).toEqual(ValidationTexts.typeError);

    formInstance.setValue('.position.posX', 0);
    expect(formInstance.outputModel.value).toEqual({name: null, position: {posX: 0, posY: null}});
    expect(formInstance.errors.value['.position']).toEqual(undefined);
    expect(formInstance.errors.value['.position.posX']).toEqual(undefined);

  });


  it('Set Value on Empty inline Object', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


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
    formInstance = new GenericFormInstance(formDefinition);

    formInstance.setModel({});

    expect(formInstance.outputModel.value).toEqual({name: null, position: {posX: null, posY: null}});
    expect(formInstance.errors.value['.position']).toEqual(undefined);
    expect(formInstance.errors.value['.position.posX']).toEqual(ValidationTexts.required);
    expect(formInstance.errors.value['.position.posY']).toEqual(ValidationTexts.required);

    formInstance.setValue('.position.posX', 0);
    expect(formInstance.outputModel.value).toEqual({name: null, position: {posX: 0, posY: null}});
    expect(formInstance.errors.value['.position']).toEqual(undefined);
    expect(formInstance.errors.value['.position.posX']).toEqual(undefined);
    expect(formInstance.errors.value['.position.posY']).toEqual(ValidationTexts.required);

  });


  it('Check and Validate Array', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const getValidationResult = (model: any) => {
      formInstance.setModel(model);
      return formInstance.errors.value;
    };
    const getOutputValue = (model: any) => {
      formInstance.setModel(model);
      return formInstance.outputModel.value;
    };

    formDefinition = {
      name: {caption: null, type: 'text'},
      array1: {
        type: 'array',
        caption: 'String Array',
        elements: {
          type: 'text',
        },
      },
      array2: {
        type: 'array',
        caption: 'Object Array',
        required: true,
        elements: {
          type: 'object',
          properties: {
            posX: {caption: null, type: 'integer', required: true},
            posY: {caption: null, type: 'integer', required: true},
          },
        },
      },

    };

    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({})).toEqual({name: null, array1: null, array2: []});
    expect(getOutputValue({array1: true})).toEqual({name: null, array1: null, array2: []});
    expect(getOutputValue({array1: []})).toEqual({name: null, array1: [], array2: []});
    expect(getOutputValue({array1: [123]})).toEqual({name: null, array1: [null], array2: []});
    expect(getOutputValue({array1: [123, '123']})).toEqual({name: null, array1: [null, '123'], array2: []});

    expect(getOutputValue({array1: ['123'], array2: ['123']})).toEqual({name: null, array1: ['123'], array2: [null]});
    expect(getOutputValue({array1: ['123'], array2: [{}]})).toEqual({name: null, array1: ['123'], array2: [{posX: null, posY: null}]});
    expect(getOutputValue({array1: ['123'], array2: [{posX: 2, posY: 3}]})).toEqual({name: null, array1: ['123'], array2: [{posX: 2, posY: 3}]});


    expect(getValidationResult({})).toEqual({});

    expect(getValidationResult({array1: 123})).toEqual({
      '.array1': ValidationTexts.typeError,
    });
    expect(getValidationResult({array1: [123]})).toEqual({
      '.array1.0': ValidationTexts.typeError,
    });
    expect(getValidationResult({array1: ['123']})).toEqual({});

    expect(getValidationResult({array1: ['123'], array2: [123]})).toEqual({
      '.array2.0': ValidationTexts.typeError,
    });
    expect(getValidationResult({array1: ['123'], array2: [{posX: 1, posY: ''}]})).toEqual({
      '.array2.0.posY': ValidationTexts.typeError,
    });
    expect(getValidationResult({array1: ['123'], array2: [{posX: 1, posY: 2}]})).toEqual({});


    formDefinition = {
      array1: {
        type: 'array',
        caption: 'String Array',
        elements: {
          type: 'text',
        },
        minLength: 2,
        maxLength: 4,
      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(getValidationResult({})).toEqual({});
    expect(getValidationResult({array1: null})).toEqual({});
    expect(getValidationResult({array1: ['1']})).toEqual({
      '.array1': ValidationTexts.arrayMin.replace('${}', '2'),
    });
    expect(getValidationResult({array1: ['1', '2']})).toEqual({});
    expect(getValidationResult({array1: ['1', '2', '3']})).toEqual({});
    expect(getValidationResult({array1: ['1', '2', '3', '4']})).toEqual({});
    expect(getValidationResult({array1: ['1', '2', '3', '4', '5']})).toEqual({
      '.array1': ValidationTexts.arrayMax.replace('${}', '4'),
    });


  });


  it('Set Value on Array', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      name: {caption: null, type: 'text'},
      array1: {
        type: 'array',
        caption: 'String Array',
        elements: {
          type: 'text',
        },
        minLength: 2,
        maxLength: 4,
      },
      array2: {
        type: 'array',
        caption: 'Object Array',
        required: true,
        elements: {
          type: 'object',
          properties: {
            posX: {caption: null, type: 'integer', required: true},
            posY: {caption: null, type: 'integer', required: true},
          },
        },
      },

    };

    formInstance = new GenericFormInstance(formDefinition);

    formInstance.setModel({});
    expect(formInstance.outputModel.value).toEqual({name: null, array1: null, array2: []});
    expect(formInstance.errors.value['.array1']).toEqual(undefined);
    expect(formInstance.errors.value['.array2']).toEqual(undefined);

    formInstance.setValue('.array1', []);

    expect(formInstance.outputModel.value).toEqual({name: null, array1: [], array2: []});
    expect(formInstance.errors.value['.array1']).toEqual(ValidationTexts.arrayMin.replace('${}', '2'));
    expect(formInstance.errors.value['.array2']).toEqual(undefined);

    formInstance.addToArray('.array1', 'foo');
    formInstance.addToArray('.array1', 123);

    expect(formInstance.outputModel.value).toEqual({name: null, array1: ['foo', null], array2: []});
    expect(formInstance.errors.value['.array1']).toEqual(undefined);
    expect(formInstance.errors.value['.array1.0']).toEqual(undefined);
    expect(formInstance.errors.value['.array1.1']).toEqual(ValidationTexts.typeError);
    expect(formInstance.errors.value['.array2']).toEqual(undefined);

    formInstance.setValue('.array1.1', '123');

    expect(formInstance.outputModel.value).toEqual({name: null, array1: ['foo', '123'], array2: []});
    expect(formInstance.errors.value['.array1']).toEqual(undefined);
    expect(formInstance.errors.value['.array1.0']).toEqual(undefined);
    expect(formInstance.errors.value['.array1.1']).toEqual(undefined);
    expect(formInstance.errors.value['.array2']).toEqual(undefined);


    formInstance.setValue('.array2', []);

    expect(formInstance.outputModel.value).toEqual({name: null, array1: ['foo', '123'], array2: []});
    expect(formInstance.errors.value['.array2']).toEqual(undefined);

    formInstance.addToArray('.array2', 'foo');
    expect(formInstance.outputModel.value).toEqual({name: null, array1: ['foo', '123'], array2: [null]});
    expect(formInstance.errors.value['.array2.0']).toEqual(ValidationTexts.typeError);

    formInstance.setValue('.array2.0', []);
    expect(formInstance.outputModel.value).toEqual({name: null, array1: ['foo', '123'], array2: [null]});
    expect(formInstance.errors.value['.array2.0']).toEqual(ValidationTexts.typeError);

    formInstance.setValue('.array2.0', {});
    expect(formInstance.outputModel.value).toEqual({name: null, array1: ['foo', '123'], array2: [{posX: null, posY: null}]});
    expect(formInstance.errors.value['.array2.0']).toEqual(undefined);
    expect(formInstance.errors.value['.array2.0.posX']).toEqual(ValidationTexts.required);

    formInstance.setValue('.array2.0.posX', {});
    expect(formInstance.outputModel.value).toEqual({name: null, array1: ['foo', '123'], array2: [{posX: null, posY: null}]});
    expect(formInstance.errors.value['.array2.0']).toEqual(undefined);
    expect(formInstance.errors.value['.array2.0.posX']).toEqual(ValidationTexts.typeError);
  });


  it('Check and Validate Array with Subform', async () => {

    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const getValidationResult = (model: any) => {
      formInstance.setModel(model);
      return formInstance.errors.value;
    };
    const getOutputValue = (model: any) => {
      formInstance.setModel(model);
      return formInstance.outputModel.value;
    };

    formDefinition = {
      array1: {
        type: 'array',
        caption: 'Object Array',
        required: true,
        elements: {
          type: 'object',
          properties: {
            sub1: {
              type: 'subform',
              inline: true,
              content: {
                posX: {caption: null, type: 'integer', required: true},
                posY: {caption: null, type: 'integer', required: true},
              },
            },
            sub2: {
              type: 'subform',
              inline: true,
              content: {
                cordX: {caption: null, type: 'integer', required: true},
                cordY: {caption: null, type: 'integer', required: true},
              },
            },
          },
        },
      },

    };

    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({})).toEqual({array1: []});
    expect(getOutputValue({array1: [null]})).toEqual({array1: [null]});
    expect(getOutputValue({array1: [123]})).toEqual({array1: [null]});
    expect(getOutputValue({array1: [[]]})).toEqual({array1: [null]});
    expect(getOutputValue({array1: [{}]})).toEqual({array1: [{cordX: null, cordY: null, posX: null, posY: null}]});

    expect(getOutputValue({
      array1: [
        {cordX: 1, cordY: 2, posX: 3, posY: 4},
        {cordX: 5, cordY: 6, posX: 7, posY: 8},
      ],
    })).toEqual({
      array1: [
        {cordX: 1, cordY: 2, posX: 3, posY: 4},
        {cordX: 5, cordY: 6, posX: 7, posY: 8},
      ],
    });

    expect(getValidationResult({})).toEqual({});

    expect(getValidationResult({array1: []})).toEqual({});

    expect(getValidationResult({array1: [123]})).toEqual({
      '.array1.0': ValidationTexts.typeError,
    });

    expect(getValidationResult({array1: [{}]})).toEqual({
      '.array1.0.cordX': ValidationTexts.required,
      '.array1.0.cordY': ValidationTexts.required,
      '.array1.0.posX': ValidationTexts.required,
      '.array1.0.posY': ValidationTexts.required,
    });

    expect(getValidationResult({array1: [{cordX: 1, cordY: {}, posY: false}]})).toEqual({
      '.array1.0.cordY': ValidationTexts.typeError,
      '.array1.0.posX': ValidationTexts.required,
      '.array1.0.posY': ValidationTexts.typeError,
    });

  });

  it('Check and Validate Array with Async Options', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const getValidationResult = (model: any) => {
      formInstance.setModel(model);
      return formInstance.errors.value;
    };
    const getOutputValue = (model: any) => {
      formInstance.setModel(model);
      return formInstance.outputModel.value;
    };

    const options1 = new BehaviorSubject<FormDefElementSelectOption[]>([]);

    formDefinition = {
      array1: {
        type: 'array',
        caption: 'Object Array',
        required: true,
        elements: {
          type: 'selection',
          options: options1,
        },
      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({})).toEqual({array1: []});
    expect(getOutputValue({array1: true})).toEqual({array1: []});
    expect(getOutputValue({array1: 'foo'})).toEqual({array1: []});
    expect(getOutputValue({array1: null})).toEqual({array1: []});

    expect(getValidationResult({})).toEqual({});
    expect(getValidationResult({array1: true})).toEqual({
      '.array1': ValidationTexts.typeError,
    });
    expect(getValidationResult({array1: 'foo'})).toEqual({
      '.array1': ValidationTexts.typeError,
    });


    formInstance.setModel({array1: ['foo']});

    expect(formInstance.outputModel.value).toEqual({array1: [null]});
    expect(formInstance.errors.value).toEqual({
      '.array1.0': ValidationTexts.optionError,
    });

    options1.next([
      {label: 'var1', value: 'foo'},
      {label: 'var2', value: 'bar'},
    ]);

    expect(formInstance.outputModel.value).toEqual({array1: ['foo']});
    expect(formInstance.errors.value).toEqual({});


  });


  it('Check and Validate Array of Arrays', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const getValidationResult = (model: any) => {
      formInstance.setModel(model);
      return formInstance.errors.value;
    };
    const getOutputValue = (model: any) => {
      formInstance.setModel(model);
      return formInstance.outputModel.value;
    };

    const options1 = new BehaviorSubject<FormDefElementSelectOption[]>([]);

    formDefinition = {
      array1: {
        type: 'array',
        caption: 'Object Array',
        required: true,
        minLength: 2,
        maxLength: 4,
        elements: {
          type: 'array',
          required: true,
          minLength: 1,
          maxLength: 1,
          elements: {
            type: 'selection',
            options: options1,
          },
        },
      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({})).toEqual({array1: []});
    expect(getOutputValue({array1: true})).toEqual({array1: []});
    expect(getOutputValue({array1: 'foo'})).toEqual({array1: []});
    expect(getOutputValue({array1: null})).toEqual({array1: []});

    expect(getValidationResult({})).toEqual({
      '.array1': ValidationTexts.arrayMin.replace('${}', '2'),
    });
    expect(getValidationResult({array1: true})).toEqual({
      '.array1': ValidationTexts.typeError,
    });
    expect(getValidationResult({array1: 'foo'})).toEqual({
      '.array1': ValidationTexts.typeError,
    });
    expect(getValidationResult({array1: []})).toEqual({
      '.array1': ValidationTexts.arrayMin.replace('${}', '2'),
    });
    expect(getValidationResult({array1: [null, [], 1, 2, 3]})).toEqual({
      '.array1': ValidationTexts.arrayMax.replace('${}', '4'),
      '.array1.0': ValidationTexts.arrayMin.replace('${}', '1'),
      '.array1.1': ValidationTexts.arrayMin.replace('${}', '1'),
      '.array1.2': ValidationTexts.typeError,
      '.array1.3': ValidationTexts.typeError,
      '.array1.4': ValidationTexts.typeError,
    });


    formInstance.setModel({array1: [['foo'], ['bar'], [123]]});

    expect(formInstance.outputModel.value).toEqual({array1: [[null], [null], [null]]});
    expect(formInstance.errors.value).toEqual({
      '.array1.0.0': ValidationTexts.optionError,
      '.array1.1.0': ValidationTexts.optionError,
      '.array1.2.0': ValidationTexts.optionError,
    });

    options1.next([
      {label: 'var1', value: 'foo'},
      {label: 'var2', value: 'bar'},
    ]);

    expect(formInstance.outputModel.value).toEqual({array1: [['foo'], ['bar'], [null]]});
    expect(formInstance.errors.value).toEqual({
      '.array1.2.0': ValidationTexts.optionError,
    });

  });

  it('Set Value on Array of Arrays', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const options1 = new BehaviorSubject<FormDefElementSelectOption[]>([]);

    formDefinition = {
      array1: {
        type: 'array',
        caption: 'Object Array',
        required: true,
        minLength: 2,
        maxLength: 4,
        elements: {
          type: 'array',
          required: true,
          minLength: 1,
          maxLength: 1,
          elements: {
            type: 'selection',
            options: options1,
          },
        },
      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    formInstance.setModel({});
    expect(formInstance.outputModel.value).toEqual({array1: []});
    expect(formInstance.errors.value['.array1']).toEqual(ValidationTexts.arrayMin.replace('${}', '2'));

    formInstance.setValue('.array1', 123);
    expect(formInstance.outputModel.value).toEqual({array1: []});
    expect(formInstance.errors.value['.array1']).toEqual(ValidationTexts.typeError);

    formInstance.setValue('.array1', []);
    expect(formInstance.outputModel.value).toEqual({array1: []});
    expect(formInstance.errors.value['.array1']).toEqual(ValidationTexts.arrayMin.replace('${}', '2'));

    formInstance.addToArray('.array1', 'test');
    formInstance.addToArray('.array1', []);

    expect(formInstance.outputModel.value).toEqual({array1: [[], []]});
    expect(formInstance.errors.value['.array1']).toEqual(undefined);
    expect(formInstance.errors.value['.array1.0']).toEqual(ValidationTexts.typeError);
    expect(formInstance.errors.value['.array1.1']).toEqual(ValidationTexts.arrayMin.replace('${}', '1'));

    formInstance.addToArray('.array1.1', null);

    expect(formInstance.outputModel.value).toEqual({array1: [[], [null]]});
    expect(formInstance.errors.value['.array1']).toEqual(undefined);
    expect(formInstance.errors.value['.array1.0']).toEqual(ValidationTexts.typeError);
    expect(formInstance.errors.value['.array1.1']).toEqual(undefined);
    expect(formInstance.errors.value['.array1.1.0']).toEqual(undefined);


    formInstance.setValue('.array1.1.0', 'foo');

    expect(formInstance.outputModel.value).toEqual({array1: [[], [null]]});
    expect(formInstance.errors.value['.array1']).toEqual(undefined);
    expect(formInstance.errors.value['.array1.0']).toEqual(ValidationTexts.typeError);
    expect(formInstance.errors.value['.array1.1']).toEqual(undefined);
    expect(formInstance.errors.value['.array1.1.0']).toEqual(ValidationTexts.optionError);

    options1.next([
      {label: 'var1', value: 'foo'},
      {label: 'var2', value: 'bar'},
    ]);

    expect(formInstance.outputModel.value).toEqual({array1: [[], ['foo']]});
    expect(formInstance.errors.value['.array1']).toEqual(undefined);
    expect(formInstance.errors.value['.array1.0']).toEqual(ValidationTexts.typeError);
    expect(formInstance.errors.value['.array1.1']).toEqual(undefined);
    expect(formInstance.errors.value['.array1.1.0']).toEqual(undefined);


  });


  it.only('Remove Value from Array', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      array1: {
        type: 'array',
        caption: 'String Array',
        elements: {
          type: 'text',
        },
      },
      array2: {
        type: 'array',
        caption: 'Object Array',
        required: true,
        elements: {
          type: 'object',
          properties: {
            posX: {caption: null, type: 'integer', required: true},
            posY: {caption: null, type: 'integer', required: true},
          },
        },
      },

    };

    formInstance = new GenericFormInstance(formDefinition);

    formInstance.setModel({array1: ['text 1', 'text 2', 'text 3'], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
    expect(formInstance.outputModel.value).toEqual({array1: ['text 1', 'text 2', 'text 3'], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
    expect(formInstance.errors.value).toEqual({});

    formInstance.setValue('.array1.0', 'text 1/2');
    formInstance.setValue('.array1.2', 'text 3/2');
    expect(formInstance.outputModel.value).toEqual({array1: ['text 1/2', 'text 2', 'text 3/2'], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
    expect(formInstance.errors.value).toEqual({});

    formInstance.deleteFromArray('.array1', 1);

    expect(formInstance.outputModel.value).toEqual({array1: ['text 1/2', 'text 3/2'], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
    expect(formInstance.errors.value).toEqual({});

    formInstance.setValue('.array1.1', 123);
    expect(formInstance.outputModel.value).toEqual({array1: ['text 1/2', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
    expect(formInstance.errors.value).toEqual({
      '.array1.1': ValidationTexts.typeError
    });


    formInstance.addToArray('.array1', 'text 4');
    formInstance.addToArray('.array1', 234);

    expect(formInstance.outputModel.value).toEqual({array1: ['text 1/2', null, 'text 4', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
    expect(formInstance.errors.value).toEqual({
      '.array1.1': ValidationTexts.typeError,
      '.array1.3': ValidationTexts.typeError,
    });

    formInstance.setValue('.array1.3', 'text 5');

    expect(formInstance.outputModel.value).toEqual({array1: ['text 1/2', null, 'text 4', 'text 5'], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
    expect(formInstance.errors.value).toEqual({
      '.array1.1': ValidationTexts.typeError,
    });

    formInstance.addToArray('.array1', true);

    expect(formInstance.outputModel.value).toEqual({array1: ['text 1/2', null, 'text 4', 'text 5', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
    expect(formInstance.errors.value).toEqual({
      '.array1.1': ValidationTexts.typeError,
      '.array1.4': ValidationTexts.typeError,
    });

    formInstance.deleteFromArray('.array1', 1);

    expect(formInstance.outputModel.value).toEqual({array1: ['text 1/2', 'text 4', 'text 5', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
    expect(formInstance.errors.value).toEqual({
      '.array1.3': ValidationTexts.typeError,
    });

    formInstance.addToArray('.array2', 4);
    formInstance.addToArray('.array2', {posX: 5, posY: 5});

    expect(formInstance.outputModel.value).toEqual({array1: ['text 1/2', 'text 4', 'text 5', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}, null, {posX: 5, posY: 5}]});
    expect(formInstance.errors.value).toEqual({
      '.array1.3': ValidationTexts.typeError,
      '.array2.3': ValidationTexts.typeError,
    });

    formInstance.setValue('.array2.4.posY', 6);

    expect(formInstance.outputModel.value).toEqual({array1: ['text 1/2', 'text 4', 'text 5', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}, null, {posX: 5, posY: 6}]});
    expect(formInstance.errors.value).toEqual({
      '.array1.3': ValidationTexts.typeError,
      '.array2.3': ValidationTexts.typeError,
    });

    formInstance.setValue('.array2.4.posX', 'test');

    expect(formInstance.outputModel.value).toEqual({array1: ['text 1/2', 'text 4', 'text 5', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}, null, {posX: null, posY: 6}]});
    expect(formInstance.errors.value).toEqual({
      '.array1.3': ValidationTexts.typeError,
      '.array2.3': ValidationTexts.typeError,
      '.array2.4.posX': ValidationTexts.typeError,
    });

    formInstance.deleteFromArray('.array2', 2);

    expect(formInstance.outputModel.value).toEqual({array1: ['text 1/2', 'text 4', 'text 5', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, null, {posX: null, posY: 6}]});
    expect(formInstance.errors.value).toEqual({
      '.array1.3': ValidationTexts.typeError,
      '.array2.2': ValidationTexts.typeError,
      '.array2.3.posX': ValidationTexts.typeError,
    });

  });


});
