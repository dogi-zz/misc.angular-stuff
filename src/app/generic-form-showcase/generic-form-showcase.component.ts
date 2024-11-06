// tslint:disable:no-any

import {Location} from '@angular/common';
import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';
import {BehaviorSubject, Subscription} from 'rxjs';
import {AppComponent} from '../app.component';
import {FormDefinition} from '../../../libs/generic-form/generic-form-definition';
import {formDef1, model1} from './generic-form-definitions-1';
import {formDef2, model2} from './generic-form-definitions-2';
import {formDef3, model3} from './generic-form-definitions-3';
import {asyncOptions4, formDef4, model4} from './generic-form-definitions-4';
import {formDef5, model5, validationFunctions5} from './generic-form-definitions-5';
import {resolveFormFromInput} from "./generic-form-showcare-helper";
import {GenericFormInstance} from "../../../libs/generic-form/generic-form-instance";
import {ObjectChecker, ObjectCheckerAny, ObjectCheckerArray, ObjectCheckerObject} from "../../../libs/json-parser/src/object-checker";
import {GenericFormComponent} from "../../../libs/generic-form/generic-form.component";


const CUSTOM_PARAMETER_PREFIX = "generic-form-custom.";


const formDefinitions: { [formKey: string]: { form: FormDefinition, model: any, asyncOptions?: { path: string, options: string[] }[], validationFunctions?: { path: string, functionString: string, time?: number }[] } } = {
  form1: {form: formDef1, model: model1},
  form2: {form: formDef2, model: model2},
  form3: {form: formDef3, model: model3},
  form4: {form: formDef4, model: model4, asyncOptions: asyncOptions4},
  form5: {form: formDef5, model: model5, validationFunctions: validationFunctions5},
  // form4: {form: formDef4, model: model4, optionObservables: optionObservables4, validationFunctions: validationFunctions4},
  // form5: {form: formDef5, model: model5},
};


export type FormData = {
  rawDef: string,
  formDef: FormDefinition,
  asyncOptions: { path: string, options: string[] }[],
  validationFunctions: { path: string, functionString: string, time?: number }[],
  inputModel: any,
};

export type ResolvedFormData = {
  formDefResolved: FormDefinition,
  optionObservables: { [path: string]: BehaviorSubject<{ label: string, value: any }[]> },
  validationFunctions: { [path: string]: { funcCode: string, time: number } },
  validationFunctionPaths?: string[],
}


type EditFormOption = { path: string, options: string, error: string, receivedString: string };


