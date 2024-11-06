import {beforeEach, describe, expect, it} from '@jest/globals';
import {ValidationTexts} from '../../libs/generic-form/generic-form-commons';
import {FormDefinition} from '../../libs/generic-form/generic-form-definition';
import {GenericFormInstance} from '../../libs/generic-form/generic-form-instance';
/* eslint  prefer-const: 0 */


describe(__filename, () => {

  beforeEach(async () => {

  });


  it('Validate Number Min Max', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    // Numbers - Min - Max

    formDefinition = {
      float_1: {caption: null, type: 'number', min: 10, max: 20},
      float_2: {caption: null, type: 'number', min: 11, max: 21, required: true},
      int_1: {caption: null, type: 'integer', min: 12, max: 22},
      int_2: {caption: null, type: 'integer', min: 13, max: 23, required: true},
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(formInstance.outputModel).toEqual({float_1: null, float_2: null, int_1: null, int_2: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'float_2': ValidationTexts.required,
      'int_2': ValidationTexts.required,
    });

    formInstance = new GenericFormInstance(formDefinition, {float_1: 9, float_2: 9, int_1: 9, int_2: 9});
    expect(formInstance.outputModel).toEqual({float_1: 9, float_2: 9, int_1: 9, int_2: 9});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'float_1': ValidationTexts.numberMin.replace('${}', '10'),
      'float_2': ValidationTexts.numberMin.replace('${}', '11'),
      'int_1': ValidationTexts.numberMin.replace('${}', '12'),
      'int_2': ValidationTexts.numberMin.replace('${}', '13'),
    });


    formInstance = new GenericFormInstance(formDefinition, {float_1: 99, float_2: 99, int_1: 99, int_2: 99});
    expect(formInstance.outputModel).toEqual({float_1: 99, float_2: 99, int_1: 99, int_2: 99});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'float_1': ValidationTexts.numberMax.replace('${}', '20'),
      'float_2': ValidationTexts.numberMax.replace('${}', '21'),
      'int_1': ValidationTexts.numberMax.replace('${}', '22'),
      'int_2': ValidationTexts.numberMax.replace('${}', '23'),
    });


    formInstance = new GenericFormInstance(formDefinition, {float_1: 15.6, float_2: 12.5, int_1: 14.3, int_2: 12.6});
    expect(formInstance.outputModel).toEqual({float_1: 15.6, float_2: 12.5, int_1:14, int_2: 13});
    expect(formInstance.outputErrors.value.export()).toEqual({});


  });


});
