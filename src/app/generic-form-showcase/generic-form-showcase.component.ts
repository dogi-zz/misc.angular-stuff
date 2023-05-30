// tslint:disable:no-any

import {Location} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {BehaviorSubject, Subscription} from 'rxjs';
import {AppComponent} from '../app.component';
import {FormDefinition} from '../generic-form/generic-form.data';
import {formDefGetChildByPath} from '../generic-form/generic-form.functions';
import {formDef1, model1} from './generic-form-definitions-1';
import {formDef2, model2} from './generic-form-definitions-2';
import {formDef3, model3} from './generic-form-definitions-3';
import {formDef4, model4, optionObservables4} from './generic-form-definitions-4';
import {formDef5, model5} from './generic-form-definitions-5';

const formDefinitions: { [formKey: string]: { form: FormDefinition, model: any, optionObservables?: { path: string, jsonString: string }[] } } = {
  form1: {form: formDef1, model: model1},
  form2: {form: formDef2, model: model2},
  form3: {form: formDef3, model: model3},
  form4: {form: formDef4, model: model4, optionObservables: optionObservables4},
  form5: {form: formDef5, model: model5},
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

  public formKey = 'form1';

  public width = 250;
  public model_result: any = null;
  public model_input_string: string = 'null';
  public model_string: string = 'null';
  public isValid: boolean = null;

  public canEdit = false;
  public editMode = false;
  public formDefJson: string;
  public modelJson: string;
  public editError: string;

  public selectOptionsJson1: string;
  public selectOptionsJson2: string;

  private optionObservablesByPath: { [path: string]: BehaviorSubject<{ label: string, value: any }[]> } = {};
  public optionObservables: { path: string, jsonString: string }[] = [];

  private routeSubscription: Subscription;

  constructor(
    public appComponent: AppComponent,
    public route: ActivatedRoute,
    public router: Router,
    public location: Location,
  ) {
  }

  public ngOnInit(): void {
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      this.setFormKey(params.form || 'form1');
    });
  }

  public modelChange(event: any) {
    // tslint:disable-next-line:no-console
    console.info('modelChange', event);
    this.model_result = event;
    this.model_string = JSON.stringify(this.model_result, null, 2);
  }

  public validChange(event: boolean) {
    this.isValid = event;
  }

  private setFormKey(formKey: string) {
    const keyChanged = this.formKey !== formKey;
    this.formKey = formKey;
    if (keyChanged){
      const {form, model, optionObservables} = formDefinitions[this.formKey];
      this.setForm(form, model, optionObservables);
    }
  }

  private setForm(form: any, model: any, optionObservables?: { path: string, jsonString: string }[]) {
    this.formDef = _.cloneDeep(form);
    this.model = _.cloneDeep(model);

    this.model_result = this.model;
    this.model_input_string = JSON.stringify(this.model, null, 2);
    this.model_string = JSON.stringify(this.model_result, null, 2);


    this.optionObservablesByPath = {};
    this.optionObservables = [];
    (optionObservables || []).forEach(({path, jsonString}) => {
      if (!this.optionObservables[path]) {
        this.optionObservables[path] = new BehaviorSubject(JSON.parse(jsonString));
        const selection = formDefGetChildByPath(this.formDef, path);
        if (selection) {
          selection.options = this.optionObservables[path];
        }
      }
      this.optionObservables.push({path, jsonString});
    });

    this.canEdit = true;
    this.editError = null;
    this.editMode = false;

  }


  public changeForm(formKey: string) {
    this.router.navigate([], {relativeTo: this.route, queryParams: {page: 'form', form: formKey}}).then();
  }

  public toggleEdit() {
    if (this.editMode) {
      this.applyEdit();
    } else {
      this.setEditMode();
    }
  }

  public setEditMode() {
    this.formDefJson = JSON.stringify(this.formDef, null, 2);
    this.modelJson = JSON.stringify(this.model, null, 2);
    this.editMode = true;
  }

  public applyEdit() {
    try {
      const form = JSON.parse(this.formDefJson);
      const model = JSON.parse(this.modelJson);
      this.setForm(form, model);
    } catch (e) {
      this.editError = e.message;
    }
  }

  public cancelEdit() {
    this.formDefJson = null;
    this.modelJson = null;
    this.editMode = false;
  }

  public formUpdateSelectionObservable(optionObservable: { path: string; jsonString: string }) {
    let parsedString;
    try {
      parsedString = JSON.parse(optionObservable.jsonString);
    } catch (e) {
      alert(`Error parsing JSON String: ${optionObservable.jsonString}`);
    }
    this.optionObservables[optionObservable.path].next(parsedString);
  }
}
