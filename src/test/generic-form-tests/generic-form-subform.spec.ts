import {beforeEach, describe, expect, it} from '@jest/globals';
import {BehaviorSubject} from 'rxjs';
import {GenericFormInstance} from '../../app/generic-form/generic-form-instance';
import {FormDefElementSelectOption, FormDefinition, ValidationTexts} from '../../app/generic-form/generic-form.data';


describe('generic-form-subform', () => {

  beforeEach(async () => {

  });


  it('Subform - Check Primitive Data', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const getOutputValue = (model: any) => {
      formInstance.setModel(model);
      return formInstance.outputModel.value;
    };

    formDefinition = {
      name: {caption: null, type: 'text'},
      sub1: {
        type: 'subform',
        inline: true,
        content: {
          age1: {caption: null, type: 'integer'},
          weight1: {caption: null, type: 'number'},
          employed1: {caption: null, type: 'boolean'},
        },
      },
      sub2: {
        type: 'subform',
        inline: true,
        content: {
          name2: {caption: null, type: 'text', required: true},
          age2: {caption: null, type: 'integer', required: true},
          weight2: {caption: null, type: 'number', required: true},
          employed2: {caption: null, type: 'boolean', required: true},
        },
      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({})).toEqual({name: null, age1: null, weight1: null, employed1: null, name2: null, age2: null, weight2: null, employed2: null});
    expect(getOutputValue({name: 'foo'})).toEqual({name: 'foo', age1: null, weight1: null, employed1: null, name2: null, age2: null, weight2: null, employed2: null});
    expect(getOutputValue({age1: 32})).toEqual({name: null, age1: 32, weight1: null, employed1: null, name2: null, age2: null, weight2: null, employed2: null});
    expect(getOutputValue({age1: 32.5})).toEqual({name: null, age1: 33, weight1: null, employed1: null, name2: null, age2: null, weight2: null, employed2: null});
    expect(getOutputValue({age1: 0})).toEqual({name: null, age1: 0, weight1: null, employed1: null, name2: null, age2: null, weight2: null, employed2: null});
    expect(getOutputValue({weight1: 65.5})).toEqual({name: null, age1: null, weight1: 65.5, employed1: null, name2: null, age2: null, weight2: null, employed2: null});
    expect(getOutputValue({employed1: false})).toEqual({name: null, age1: null, weight1: null, employed1: false, name2: null, age2: null, weight2: null, employed2: null});
    expect(getOutputValue({employed1: true})).toEqual({name: null, age1: null, weight1: null, employed1: true, name2: null, age2: null, weight2: null, employed2: null});

    expect(getOutputValue({name2: 'bar'})).toEqual({name: null, age1: null, weight1: null, employed1: null, name2: 'bar', age2: null, weight2: null, employed2: null});
    expect(getOutputValue({age1: 32, age2: 33})).toEqual({name: null, age1: 32, weight1: null, employed1: null, name2: null, age2: 33, weight2: null, employed2: null});
    expect(getOutputValue({employed2: false})).toEqual({name: null, age1: null, weight1: null, employed1: null, name2: null, age2: null, weight2: null, employed2: false});

    expect(getOutputValue({name: 'foo', age1: 32, bar: true})).toEqual({name: 'foo', age1: 32, weight1: null, employed1: null, name2: null, age2: null, weight2: null, employed2: null});

  });

  it('Subform - Validate Primitive Data', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const getValidationResult = (model: any) => {
      formInstance.setModel(model);
      return formInstance.errors.value;
    };


    formDefinition = {
      sub1: {
        type: 'subform',
        inline: true,
        content: {
          name_1: {caption: null, type: 'text'},
          name_2: {caption: null, type: 'text', required: true},
          age_1: {caption: null, type: 'integer'},
          age_2: {caption: null, type: 'integer', required: true},
        },
      },
      sub2: {
        type: 'subform',
        inline: false,
        caption: 'Sub2',
        content: {
          weight_1: {caption: null, type: 'number'},
          weight_2: {caption: null, type: 'number', required: true},
          employed_1: {caption: null, type: 'boolean'},
          employed_2: {caption: null, type: 'boolean', required: true},
        },
      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(getValidationResult({})).toEqual({
      '.name_2': ValidationTexts.required,
      '.age_2': ValidationTexts.required,
      '.weight_2': ValidationTexts.required,
      '.employed_2': ValidationTexts.required,
    });
    expect(getValidationResult({name_1: 123, name_2: 'test'})).toEqual({
      '.name_1': ValidationTexts.typeError,
      '.age_2': ValidationTexts.required,
      '.weight_2': ValidationTexts.required,
      '.employed_2': ValidationTexts.required,
    });
    expect(getValidationResult({age_1: 123, age_2: 'test'})).toEqual({
      '.name_2': ValidationTexts.required,
      '.age_2': ValidationTexts.typeError,
      '.weight_2': ValidationTexts.required,
      '.employed_2': ValidationTexts.required,
    });
    expect(getValidationResult({age_1: true})).toEqual({
      '.name_2': ValidationTexts.required,
      '.age_1': ValidationTexts.typeError,
      '.age_2': ValidationTexts.required,
      '.weight_2': ValidationTexts.required,
      '.employed_2': ValidationTexts.required,
    });
    expect(getValidationResult({age_1: NaN})).toEqual({
      '.name_2': ValidationTexts.required,
      '.age_1': ValidationTexts.NaN,
      '.age_2': ValidationTexts.required,
      '.weight_2': ValidationTexts.required,
      '.employed_2': ValidationTexts.required,
    });
    expect(getValidationResult({age_1: Infinity})).toEqual({
      '.name_2': ValidationTexts.required,
      '.age_1': ValidationTexts.NaN,
      '.age_2': ValidationTexts.required,
      '.weight_2': ValidationTexts.required,
      '.employed_2': ValidationTexts.required,
    });
    expect(getValidationResult({weight_1: false})).toEqual({
      '.name_2': ValidationTexts.required,
      '.age_2': ValidationTexts.required,
      '.weight_1': ValidationTexts.typeError,
      '.weight_2': ValidationTexts.required,
      '.employed_2': ValidationTexts.required,
    });
    expect(getValidationResult({employed_1: 0})).toEqual({
      '.name_2': ValidationTexts.required,
      '.age_2': ValidationTexts.required,
      '.weight_2': ValidationTexts.required,
      '.employed_1': ValidationTexts.typeError,
      '.employed_2': ValidationTexts.required,
    });
  });

  it('Subform - Set Value on  Objects', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    formDefinition = {
      name: {caption: null, type: 'text'},
      sub1: {
        type: 'subform',
        inline: true,
        content: {
          position: {
            type: 'object',
            caption: 'Position',
            required: true,
            properties: {
              posX: {caption: null, type: 'integer', required: true},
              posY: {caption: null, type: 'integer', required: true},
            },
          },
        },
      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    formInstance.setModel({});

    expect(formInstance.outputModel.value).toEqual({name: null, position: {posX: null, posY: null}});
    expect(formInstance.errors.value['.position']).toEqual(undefined);

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


  it('Subform -  Check and Validate Array with Async Options', async () => {
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
      sub1: {
        type: 'subform',
        inline: true,
        content: {
          array1: {
            type: 'array',
            caption: 'Object Array',
            required: true,
            elements: {
              type: 'selection',
              options: options1,
            },
          },
        },
      },

    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({})).toEqual({ array1: []});
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


});
