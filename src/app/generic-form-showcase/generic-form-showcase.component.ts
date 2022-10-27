import {Component, OnInit} from '@angular/core';
import * as _ from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {AppComponent} from '../app.component';
import {FormDefinition} from '../generic-form/generic-form.data';
import {formDef1, model1} from './generic-form-definitions-1';
import {formDef2, model2} from './generic-form-definitions-2';
import {formDef3, model3} from './generic-form-definitions-3';
import {formDef4, formDef4Options, model4} from './generic-form-definitions-4';

const formDefinitions: { [formKey: string]: { form: FormDefinition, model: any } } = {
  form1: {form: formDef1, model: model1},
  form2: {form: formDef2, model: model2},
  form3: {form: formDef3, model: model3},
  form4: {form: formDef4, model: model4},
};


@Component({
  selector: 'generic-form-showcase',
  templateUrl: './generic-form-showcase.component.html',
  styles: [
    `
      button.showcase {
        color: #fafafa;
        border: none;
        background: #1876d1;
        border-radius: 5px;
        padding: 5px 10px;
      }
    `,
  ],
})
export class GenericFormShowcaseComponent implements OnInit {

  public formDef = formDef1;
  public model = _.cloneDeep(model1);

  private formKey = 'form1';

  public width = 250;
  public model_result: any = null;
  public model_input_string: string = 'null';
  public model_string: string = 'null';

  public editMode = false;
  public formDefJson: string;
  public modelJson: string;
  public editError: string;

  public selectOptionsObservable: BehaviorSubject<{ label: string, value: any }[]>;
  public selectOptionsJson: string;

  constructor(
    public appComponent: AppComponent,
  ) {
  }

  public ngOnInit(): void {
    const params = this.appComponent.getParams();
    this.setForm(params.form || 'form1');
  }

  public modelChange(event: any) {
    console.info('modelChange', event);
    this.model_result = event;
    this.model_string = JSON.stringify(this.model_result, null, 2);
  }

  private setForm(formKey: string) {
    this.formKey = formKey;
    const formDefinition = formDefinitions[this.formKey];
    this.formDef = formDefinition.form;
    this.model = _.cloneDeep(formDefinition.model);
    this.model_input_string =  JSON.stringify(this.model, null, 2);

    this.model_result = this.model;
    this.model_string = JSON.stringify(this.model_result, null, 2);

    if (formKey === 'form4') {
      Object.entries(this.formDef).forEach(([key, value]) => {
        if (value.type === 'selection') {
          if (value.options as any === '{observable}') {
            this.selectOptionsObservable = new BehaviorSubject([]);
            this.selectOptionsJson = JSON.stringify(formDef4Options);
            value.options = this.selectOptionsObservable;
          }
        }
      });
    }

  }

  private setParam() {
    const params = this.appComponent.getParams();
    params.form = this.formKey;
    this.appComponent.setParams(params);

  }

  public changeForm(formKey: string) {
    this.setForm(formKey);
    this.setParam();
  }

  public toggleEdit() {
    if (this.editMode) {
      try {
        this.formDef = JSON.parse(this.formDefJson);
        this.model = JSON.parse(this.modelJson);
        this.editError = null;
        this.editMode = false;
      } catch (e) {
        this.editError = e.message;
      }
    } else {
      this.formDefJson = JSON.stringify(this.formDef, null, 2);
      this.modelJson = JSON.stringify(this.model, null, 2);
      this.editMode = true;
    }
  }

  public form3UpdateSelection(){
    this.selectOptionsObservable.next(JSON.parse(this.selectOptionsJson));
  }
}
