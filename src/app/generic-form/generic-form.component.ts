import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import * as _ from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {FormDefBaseElementCaption, FormDefElement, FormDefinition, FormDefInlineObject, FormModel, FormValidationResult, FormValidationResultValue} from './generic-form.data';
import {getCheckedFormModel, getValidationResult} from './generic-form.functions';

export type ControlDef = {
  key: string,
  element?: FormDefElement & FormDefBaseElementCaption,
  elementInline?: FormDefInlineObject,

  value$: BehaviorSubject<any>,
  error?: FormValidationResultValue,
  childError?: FormValidationResult,
  valueIsString?: boolean,

  arrayElements?: (ControlDef & { hover?: 'delete' | 'add'})[],
  arrayMinMax?: [number,number],
};

@Component({
  selector: 'generic-form',
  template: `
    <div class="form-by-def">
      <div generic-form-form class="form-by-def-form" [formDef]="formDef" [internModel]="internModel" [validationResult]="validationResult" (internModelChange)="onInput($event)"></div>
    </div>
  `,
})
export class GenericFormComponent implements OnInit, OnChanges {

  @Input()
  public formDef: FormDefinition;

  @Input()
  public model: FormModel;

  @Output()
  public modelChange = new EventEmitter<any>();

  public internModel: FormModel;
  public validationResult: FormValidationResult;
  public hasError = false;

  constructor() {
  }

  public ngOnInit(): void {
    this.loadInternModel().then();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.model) {
      this.loadInternModel().then();
    }
  }

  private async loadInternModel() {
    this.internModel = await getCheckedFormModel(this.formDef, this.model, true);
    await this.validate();
  }

  private async validate() {
    this.validationResult = await getValidationResult(this.formDef, this.internModel);
    this.hasError = Object.keys(this.validationResult).length > 0;
    console.info(_.cloneDeep(this.internModel), {validationResult: this.validationResult});
  }


  public async onInput(internModel: any) {
    this.internModel = internModel;
    await this.validate();
    this.modelChange.emit(await getCheckedFormModel(this.formDef, this.internModel, false));
  }

}


