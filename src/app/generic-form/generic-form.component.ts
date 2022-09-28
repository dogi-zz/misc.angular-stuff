import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import * as _ from 'lodash';
import {BehaviorSubject, Subscription} from 'rxjs';
import {FormDefBaseElementCaption, FormDefElement, FormDefinition, FormDefInlineObject, FormModel, FormValidationResult} from './generic-form.data';
import {GenericFormCheckResult, getCheckedFormModelObservable, getValidationResult} from './generic-form.functions';

export type ControlDef = {
  key: string,
  path: string,
  element?: FormDefElement & FormDefBaseElementCaption,
  elementInline?: FormDefInlineObject,

  value$: BehaviorSubject<any>,
  valueIsString?: boolean,

  arrayElements?: (ControlDef & { hover?: 'delete' | 'add' })[],
  arrayMinMax?: [number, number],
};

@Component({
  selector: 'generic-form',
  template: `
    <div class="form-by-def">
      <div generic-form-form class="form-by-def-form" [formDef]="formDef" [internModel]="internCheckResult.model" [validationResult]="validationResult" (internModelChange)="onInput($event)"></div>
    </div>
  `,
})
export class GenericFormComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  public formDef: FormDefinition;

  @Input()
  public model: FormModel;

  @Output()
  public modelChange = new EventEmitter<any>();

  public internCheckResult: GenericFormCheckResult;

  public validationResult: FormValidationResult = {};
  public hasError = false;

  private updateStopped = false;
  private updateStoppedLoadInternModel = false;
  private updateCallback: () => void;

  private internModelSubscription: Subscription;
  private internModelTimeout: any;

  constructor() {
  }

  public ngOnInit(): void {
    this.internCheckResult = {model: _.cloneDeep(this.model), state: null};
    this.loadInternModel().then();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.model) {
      this.internCheckResult = {model: _.cloneDeep(this.model), state: null};
      this.loadInternModel().then();
    }
  }

  public ngOnDestroy() {
    this.internModelSubscription?.unsubscribe();
    clearTimeout(this.internModelTimeout);
  }

  public async onInput(internModel: any) {
    if (this.updateStopped) {
      this.validate();
      this.updateCallback = () => {
        this.onInput(internModel).then();
      };
      return;
    }
    this.internCheckResult.model = internModel;
    await this.loadInternModel();
  }

  public stopUpdate() {
    this.updateStopped = true;
  }

  public continueUpdate() {
    this.updateStopped = false;
    if (this.updateStoppedLoadInternModel) {
      this.updateStoppedLoadInternModel = false;
      this.loadInternModel().then();
    } else if (this.updateCallback) {
      this.updateCallback();
    }
    this.updateCallback = null;
  }


  private async loadInternModel() {
    if (this.updateStopped) {
      this.updateStoppedLoadInternModel = true;
      return;
    }
    this.internModelSubscription?.unsubscribe();
    clearTimeout(this.internModelTimeout);
    this.internModelTimeout = setTimeout(async () => {
      this.internModelSubscription = await getCheckedFormModelObservable(this.formDef, this.internCheckResult.model, this.internCheckResult.state).subscribe(checkResult => {
        clearTimeout(this.internModelTimeout);
        this.internModelTimeout = setTimeout(() => {
          this.modelChange.emit(checkResult.model);
          this.internCheckResult = checkResult;
          this.validate();
        });
      });
    });
  }

  private validate() {
    this.validationResult = getValidationResult('', this.formDef, this.internCheckResult.model, this.internCheckResult.state);
    this.hasError = Object.keys(this.validationResult).length > 0;
  }


}


