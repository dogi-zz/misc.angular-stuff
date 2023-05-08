import {beforeEach, describe, expect, it} from '@jest/globals';
import {GenericFormInstance} from '../../app/generic-form/generic-form-instance';
import {FormDefinition, ValidationTexts} from '../../app/generic-form/generic-form.data';


describe('generic-form', () => {

  beforeEach(async () => {

  });

  it('Child Array with conditional min/max value', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    formDefinition = {
      name: {
        caption: 'Name', type: 'text',
      },
      child_count: {
        caption: 'Child Count', type: 'integer',
        min: 0, max: 5,
      },
      children: {
        caption: 'Children', type: 'array',
        condition: {path: 'child_count', condition: 'eq', value: 1},
        minLength: 1,
        maxLength: 1,
        required: true,
        elements: {
          type: 'object',
          required: true,
          properties: {
            name: {caption: 'Name', type: 'text'},
          },
        },
      },
    };
    formInstance = new GenericFormInstance(formDefinition);

    formInstance.setModel({});
    expect(formInstance.outputModel.value).toEqual({name: null, child_count: null});
    expect(formInstance.errors.value).toEqual({});

    expect(formInstance.visiblePaths).toEqual({
      '.name' : true,
      '.child_count' : true,
      '.children' : false,
    });

    formInstance.setValue('.child_count', 1);

    expect(formInstance.outputModel.value).toEqual({name: null, child_count: 1, children: [{name: null}]});
    expect(formInstance.errors.value).toEqual({});

  });



});