@Component({
  selector: 'generic-form-showcase',
  template: `
    <h1>Generic Form</h1>

    <div class="button-bar">
      <app-split-button [options]="options" [value]="formName" (valueChange)="navigateToForm($event)"></app-split-button>
      <span class="material-symbols-outlined" (click)="enterCustomFormName()">dashboard_customize</span>
    </div>


    <div class="generic-form-showcase">


      <div class="form-panel"
           [stay_right_of]="outputPanel"
           [stay_right_of_min_width]="400"
           [stay_right_of_gap]="10"
      >
        <generic-form *ngIf="resolvedFormData"
                      #genericForm
                      [formDef]="resolvedFormData.formDefResolved"
                      [model]="formData.inputModel"
                      (modelChange)="modelChange($event)"
                      (validChange)="validChange($event)"></generic-form>
      </div>

      <div class="option-panel"
           *ngIf="formData?.asyncOptions?.length"
           [stay_right_of]="outputPanel"
           [stay_right_of_min_width]="400"
           [stay_right_of_gap]="10"
      >
        <div class="option" *ngFor="let asyncOption of formData.asyncOptions" [attr.option_path]="asyncOption.path">
          <div class="option-path">{{ asyncOption.path }}</div>
          <div class="option-value"
               *ngFor="let options of asyncOption.options"
               [title]="options"
               (click)="setOptions(asyncOption.path, options)">
            {{ options }}
          </div>
        </div>
      </div>

      <div class="validation-panel"
           *ngIf="formData?.validationFunctions?.length"
           [stay_right_of]="outputPanel"
           [stay_right_of_min_width]="400"
           [stay_right_of_gap]="30"
      >
        <div class="function" *ngFor="let path of resolvedFormData.validationFunctionPaths" [attr.function_path]="path">
          <div class="function-path">{{ path }}</div>
          <div class="function-value">
            <div class="code">
              <label>code</label>
              <input type="text" [(ngModel)]="resolvedFormData.validationFunctions[path].funcCode" (blur)="checkAfterEditValidation()">
            </div>
            <div class="timeout">
              <label>timeout</label>
              <input type="number" [(ngModel)]="resolvedFormData.validationFunctions[path].time" (blur)="checkAfterEditValidation()">
            </div>
          </div>
        </div>
      </div>

      <div class="form-panel"
           [stay_right_of]="outputPanel"
           [stay_right_of_min_width]="400"
           [stay_right_of_gap]="10"
      >
        <div class="toggle-button">
          <app-toggle-button label="edit form" [(value)]="editFormMode" (valueChange)="editModeChange($event)"></app-toggle-button>
          <app-toggle-button label="edit input" [(value)]="editInputMode" (valueChange)="editInputModeChange($event)"></app-toggle-button>
          <div class="error" *ngIf="editFormError">
            {{ editFormError }}
          </div>
        </div>
        <ng-container *ngIf="editFormMode">
          <div class="input-section">
            <h3>Form</h3>
            <json-editor [name]="'form'" [jsonString]="editFormDefJson"
                         (jsonStringChange)="onInputFormDef($event)"
                         (jsonParseError)="editFormError = $event"
            ></json-editor>
          </div>
          <div class="input-section" *ngIf="editFormOptions?.length">
            <h3>Async-Options</h3>
            <div class="option-panel">
              <div class="option-set" *ngFor="let editFormOptionSet of editFormOptions">
                <div>
                  <div class="label">Path:</div>
                  <div class="value">
                    <input type="text" [(ngModel)]="editFormOptionSet.path" (ngModelChange)="checkAfterEditForm()">
                  </div>
                </div>
                <div>
                  <div class="label">Values:</div>
                  <div class="value">
                    <json-editor [name]="'options'" [jsonString]="editFormOptionSet.options"
                                 (jsonStringChange)="onInputFormOptions(editFormOptionSet, $event)"
                                 (jsonParseError)="errorEditFormOptions(editFormOptionSet, $event)"></json-editor>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
        <json-editor *ngIf="editInputMode" [name]="'model'" [jsonString]="editInputModelJson" (jsonStringChange)="checkEditInput($event)"></json-editor>
      </div>

      <div class="output-panel" #outputPanel>
        <h2>Input:</h2>
        <pre [innerHTML]="model_input_string | prettyjson"></pre>
        <h2 [ngStyle]="{color: isValid ? 'green' : 'red'}">Output:</h2>
        <pre class="model-result" [innerHTML]="model_string | prettyjson"></pre>
      </div>

    </div>



  `,
  styleUrls: [
    './generic-form-showcase.component.less',
  ],
  encapsulation: ViewEncapsulation.None,

})
export class GenericFormShowcaseComponent implements OnInit, OnDestroy {

  @ViewChild('genericForm') private genericForm: GenericFormComponent


  public options: { label: string, value: string }[] = [
    {value: 'form1', label: 'Primitives'},
    {value: 'form2', label: 'Objects'},
    {value: 'form3', label: 'Arrays'},
    {value: 'form4', label: 'Async'},
    {value: 'form5', label: 'Validation'},
    // Conditions
  ];

  public formName = null;
  public formData: FormData;
  public resolvedFormData: ResolvedFormData;
//  public formDefRaw: string;

  public customFormName: string;


  public model_result: any = null;
  public model_input_string: string = 'null';
  public model_string: string = 'null';
  public isValid: boolean = null;


  public editFormMode = false;
  public editFormDefJson: string;
  public receivedFormDefJson: string;
  public editFormError: string;
  public editFormOptions: EditFormOption [];
  private checkFormTimeout: any;
  private validateFormTimeout: any;

  public editInputMode = false;
  public editInputModelJson: string;
  public editInputFormDefJson: string;


  private routeSubscription: Subscription;
  private parameterSubscription: Subscription;
  private setFormTimeout: any;

  public constructor(
    public appComponent: AppComponent,
    public route: ActivatedRoute,
    public router: Router,
    public location: Location,
    public el: ElementRef<HTMLElement>,
    public zone: NgZone,
  ) {
    console.info({el});
    (el.nativeElement as any)._component_ = this;
  }

