import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import * as _ from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {ControlDef} from '../generic-form.component';
import {FormDefElement, FormDefinition, FormModel, FormModelValue, FormValidationResult, FormValidationResultValue} from '../generic-form.data';
import {getCheckedFormModel} from '../generic-form.functions';

@Component({
  selector: '[generic-form-form]',
  template: `
    <ng-container *ngFor="let control of formData">

      <div class="form-by-def-control"
           [class.hovered]="control.hover"
           [class.hovered_add]="control.hover === 'add'"
           [class.hovered_delete]="control.hover === 'delete'"
           *ngIf="control.element">

        <div class="form-by-def-caption" [class.error]="control.error" *ngIf="control.element.caption">
          {{control.element.caption || control.key}}
          <div class="form-by-def-help" *ngIf="control.element.help"
               [title]="control.element.help">{{control.element.help}}</div>
        </div>

        <div class="form-by-def-content"
             generic-form-control
             [class.form-by-def-input-text]="control.element.type === 'text'"
             [class.form-by-def-input-number]="control.element.type === 'number'"
             [class.form-by-def-input-integer]="control.element.type === 'integer'"
             [class.form-by-def-input-boolean]="control.element.type === 'boolean'"
             [class.form-by-def-input-selection]="control.element.type === 'selection'"
             [class.form-by-def-input-object]="control.element.type === 'object'"
             [class.form-by-def-input-array]="control.element.type === 'array'"
             [class.wide]="control.element.type === 'text' && control.element.layout === 'wide'"
             [class.empty]="(control.element.type === 'object' || control.element.type === 'array') && !(control.value$|async)"

             [control]="control"
             (inputValue)="onInput(control, $event)">
        </div>
      </div>

      <div generic-form-form class="form-by-def-form form-by-def-form-inline"
           *ngIf="control.elementInline"
           [formDef]="control.elementInline.properties"
           [internModel]="(control.value$|async)"
           [validationResult]="$any(control.error)"
           (internModelChange)="onInput(control, $event)"></div>

    </ng-container>
  `,
})
export class GenericFormFormComponent implements OnInit, OnChanges {

  @Input()
  public formDef: FormDefinition;

  @Input()
  public internModel: FormModel;

  @Input()
  public validationResult: FormValidationResult;

  @Output()
  public internModelChange = new EventEmitter<any>();

  public formData: (ControlDef & { hover?: 'delete' | 'add' })[];

  constructor() {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.loadInternModel();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.formDef) {
      this.buildForm();
    }
    if (changes.internModel) {
      this.loadInternModel();
    }
    if (changes.validationResult) {
      this.applyValidationResult();
    }
  }

  private buildForm() {
    this.formData = Object.entries(this.formDef || {}).map(([key, elementDef]) => GenericFormFormComponent.getControlDefOfElement(key, elementDef));
    this.applyValidationResult();
  }

  private applyValidationResult() {
    this.formData.forEach(fd => this.applyValidationValueResult(fd, this.validationResult?.[fd.key]));
  }

  private applyValidationValueResult(control: ControlDef, validationResultValue: FormValidationResultValue) {
    if (control.element?.type === 'array') {
      if (validationResultValue && typeof validationResultValue === 'object' && validationResultValue.type === 'array') {
        control.error = validationResultValue.error;
        for (let i = 0; i < (control.arrayElements || []).length; i++) {
          const childFd = control.arrayElements[i];
          this.applyValidationValueResult(childFd, validationResultValue.value[i]);
        }
      } else {
        control.error = validationResultValue;
      }
    } else if (control.element?.type === 'object') {
      if (validationResultValue && typeof validationResultValue === 'object' && validationResultValue.type === 'object') {
        control.childError = validationResultValue.value;
      } else {
        control.error = validationResultValue;
      }
    } else {
      control.error = validationResultValue;
    }
  }

  private loadInternModel() {
    this.formData.forEach(ctrl => {
      this.loadInternModelValue(ctrl, this.internModel?.[ctrl.key]);
    });
  }

  private loadInternModelValue(ctrl: ControlDef, value: FormModelValue) {
    ctrl.value$.next(value);
    if (ctrl.element?.type === 'text' || ctrl.element?.type === 'number') {
      ctrl.valueIsString = true;
    }
    if (ctrl.element?.type === 'array') {
      const arrayDef = ctrl.element;
      ctrl.arrayElements = [];
      ctrl.arrayMinMax = [typeof arrayDef.minLength === 'number' ? arrayDef.minLength : -1, typeof arrayDef.maxLength === 'number' ? arrayDef.maxLength : -1];
      if (value) {
        for (let i = 0; i < (value as FormModelValue[]).length; i++) {
          const arrayValue = (value as FormModelValue[])[i];
          const subType = arrayDef.elements;
          const subFd = GenericFormFormComponent.getControlDefOfElement(`${i}`, subType);
          ctrl.arrayElements.push(subFd);
          this.loadInternModelValue(subFd, arrayValue);
        }
      }
    }
  }


  public async onInput(control: ControlDef, value: any) {
    this.internModel[control.key] = value;
    if (control.element.caption === 'Weight 1') {
      console.info('hier', value, _.cloneDeep(this.internModel));
    }
    this.internModel = await getCheckedFormModel(this.formDef, this.internModel, true);
    this.internModelChange.emit(this.internModel);
  }


  private static getControlDefOfElement(key: string, elementDef: FormDefElement) {
    return {
      key, value: null, value$: new BehaviorSubject<any>(null),
      element: elementDef.type !== 'object' || !elementDef.inline ? elementDef : null as any,
      elementInline: elementDef.type === 'object' && elementDef.inline ? elementDef : null as any,
    } as ControlDef;
  }

}
