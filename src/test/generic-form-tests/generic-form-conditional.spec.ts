import {beforeEach, describe, expect, it} from '@jest/globals';
import {GenericFormInstance} from '../../app/generic-form/generic-form-instance';
import {FormDefinition, ValidationTexts} from '../../app/generic-form/generic-form.data';


describe('generic-form', () => {

  beforeEach(async () => {

  });

  it('Check and Validate Primitive Condition', async () => {
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
      textActive: {caption: null, type: 'boolean'},
      numberActive: {caption: null, type: 'boolean'},
      integerActive: {caption: null, type: 'boolean'},
      booleanActive: {caption: null, type: 'boolean'},
      text1: {caption: null, type: 'text', condition: {path: 'textActive', value: true}, required: true},
      number1: {caption: null, type: 'number', condition: {path: 'numberActive', value: true}, required: true},
      integer1: {caption: null, type: 'integer', condition: {path: 'integerActive', value: true}, required: true},
      boolean1: {caption: null, type: 'boolean', condition: {path: 'booleanActive', value: true}, required: true},
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({})).toEqual({textActive: null, numberActive: null, integerActive: null, booleanActive: null});
    expect(getValidationResult({})).toEqual({});

    // TEXT

    expect(getOutputValue({textActive: true})).toEqual({textActive: true, numberActive: null, integerActive: null, booleanActive: null, text1: null});
    expect(getValidationResult({textActive: true})).toEqual({
      '.text1': ValidationTexts.required,
    });


    expect(getOutputValue({textActive: true, text1: 'foo'})).toEqual({textActive: true, numberActive: null, integerActive: null, booleanActive: null, text1: 'foo'});
    expect(getValidationResult({textActive: true, text1: 'foo'})).toEqual({});

    // NUMBER

    expect(getOutputValue({numberActive: true})).toEqual({textActive: null, numberActive: true, integerActive: null, booleanActive: null, number1: null});
    expect(getValidationResult({numberActive: true})).toEqual({
      '.number1': ValidationTexts.required,
    });

    expect(getOutputValue({numberActive: true, number1: 123})).toEqual({textActive: null, numberActive: true, integerActive: null, booleanActive: null, number1: 123});
    expect(getValidationResult({numberActive: true, number1: 123})).toEqual({});

    // INTEGER

    expect(getOutputValue({integerActive: true})).toEqual({textActive: null, numberActive: null, integerActive: true, booleanActive: null, integer1: null});
    expect(getValidationResult({integerActive: true})).toEqual({
      '.integer1': ValidationTexts.required,
    });

    expect(getOutputValue({integerActive: true, integer1: 123})).toEqual({textActive: null, numberActive: null, integerActive: true, booleanActive: null, integer1: 123});
    expect(getValidationResult({integerActive: true, integer1: 123})).toEqual({});

    // BOOLEAN

    expect(getOutputValue({booleanActive: true})).toEqual({textActive: null, numberActive: null, integerActive: null, booleanActive: true, boolean1: null});
    expect(getValidationResult({booleanActive: true})).toEqual({
      '.boolean1': ValidationTexts.required,
    });

    expect(getOutputValue({booleanActive: true, boolean1: false})).toEqual({textActive: null, numberActive: null, integerActive: null, booleanActive: true, boolean1: false});
    expect(getValidationResult({booleanActive: true, boolean1: false})).toEqual({});

  });

  it('Check and Validate Primitive Condition in nested Object', async () => {
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
      flags: {
        type: 'object',
        caption: 'Position',
        required: true,
        properties: {
          textActive: {caption: null, type: 'boolean'},
          numberActive: {caption: null, type: 'boolean'},
        },
      },
      text1: {caption: null, type: 'text', condition: {path: 'flags.textActive', value: true}, required: true},
      number1: {caption: null, type: 'number', condition: {path: 'flags.numberActive', value: true}, required: true},
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({})).toEqual({flags: {textActive: null, numberActive: null}});
    expect(getValidationResult({})).toEqual({
      '.flags': ValidationTexts.required,
    });

    // TEXT

    expect(getOutputValue({flags: {textActive: true}})).toEqual({flags: {textActive: true, numberActive: null}, text1: null});
    expect(getValidationResult({flags: {textActive: true}})).toEqual({
      '.text1': ValidationTexts.required,
    });

    expect(getOutputValue({flags: {textActive: true}, text1: 'foo'})).toEqual({flags: {textActive: true, numberActive: null}, text1: 'foo'});
    expect(getValidationResult({flags: {textActive: true}, text1: 'foo'})).toEqual({});

  });

  it('Check and Validate Selection Condition', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      selActive: {caption: null, type: 'boolean', required: true},
      sel1: {
        type: 'selection',
        caption: 'SelectValue',
        required: true,
        condition: {path: 'selActive', value: true},
        options: [
          {label: 'var1', value: 123},
          {label: 'var1', value: 'test'},
          {label: 'var1', value: false},
        ],
      },
    };
    formInstance = new GenericFormInstance(formDefinition);


    formInstance.setModel({});

    expect(formInstance.outputModel.value).toEqual({selActive: null});
    expect(formInstance.errors.value).toEqual({
      '.selActive': ValidationTexts.required,
    });

    formInstance.setValue('.sel1', 234);
    expect(formInstance.outputModel.value).toEqual({selActive: null});
    expect(formInstance.errors.value).toEqual({
      '.selActive': ValidationTexts.required,
    });

    formInstance.setValue('.selActive', true);
    expect(formInstance.outputModel.value).toEqual({selActive: true, sel1: null});
    expect(formInstance.errors.value).toEqual({
      '.sel1': ValidationTexts.optionError,
    });

    formInstance.setValue('.selActive', false);
    expect(formInstance.outputModel.value).toEqual({selActive: false});
    expect(formInstance.errors.value).toEqual({});

    formInstance.setValue('.selActive', true);
    formInstance.setValue('.sel1', 123);

    expect(formInstance.outputModel.value).toEqual({selActive: true, sel1: 123});
    expect(formInstance.errors.value).toEqual({});

  });


  it('Check and Validate Object Condition', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      objActive: {caption: null, type: 'boolean', required: true},
      obj1: {
        type: 'object',
        caption: 'Position',
        required: true,
        condition: {path: 'objActive', value: true},
        properties: {
          bool1: {caption: null, type: 'boolean', required: true},
          bool2: {caption: null, type: 'boolean'},
        },
      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    formInstance.setModel({});

    expect(formInstance.outputModel.value).toEqual({objActive: null});
    expect(formInstance.errors.value).toEqual({
      '.objActive': ValidationTexts.required,
    });

    formInstance.setValue('.objActive', true);
    expect(formInstance.outputModel.value).toEqual({objActive: true, obj1: {bool1: null, bool2: null}});
    expect(formInstance.errors.value).toEqual({
      '.obj1': ValidationTexts.required,
    });

    formInstance.setValue('.obj1', {});
    expect(formInstance.outputModel.value).toEqual({objActive: true, obj1: {bool1: null, bool2: null}});
    expect(formInstance.errors.value).toEqual({
      '.obj1.bool1': ValidationTexts.required,
    });

    formInstance.setValue('.obj1', {bool2: false});
    expect(formInstance.outputModel.value).toEqual({objActive: true, obj1: {bool1: null, bool2: false}});
    expect(formInstance.errors.value).toEqual({
      '.obj1.bool1': ValidationTexts.required,
    });


    formInstance.setValue('.objActive', false);
    expect(formInstance.outputModel.value).toEqual({objActive: false});
    expect(formInstance.errors.value).toEqual({});

    formInstance.setValue('.obj1', {bool1: true, bool2: true});
    expect(formInstance.outputModel.value).toEqual({objActive: false});
    expect(formInstance.errors.value).toEqual({});

    formInstance.setValue('.objActive', true);
    expect(formInstance.outputModel.value).toEqual({objActive: true, obj1: {bool1: true, bool2: true}});
    expect(formInstance.errors.value).toEqual({});

  });

  it.only('Check and Validate Array Condition', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      array1Active: {caption: null, type: 'boolean', required: true},
      array2Active: {caption: null, type: 'boolean', required: true},
      array1: {
        type: 'array',
        caption: 'String Array',
        required: true,
        condition: {path: 'array1Active', value: true},
        elements: {
          type: 'text',
          required: true,
        },
      },
      array2: {
        type: 'array',
        caption: 'Object Array',
        required: true,
        condition: {path: 'array2Active', value: true},
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

    expect(formInstance.outputModel.value).toEqual({array1Active: null, array2Active: null});
    expect(formInstance.errors.value).toEqual({
      '.array1Active': ValidationTexts.required,
      '.array2Active': ValidationTexts.required,
    });

    formInstance.setValue('.array1Active', true);
    expect(formInstance.outputModel.value).toEqual({array1Active: true, array2Active: null, array1: []});
    expect(formInstance.errors.value).toEqual({
      '.array2Active': ValidationTexts.required,
      '.array1': ValidationTexts.required,
    });

    formInstance.setValue('.array1', [null]);

    expect(formInstance.outputModel.value).toEqual({array1Active: true, array2Active: null, array1: [null]});
    expect(formInstance.errors.value).toEqual({
      '.array2Active': ValidationTexts.required,
      '.array1.0': ValidationTexts.required,
    });

    formInstance.setValue('.array1Active', false);
    expect(formInstance.outputModel.value).toEqual({array1Active: false, array2Active: null});
    expect(formInstance.errors.value).toEqual({
      '.array2Active': ValidationTexts.required,
    });

    formInstance.setValue('.array1Active', true);
    expect(formInstance.outputModel.value).toEqual({array1Active: true, array2Active: null, array1: [null]});
    expect(formInstance.errors.value).toEqual({
      '.array2Active': ValidationTexts.required,
      '.array1.0': ValidationTexts.required,
    });

    formInstance.setValue('.array1', ['foo']);
    expect(formInstance.outputModel.value).toEqual({array1Active: true, array2Active: null, array1: ['foo']});
    expect(formInstance.errors.value).toEqual({
      '.array2Active': ValidationTexts.required,
    });


    formInstance.setValue('.array2Active', true);
    expect(formInstance.outputModel.value).toEqual({array1Active: true, array2Active: true, array1: ['foo'], array2: []});
    expect(formInstance.errors.value).toEqual({
      '.array2': ValidationTexts.required,
    });

    formInstance.setValue('.array2', [{}]);

    expect(formInstance.outputModel.value).toEqual({array1Active: true, array2Active: true, array1: ['foo'], array2: [{posX: null, posY: null}]});
    expect(formInstance.errors.value).toEqual({
      '.array2.0.posX': ValidationTexts.required,
      '.array2.0.posY': ValidationTexts.required,
    });

    formInstance.setValue('.array2Active', false);

    expect(formInstance.outputModel.value).toEqual({array1Active: true, array2Active: false, array1: ['foo']});
    expect(formInstance.errors.value).toEqual({});

    formInstance.setValue('.array2Active', true);
    expect(formInstance.outputModel.value).toEqual({array1Active: true, array2Active: true, array1: ['foo'], array2: [{posX: null, posY: null}]});
    expect(formInstance.errors.value).toEqual({
      '.array2.0.posX': ValidationTexts.required,
      '.array2.0.posY': ValidationTexts.required,
    });

  });


  it('Check and Validate Subform', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      subform1Active: {caption: null, type: 'boolean', required: true},
      subform2Active: {caption: null, type: 'boolean', required: true},
      subform1: {
        type: 'subform',
        caption: 'Subform 1',
        condition: {path: 'subform1Active', value: true},
        content: {
          text: {caption: null, type: 'text', required: true},
          number: {caption: null, type: 'number', required: true, min: 1, max: 5},
          boolean1: {caption: null, type: 'boolean', required: false},
        },
      },
      subform2: {
        type: 'subform',
        caption: 'Subform 2',
        condition: {path: 'subform2Active', value: true},
        content: {
          text: {caption: null, type: 'text', required: true},
          number: {caption: null, type: 'number', required: true, min: 6, max: 10},
          number2: {caption: null, type: 'number', required: true},
        },
      },
    };
    formInstance = new GenericFormInstance(formDefinition);


    formInstance.setModel({});

    expect(formInstance.outputModel.value).toEqual({subform1Active: null, subform2Active: null});
    expect(formInstance.errors.value).toEqual({
      '.subform1Active': ValidationTexts.required,
      '.subform2Active': ValidationTexts.required,
    });

    formInstance.setValue('.subform1Active', false);
    formInstance.setValue('.subform2Active', false);

    expect(formInstance.outputModel.value).toEqual({subform1Active: false, subform2Active: false});
    expect(formInstance.errors.value).toEqual({});

    formInstance.setValue('.subform1Active', true);
    expect(formInstance.outputModel.value).toEqual({subform1Active: true, subform2Active: false, text: null, number: null, boolean1: null});
    expect(formInstance.errors.value).toEqual({
      '.text': ValidationTexts.required,
      '.number': ValidationTexts.required,
    });

    formInstance.setValue('.text', 'Lorem Ipsum');
    formInstance.setValue('.number', 3);

    expect(formInstance.outputModel.value).toEqual({subform1Active: true, subform2Active: false, text: 'Lorem Ipsum', number: 3, boolean1: null});
    expect(formInstance.errors.value).toEqual({});

    formInstance.setValue('.boolean1', false);

    expect(formInstance.outputModel.value).toEqual({subform1Active: true, subform2Active: false, text: 'Lorem Ipsum', number: 3, boolean1: false});
    expect(formInstance.errors.value).toEqual({});

    formInstance.setValue('.subform1Active', false);
    formInstance.setValue('.subform2Active', true);

    expect(formInstance.outputModel.value).toEqual({subform1Active: true, subform2Active: false, text: 'Lorem Ipsum', number: 3});
    expect(formInstance.errors.value).toEqual({
      '.number2': ValidationTexts.required,
    });

    formInstance.setValue('.number2', 56);

    expect(formInstance.outputModel.value).toEqual({subform1Active: true, subform2Active: false, text: 'Lorem Ipsum', number: 3, boolean1: false});
    expect(formInstance.errors.value).toEqual({});

    formInstance.setValue('.subform1Active', true);
    formInstance.setValue('.subform2Active', false);

  });

});