  public ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.setFormByName(params.formName);
    });
    this.parameterSubscription = this.route.queryParams.subscribe(queryParams => {
      this.customFormName = queryParams.custom || '';
      if (this.customFormName?.length) {
        const localStorageData = window.localStorage.getItem(`${CUSTOM_PARAMETER_PREFIX}${this.customFormName}`);
        if (!localStorageData) {
          return;
        }
        try {
          const {formDef, inputModel, asyncOptions, validationFunctions} = JSON.parse(localStorageData);
          this.setForm(formDef, inputModel, asyncOptions, validationFunctions);

        } catch (e) {
          console.error(e);
        }
      }
    });


  }

  public ngOnDestroy() {
    this.routeSubscription.unsubscribe();
    this.parameterSubscription.unsubscribe();
  }

  public navigateToForm(formName: string) {
    this.closeEdit();
    if (this.formName !== formName) {
      this.router.navigate(['/form', formName]);
    }
  }

  public modelChange(event: any) {
    // tslint:disable-next-line:no-console
    console.info('modelChange', event);
    this.model_result = event;
    setTimeout(() => this.model_string = JSON.stringify(this.model_result, null, 2));
  }

  public validChange(event: boolean) {
    setTimeout(() => this.isValid = event);
  }

  // ==========================================================================
  // == SET FORM ==============================================================
  // ==========================================================================

  public setFormByName(formName: string) {
    this.closeEdit();
    const keyChanged = this.formName !== formName;
    this.formName = formName;
    if (!formName) {
      this.setForm({}, {}, [], []);
    } else if (keyChanged) {
      const {form, model, asyncOptions, validationFunctions} = formDefinitions[this.formName];
      this.setForm(form, model, asyncOptions, validationFunctions);
    }
  }

  private setForm(form: any, model: any, asyncOptions: { path: string, options: string[] }[], validationFunctions?: { path: string, functionString: string, time?: number }[]) {
    clearTimeout(this.setFormTimeout);
    this.setFormTimeout = setTimeout(() => {
      this.formData = {
        rawDef: JSON.stringify(form, null, 2),
        formDef: _.cloneDeep(form),
        inputModel: _.cloneDeep(model),
        validationFunctions: _.cloneDeep(validationFunctions),
        asyncOptions,
      };
      this.resolvedFormData = resolveFormFromInput(form);
      this.resolvedFormData.validationFunctionPaths = Object.keys(this.resolvedFormData.validationFunctions || {});
      console.info(this);
      console.info(this.formData);
      console.info(this.resolvedFormData);
      // this.resolvedFormData.validationFunctions.child_1

      if (validationFunctions) {
        Object.entries(this.resolvedFormData.validationFunctions).forEach(([path, functionDefinition]) => {
          const entry = validationFunctions.find(v => v.path === path);
          functionDefinition.funcCode = entry?.functionString || '';
          functionDefinition.time = entry?.time || 0;
        });
      }

      this.model_result = _.cloneDeep(model);
      this.model_input_string = JSON.stringify(model);
      this.model_string = JSON.stringify(this.model_result);

      // this.editError = null;
      // this.editMode = false;
    });


  }

  // ==========================================================================
  // == EDIT ==================================================================
  // ==========================================================================

  public closeEdit() {
    this.editFormMode = false;
    this.editFormDefJson = null;
    this.editInputMode = false;
    this.editInputModelJson = null;
  }

  public editModeChange(value: boolean) {
    if (value) {
      this.receivedFormDefJson = this.formData.rawDef;
      this.editFormDefJson = this.formData.rawDef;
      this.editFormOptions = _.cloneDeep(this.formData.asyncOptions || []).map(item => {
        const options = JSON.stringify(item.options.map(o => JSON.parse(o)), null, 2);
        return {...item, options, error: null, receivedString: null};
      });
      this.onInputFormDef(this.editFormDefJson);
    } else {
      this.receivedFormDefJson = null;
      this.editFormDefJson = null;
      this.editFormOptions = null;
    }
  }

  public editInputModeChange(value: boolean) {
    if (value) {
      this.editInputModelJson = JSON.stringify(this.formData.inputModel, null, 2);
      this.checkEditInput(this.editInputModelJson);
    } else {
      this.editInputModelJson = null;
    }
  }

  public onInputFormDef(jsonString: string) {
    this.receivedFormDefJson = jsonString;
    this.checkAfterEditForm();
  }


  public onInputFormOptions(editFormOptionSet: EditFormOption, jsonString: string) {
    try {
      const options = JSON.parse(jsonString);
      const optionChecker = new ObjectCheckerObject({label: 'string', value: ObjectCheckerAny});
      const objectChecker = new ObjectChecker(new ObjectCheckerArray(new ObjectCheckerArray(optionChecker)));
      if (objectChecker.check(options)) {
        editFormOptionSet.error = null;
      } else {
        editFormOptionSet.error = 'Enter Options in Format {label: string, value: any}[][]';
      }
    } catch (e) {
      editFormOptionSet.error = e.message;
    }
    if (!editFormOptionSet.error) {
      editFormOptionSet.receivedString = jsonString;
    }
    this.checkAfterEditForm();
  }

  public errorEditFormOptions(editFormOptionSet: EditFormOption, error: string) {
    editFormOptionSet.error = error;
    this.checkAfterEditForm();
  }

  public setValidationFunction(path: string, code: string) {
    console.info('setValidationFunction', path, code, this);
    this.zone.run(()=>{
      this.resolvedFormData.validationFunctions[path].funcCode = code;
      this.checkAfterEditValidation();
    })
  }

  public checkAfterEditValidation() {
    clearTimeout(this.validateFormTimeout);
    this.validateFormTimeout = setTimeout(() => {
      this.genericForm.formInstance.validate();
    });
  }

  public checkAfterEditForm() {
    clearTimeout(this.checkFormTimeout);
    clearTimeout(this.validateFormTimeout);
    this.checkFormTimeout = setTimeout(() => {
      this.editFormError = null;
      try {
        const resolved = resolveFormFromInput(JSON.parse(this.receivedFormDefJson));
        new GenericFormInstance(resolved.formDefResolved, this.formData.inputModel);

        for (const path of Object.keys(resolved.optionObservables)) {
          const optionSet = this.editFormOptions.find(o => o.path === path);
          if (!optionSet) {
            const options: EditFormOption = {path, options: '[\n]', error: null, receivedString: null};
            this.editFormOptions.push(options);
            return;
          }
        }

        this.editFormOptions = this.editFormOptions.filter(editFormOptionSet => {
          return resolved.optionObservables[editFormOptionSet.path] || JSON.parse(editFormOptionSet.options).length;
        });
        this.editFormOptions.forEach(editFormOptionSet => {
          const path = editFormOptionSet.path;
          if (!path?.length) {
            this.editFormError = this.editFormError || 'option-set without Path!';
          } else if (!resolved.optionObservables[path]) {
            this.editFormError = this.editFormError || `option-set for unknown path: ${path}`;
          } else if (!JSON.parse(editFormOptionSet.options).length) {
            this.editFormError = this.editFormError || `option-set is empty in path ${path}`;
          } else if (editFormOptionSet.error) {
            this.editFormError = this.editFormError || `option-set error in path ${path}: ${editFormOptionSet.error}`;
          }
        });

      } catch (e) {
        this.editFormError = e.message;
      }
    });
    if (!this.editFormError) {
      const formDef = JSON.parse(this.receivedFormDefJson);
      const asyncOptions: { path: string, options: string[] }[] = this.editFormOptions.map(({path, options, receivedString}) => ({path, options: JSON.parse(receivedString || options).map(o => JSON.stringify(o))}));
      const validationFunctions: { path: string, functionString: string, time: number }[] = Object.entries(this.resolvedFormData.validationFunctions || []).map(([path, value]) => {
        return {path, functionString: value.funcCode, time: value.time || 0};
      });
      const inputModel = this.formData.inputModel;
      this.setForm(JSON.parse(this.receivedFormDefJson), inputModel, asyncOptions, validationFunctions);
      if (this.customFormName?.length) {
        const saveData = {formDef, inputModel, asyncOptions, validationFunctions};
        window.localStorage.setItem(`${CUSTOM_PARAMETER_PREFIX}${this.customFormName}`, JSON.stringify(saveData));
      }
    }
  }


  public checkEditInput(jsonString: string) {
    try {
      const formDef = this.formData.formDef;
      const asyncOptions = this.formData.asyncOptions;
      const validationFunctions = this.formData.validationFunctions;
      const inputModel = JSON.parse(jsonString);
      this.setForm(formDef, inputModel, asyncOptions, validationFunctions);
      if (this.customFormName?.length) {
        const saveData = {formDef, inputModel, asyncOptions};
        window.localStorage.setItem(`${CUSTOM_PARAMETER_PREFIX}${this.customFormName}`, JSON.stringify(saveData));
      }
    } catch (e) {
      this.editFormError = e.message;
    }
  }

  public setOptions(path: string, options: string) {
    this.resolvedFormData.optionObservables[path].next(JSON.parse(options));
  }

  public enterCustomFormName() {
    this.router.navigate([], {relativeTo: this.route, queryParams: {custom: window.prompt('Custom Name?')}, queryParamsHandling: "merge"});
  }
}
