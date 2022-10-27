import {beforeEach, describe, expect, it} from '@jest/globals';
import {BehaviorSubject} from 'rxjs';
import {GenericFormInstance} from '../generic-form/generic-form-instance';
import {FormDefElementSelectOption, FormDefinition, ValidationTexts} from '../generic-form/generic-form.data';


describe('generic-form', () => {

  beforeEach(async () => {

  });


  it('Check Primitive Data', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const getOutputValue = (model: any) => {
      formInstance.setModel(model);
      return formInstance.outputModel.value;
    };


    formDefinition = {
      name: {caption: null, type: 'text'},
      age: {caption: null, type: 'integer'},
      weight: {caption: null, type: 'number'},
      employed: {caption: null, type: 'boolean'},
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({})).toEqual({name: null, age: null, weight: null, employed: null});
    expect(getOutputValue({name: 'foo'})).toEqual({name: 'foo', age: null, weight: null, employed: null});
    expect(getOutputValue({age: 32})).toEqual({name: null, age: 32, weight: null, employed: null});
    expect(getOutputValue({age: 32.5})).toEqual({name: null, age: 33, weight: null, employed: null});
    expect(getOutputValue({age: 0})).toEqual({name: null, age: 0, weight: null, employed: null});
    expect(getOutputValue({weight: 65.5})).toEqual({name: null, age: null, weight: 65.5, employed: null});
    expect(getOutputValue({employed: false})).toEqual({name: null, age: null, weight: null, employed: false});
    expect(getOutputValue({employed: true})).toEqual({name: null, age: null, weight: null, employed: true});

    expect(getOutputValue({name: 'foo', age: 32, bar: true})).toEqual({name: 'foo', age: 32, weight: null, employed: null});

  });

  it('Validate Primitive Data', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const getValidationResult = (model: any) => {
      formInstance.setModel(model);
      return formInstance.errors.value;
    };


    formDefinition = {
      name_1: {caption: null, type: 'text'},
      name_2: {caption: null, type: 'text', required: true},
      age_1: {caption: null, type: 'integer'},
      age_2: {caption: null, type: 'integer', required: true},
      weight_1: {caption: null, type: 'number'},
      weight_2: {caption: null, type: 'number', required: true},
      employed_1: {caption: null, type: 'boolean'},
      employed_2: {caption: null, type: 'boolean', required: true},
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


  it('Set Value on Primitive Data', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      name: {caption: null, type: 'text'},
      age: {caption: null, type: 'integer'},
      weight: {caption: null, type: 'number'},
      employed: {caption: null, type: 'boolean'},
    };
    formInstance = new GenericFormInstance(formDefinition);

    formInstance.setModel({});

    expect(formInstance.outputModel.value).toEqual({name: null, age: null, weight: null, employed: null});

    formInstance.setValue('.name', 123);
    expect(formInstance.outputModel.value).toEqual({name: null, age: null, weight: null, employed: null});
    expect(formInstance.errors.value['.name']).toEqual(ValidationTexts.typeError);

    formInstance.setValue('.name', 'foo');
    expect(formInstance.outputModel.value).toEqual({name: 'foo', age: null, weight: null, employed: null});
    expect(formInstance.errors.value['.name']).toEqual(undefined);
  });

  it('Validate Number Min Max', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const getValidationResult = (model: any) => {
      formInstance.setModel(model);
      return formInstance.errors.value;
    };


    // Numbers - Min - Max

    formDefinition = {
      float_1: {caption: null, type: 'number', min: 10, max: 20},
      float_2: {caption: null, type: 'number', min: 11, max: 21, required: true},
      int_1: {caption: null, type: 'integer', min: 12, max: 22},
      int_2: {caption: null, type: 'integer', min: 13, max: 23, required: true},
    };
    formInstance = new GenericFormInstance(formDefinition);

    expect(getValidationResult({})).toEqual({
      '.float_2': ValidationTexts.required,
      '.int_2': ValidationTexts.required,
    });

    expect(getValidationResult({
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

    expect(getValidationResult({
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


  it('Check and Validate Selection Sync', async () => {
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
    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({})).toEqual({name: null, sel1: null, sel2: null});
    expect(getOutputValue({sel1: true})).toEqual({name: null, sel1: null, sel2: null});
    expect(getOutputValue({sel1: false})).toEqual({name: null, sel1: false, sel2: null});
    expect(getOutputValue({sel1: 'false'})).toEqual({name: null, sel1: null, sel2: null});
    expect(getOutputValue({sel1: 'test'})).toEqual({name: null, sel1: 'test', sel2: null});

    expect(getValidationResult({})).toEqual({
      '.sel1': ValidationTexts.required,
    });
    expect(getValidationResult({sel1: true})).toEqual({
      '.sel1': ValidationTexts.optionError,
    });
    expect(getValidationResult({sel1: false})).toEqual({});
    expect(getValidationResult({sel1: null})).toEqual({
      '.sel1': ValidationTexts.required,
    });
    expect(getValidationResult({sel1: 123})).toEqual({});
    expect(getValidationResult({sel1: 124})).toEqual({
      '.sel1': ValidationTexts.optionError,
    });
    expect(getValidationResult({sel2: true})).toEqual({
      '.sel1': ValidationTexts.required,
      '.sel2': ValidationTexts.optionError,
    });

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
    formInstance = new GenericFormInstance(formDefinition);


    formInstance.setModel({});

    expect(formInstance.outputModel.value).toEqual({name: null, sel1: null});
    expect(formInstance.errors.value['.sel1']).toEqual(ValidationTexts.required);

    formInstance.setValue('.sel1', 234);
    expect(formInstance.outputModel.value).toEqual({name: null, sel1: null});
    expect(formInstance.errors.value['.sel1']).toEqual(ValidationTexts.optionError);

    formInstance.setValue('.sel1', 'test');
    expect(formInstance.outputModel.value).toEqual({name: null, sel1: 'test'});
    expect(formInstance.errors.value['.name']).toEqual(undefined);
  });

  it('Check and Validate Selection Async', async () => {
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
    formInstance = new GenericFormInstance(formDefinition);

    expect(getOutputValue({})).toEqual({name: null, sel1: null, sel2: null});
    expect(getOutputValue({sel1: true, sel2: false})).toEqual({name: null, sel1: null, sel2: null});
    expect(getOutputValue({sel1: 'foo', sel2: 123, sel3: 'bar'})).toEqual({name: null, sel1: null, sel2: null});

    expect(getValidationResult({})).toEqual({
      '.sel1': ValidationTexts.required,
    });
    expect(getValidationResult({sel1: true})).toEqual({
      '.sel1': ValidationTexts.optionError,
    });
    expect(getValidationResult({sel1: 'foo', sel2: 'bar'})).toEqual({
      '.sel1': ValidationTexts.optionError,
      '.sel2': ValidationTexts.optionError,
    });


    formInstance.setModel({sel1: 'foo', sel2: 123, sel3: 'bar'});

    expect(formInstance.outputModel.value).toEqual({name: null, sel1: null, sel2: null});
    expect(formInstance.errors.value).toEqual({
      '.sel1': ValidationTexts.optionError,
      '.sel2': ValidationTexts.optionError,
    });

    options1.next([
      {label: 'var1', value: 'foo'},
      {label: 'var2', value: 'bar'},
    ]);

    expect(formInstance.outputModel.value).toEqual({name: null, sel1: 'foo', sel2: null});
    expect(formInstance.errors.value).toEqual({
      '.sel2': ValidationTexts.optionError,
    });

    options2.next([
      {label: 'var1', value: 'foo'},
      {label: 'var2', value: 'bar'},
    ]);

    expect(formInstance.outputModel.value).toEqual({name: null, sel1: 'foo', sel2: null});
    expect(formInstance.errors.value).toEqual({
      '.sel2': ValidationTexts.optionError,
    });

    options2.next([
      {label: 'var1', value: 'foo'},
      {label: 'var2', value: 'bar'},
      {label: 'var3', value: 123},
    ]);

    expect(formInstance.outputModel.value).toEqual({name: null, sel1: 'foo', sel2: 123});
    expect(formInstance.errors.value).toEqual({});

    options1.next([
      {label: 'var1', value: 'bar'},
    ]);

    expect(formInstance.outputModel.value).toEqual({name: null, sel1: null, sel2: 123});
    expect(formInstance.errors.value).toEqual({
      '.sel1': ValidationTexts.optionError,
    });

    formInstance.setModel({sel1: 'bar', sel2: 123});

    expect(formInstance.outputModel.value).toEqual({name: null, sel1: 'bar', sel2: 123});
    expect(formInstance.errors.value).toEqual({});

  });


  it('Set Value on Selection Async', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    const options1 = new BehaviorSubject<FormDefElementSelectOption[]>([]);

    formDefinition = {
      name: {caption: null, type: 'text'},
      sel1: {
        type: 'selection',
        caption: 'SelectValue',
        required: true,
        options: options1,
      },
    };
    formInstance = new GenericFormInstance(formDefinition);


    formInstance.setModel({});

    expect(formInstance.outputModel.value).toEqual({name: null, sel1: null});
    expect(formInstance.errors.value['.sel1']).toEqual(ValidationTexts.required);

    formInstance.setValue('.sel1', 234);
    expect(formInstance.outputModel.value).toEqual({name: null, sel1: null});
    expect(formInstance.errors.value['.sel1']).toEqual(ValidationTexts.optionError);

    options1.next([
      {label: 'var1', value: 'foo'},
      {label: 'var2', value: 'bar'},
    ]);
    expect(formInstance.outputModel.value).toEqual({name: null, sel1: null});
    expect(formInstance.errors.value['.sel1']).toEqual(ValidationTexts.optionError);

    options1.next([
      {label: 'var1', value: 'foo'},
      {label: 'var2', value: 'bar'},
      {label: 'var3', value: 234},
    ]);
    expect(formInstance.outputModel.value).toEqual({name: null, sel1: 234});
    expect(formInstance.errors.value['.sel1']).toEqual(undefined);
  });

});
