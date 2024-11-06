import {beforeEach, describe, expect, it} from '@jest/globals';
import {ValidationTexts} from '../../libs/generic-form/generic-form-commons';
import {FormDefinition} from '../../libs/generic-form/generic-form-definition';
import {GenericFormInstance} from '../../libs/generic-form/generic-form-instance';
import {fromUiItems} from './tools';
import {GenericFormModelInspector} from "../../libs/generic-form/tools/generic-form-model-inspector";
/* eslint  prefer-const: 0 */


describe(__filename, () => {

  beforeEach(async () => {

  });

  it('FormModelInspector', async () => {
    let inspector: GenericFormModelInspector;

    inspector = new GenericFormModelInspector({name: 'foo'});

    expect(inspector.value().name).toEqual('foo');
    expect(inspector.value().name2).toBeUndefined();


    inspector = new GenericFormModelInspector({name: 'foo', child: {name1: 'bar', num: 132, bol: true}});

    expect(inspector.value().name).toEqual('foo');
    expect((inspector.value().child as any).name1).toEqual('bar');
    expect((inspector.value().child as any).num).toEqual(132);
    expect((inspector.value().child as any).bol).toEqual(true);

    expect(() => inspector.value().name = 'bar').toThrow();
    expect(() => inspector.value().child.name1 = 'bar').toThrow();

    inspector = new GenericFormModelInspector({name: 'foo', child: {name1: 'bar', num: 132}, arr: [123, {posX: 1}]});

    expect(inspector.value().name).toEqual('foo');
    expect((inspector.value().arr as any)[0]).toEqual(123);
    expect((inspector.value().arr as any)[1].posX).toEqual(1);

    const inspector_array_1 = inspector.child('arr').child(1);

    expect(inspector_array_1.value()).toEqual( {posX: 1});
    expect(inspector_array_1.value().posX).toEqual(1);


    expect(inspector_array_1.parent().value()[0]).toEqual(123);
    expect(inspector_array_1.parent().value()).toEqual([123, {posX: 1}]);

    expect(inspector_array_1.parentValue()[0]).toEqual(123);
    expect(inspector_array_1.parentValue()).toEqual([123, {posX: 1}]);

    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      name: {caption: null, type: 'text'},
      position: {
        type: 'object',
        caption: null,
        required: true,
        properties: {
          posX: {caption: null, type: 'integer', required: true},
          posY: {caption: null, type: 'integer', required: true},
        },
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {name: 'foo', position: {posX: 1, posY: 2}});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
      position: {
        path: 'position', type: 'object', required: true, children: {
          posX: {path: 'position.posX', type: 'input', inputType: 'integer'},
          posY: {path: 'position.posY', type: 'input', inputType: 'integer'},
        },
      },
    });

    expect(formInstance.outputModel).toEqual({name: 'foo', position: {posX: 1, posY: 2}});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    inspector = formInstance.getInspector();
    expect(inspector.value().name).toEqual('foo');
    expect(inspector.value().position.posX).toEqual(1);
    expect(inspector.value().position.posY).toEqual(2);
    expect(inspector.value().position).toEqual({posX: 1, posY: 2});

    inspector = formInstance.getInspector(['position']);
   // console.info(inspector)
    expect(inspector.value().posX).toEqual(1);
    expect(inspector.value().posY).toEqual(2);
    expect(inspector.parentValue().name).toEqual('foo');

  });


  it('Validate Simple Members', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    formDefinition = {
      name: {caption: null, type: 'text'},
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
    });

    expect(formInstance.outputModel).toEqual({name: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});


    formDefinition = {
      name: {caption: null, type: 'text', required: true},
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
    });

    expect(formInstance.outputModel).toEqual({name: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'name': ValidationTexts.required,
    });

    formInstance.setValue(['name'], 'foo');
    expect(formInstance.outputModel).toEqual({name: 'foo'});
    expect(formInstance.outputErrors.value.export()).toEqual({});


    formDefinition = {
      name: {
        caption: null, type: 'text', validate: (value: any, parent: any) => {
          return 'hier';
        },
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {name: 'foo'});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
    });

    await new Promise(res => setTimeout(res, 10));
    expect(formInstance.outputModel).toEqual({name: 'foo'});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'name': 'hier',
    });



  });


});
