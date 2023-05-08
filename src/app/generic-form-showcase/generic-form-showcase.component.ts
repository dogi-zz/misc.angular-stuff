import {Location} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {BehaviorSubject, Subscription} from 'rxjs';
import {AppComponent} from '../app.component';
import {FormDefinition} from '../generic-form/generic-form.data';
import {formDef1, model1} from './generic-form-definitions-1';
import {formDef2, model2} from './generic-form-definitions-2';
import {formDef3, model3} from './generic-form-definitions-3';
import {formDef4, formDef4Options1, formDef4Options2, model4} from './generic-form-definitions-4';
import {formDef5, model5} from './generic-form-definitions-5';

const formDefinitions: { [formKey: string]: { form: FormDefinition, model: any } } = {
  form1: {form: formDef1, model: model1},
  form2: {form: formDef2, model: model2},
  form3: {form: formDef3, model: model3},
  form4: {form: formDef4, model: model4},
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

  public asyncFormOptionsObservable: BehaviorSubject<{ label: string, value: any }[]>;
  public selectOptionsJson1: string;
  public selectOptionsJson2: string;

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
      if (this.formKey !== params.form) {
        this.setForm(params.form || 'form1');
      }
      if (params.edit) {
        this.setEditMode();
      } else {
        this.unsetEditMode();
      }
    });
  }

  public modelChange(event: any) {
    console.info('modelChange', event);
    this.model_result = event;
    this.model_string = JSON.stringify(this.model_result, null, 2);
  }

  public validChange(event: boolean) {
    this.isValid = event;
  }

  private setForm(formKey: string) {
    this.formKey = formKey;
    const formDefinition = formDefinitions[this.formKey];
    this.formDef = formDefinition.form;
    this.model = _.cloneDeep(formDefinition.model);
    this.model_input_string = JSON.stringify(this.model, null, 2);

    this.model_result = this.model;
    this.model_string = JSON.stringify(this.model_result, null, 2);

    this.canEdit = true;
    this.editError = null;
    this.editMode = false;

    this.asyncFormOptionsObservable = null;
    if (formKey === 'form4') {
      this.canEdit = false;
      Object.entries(this.formDef).forEach(([key, value]) => {
        if (value.type === 'selection') {
          if (value.options as any === '{observable}') {
            this.asyncFormOptionsObservable = new BehaviorSubject([]);
            this.selectOptionsJson1 = JSON.stringify(formDef4Options1);
            this.selectOptionsJson2 = JSON.stringify(formDef4Options2);
            value.options = this.asyncFormOptionsObservable;
          }
        }
      });
    }

  }


  public changeForm(formKey: string) {
    this.router.navigate([], {relativeTo: this.route, queryParams: {page: 'form', form: formKey}}).then();
  }

  public toggleEdit() {
    if (this.editMode) {
      this.applyEditMode();
      this.location.back();
    } else {
      this.router.navigate([], {relativeTo: this.route, queryParams: {page: 'form', form: this.formKey, edit: true}}).then();
    }
  }

  public setEditMode() {
    this.formDefJson = JSON.stringify(this.formDef, null, 2);
    this.modelJson = JSON.stringify(this.model, null, 2);
    this.editMode = true;
  }

  public applyEditMode() {
    try {
      this.formDef = JSON.parse(this.formDefJson);
      this.model = JSON.parse(this.modelJson);
      this.editError = null;
      this.editMode = false;
    } catch (e) {
      this.editError = e.message;
    }
  }

  public unsetEditMode() {
    this.formDefJson = null;
    this.modelJson = null;
    this.editMode = false;

  }

  public cancelEdit() {
    this.editError = null;
    this.editMode = false;
  }

  public form3UpdateSelection(optionsString: string) {
    this.asyncFormOptionsObservable.next(JSON.parse(optionsString));
  }
}
