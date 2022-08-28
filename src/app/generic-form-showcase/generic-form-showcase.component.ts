import {Component, OnInit} from '@angular/core';
import * as _ from 'lodash';
import {AppComponent} from '../app.component';
import {FormDefinition} from '../generic-form/generic-form.data';
import {formDef1, model1} from './generic-form-definitions-1';
import {formDef2, model2} from './generic-form-definitions-2';

const formDefinitions: { [formKey: string]: { form: FormDefinition, model: any } } = {
  form1: {form: formDef1, model: model1},
  form2: {form: formDef2, model: model2},
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
  public model_string: string = 'null';

  public editMode = false;
  public formDefJson: string;
  public modelJson: string;
  public editError: string;

  constructor(
    public appComponent: AppComponent,
  ) {
  }

  public ngOnInit(): void {
    const params = this.appComponent.getParams();
    this.setForm(params.form || 'form1');
  }

  public modelChange(event: any) {
    this.model_result = event;
    this.model_string = JSON.stringify(this.model_result, null, 2);
  }

  private setForm(formKey: string) {
    this.formKey = formKey;
    const formDefinition = formDefinitions[this.formKey];
    this.formDef = formDefinition.form;
    this.model = _.cloneDeep(formDefinition.model);
    this.model_result = this.model;
    this.model_string = JSON.stringify(this.model_result, null, 2);
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
      } catch (e){
        this.editError = e.message;
      }
    } else {
      this.formDefJson = JSON.stringify(this.formDef, null, 2);
      this.modelJson = JSON.stringify(this.model, null, 2);
      this.editMode = true;
    }
  }
}
