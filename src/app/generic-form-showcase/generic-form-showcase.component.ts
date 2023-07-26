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
import {formDef4, model4, optionObservables4, validationFunctions4} from './generic-form-definitions-4';
import {formDef5, model5} from './generic-form-definitions-5';

const formDefinitions: { [formKey: string]: { form: FormDefinition, model: any, optionObservables?: { path: string, jsonString: string }[], validationFunctions?: { path: string, functionString: string }[] } } = {
  form1: {form: formDef1, model: model1},
  form2: {form: formDef2, model: model2},
  form3: {form: formDef3, model: model3},
  form4: {form: formDef4, model: model4, optionObservables: optionObservables4, validationFunctions: validationFunctions4},
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

      .option-observables, .validation-functions {
        .title {
          margin: 10px 0;
          font-size: 12px;
          color: #8a9fad;
        }

        .optionsSet {
          margin: 10px 0;

          > div {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
          }

          .caption {
            width: 100px;
            font-size: 12px;
            color: #1876d1;
          }

          .input {
            color: #515C66;
            padding: 6px 7px;
            border: 1px solid #D7D8D9;
            border-radius: 3px;
            outline: none !important;
            font-family: monospace;

            &.path-input {
              width: 200px;
            }

            &.value-input {
              flex: 1;
            }
            &.function-input {
              flex: 1;
              height: 50px;
            }
          }
        }

        button {
          margin-left: 10px;
          color: #1876d1;
          line-height: 20px;
          height: 25px;
          border: 1px solid #D7D8D9;
          cursor: pointer;
        }
      }


    `,
  ],
})
export class GenericFormShowcaseComponent implements OnInit {

  public formDef = formDef1;
  public model = _.cloneDeep(model1);
  public optionObservables: { path: string, jsonString: string }[];
  public validationFunctions: { path: string, functionString: string }[];

  public formKey = null;

  public width = 250;
  public model_result: any = null;
  public model_input_string: string = 'null';
  public model_string: string = 'null';
  public isValid: boolean = null;

  public originalForm: any;
  public originalOptionObservables: { path: string, jsonString: string }[];
  public originalValidationFunctions: { path: string, functionString: string }[];
  // public canEdit = false;
  public editMode = false;
  public formDefJson: string;
  public modelJson: string;
  public editError: string;
  public editOptionObservables: { path: string, jsonString: string }[];
  public editOptionValidationFunctions: { path: string, functionString: string }[];


  private optionObservablesByPath: { [path: string]: BehaviorSubject<{ label: string, value: any }[]> } = {};

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
    if (keyChanged) {
      const {form, model, optionObservables, validationFunctions} = formDefinitions[this.formKey];
      this.setForm(form, model, optionObservables, validationFunctions);
    }
  }

  private setForm(form: any, model: any, optionObservables?: { path: string, jsonString: string }[], validationFunctions?: { path: string, functionString: string }[]) {
    this.originalForm = _.cloneDeep(form);
    this.originalOptionObservables = _.cloneDeep(optionObservables);
    this.originalValidationFunctions = _.cloneDeep(validationFunctions);

    this.formDef = _.cloneDeep(form);
    this.model = _.cloneDeep(model);
    this.optionObservables = _.cloneDeep(optionObservables);
    this.validationFunctions = _.cloneDeep(validationFunctions);

    this.model_result = this.model;
    this.model_input_string = JSON.stringify(this.model, null, 2);
    this.model_string = JSON.stringify(this.model_result, null, 2);


    this.optionObservablesByPath = {};
    (this.optionObservables || []).forEach(({path, jsonString}) => {
      if (!this.optionObservablesByPath[path]) {
        this.optionObservablesByPath[path] = new BehaviorSubject(JSON.parse(jsonString));
        const selection = formDefGetChildByPath(this.formDef, path);
        if (selection) {
          selection.options = this.optionObservablesByPath[path];
        }
      }
    });
    (this.validationFunctions || []).forEach(({path, functionString}) => {
      const formElement = formDefGetChildByPath(this.formDef, path);
      if (formElement) {
        formElement.validate = new Function('value', 'item', functionString);
      }
    });


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
    this.formDefJson = JSON.stringify(this.originalForm, null, 2);
    this.modelJson = JSON.stringify(this.model, null, 2);
    this.editOptionObservables = _.cloneDeep(this.originalOptionObservables);
    this.editOptionValidationFunctions = _.cloneDeep(this.originalValidationFunctions);
    this.editMode = true;
  }

  public applyEdit() {
    try {
      const form = JSON.parse(this.formDefJson);
      const model = JSON.parse(this.modelJson);
      const optionObservables = _.cloneDeep(this.editOptionObservables);
      const validationFunctions = _.cloneDeep(this.editOptionValidationFunctions);
      this.setForm(form, model, optionObservables, validationFunctions);
    } catch (e) {
      console.info(e, this)
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
    this.optionObservablesByPath[optionObservable.path].next(parsedString);
  }

  public editRemoveSelectionObservable(optionObservable: { path: string; jsonString: string }) {
    const index = this.editOptionObservables.findIndex(o => _.isEqual(o, optionObservable));
    if (index >= 0) {
      this.editOptionObservables.splice(index, 1);
    }
  }

  public addSelectionObservable() {
    this.editOptionObservables.push({path: '', jsonString: '[]'});
  }
  public editRemoveValidationFunction(optionObservable: { path: string; functionString: string }) {
    const index = this.editOptionValidationFunctions.findIndex(o => _.isEqual(o, optionObservable));
    if (index >= 0) {
      this.editOptionValidationFunctions.splice(index, 1);
    }
  }

  public addValidationFunction() {
    this.editOptionValidationFunctions.push({path: '', functionString: 'return value ? "The value must ot be empty" : null'});
  }

}
