import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ControlDef} from '../generic-form.component';
import {FormDefElement, FormDefinition, FormModel, FormModelValue, FormValidationResult} from '../generic-form.data';

@Component({
  selector: '[generic-form-form]',
  template: `
    <ng-container *ngFor="let control of formData">

      <div class="form-by-def-control"
           [class.error]="validationResult[control.path]"
           [class.hovered]="control.hover"
           [class.hovered_add]="control.hover === 'add'"
           [class.hovered_delete]="control.hover === 'delete'"
           *ngIf="control.element">

        <div class="form-by-def-caption" [class.error]="validationResult[control.path]" *ngIf="control.element.caption">
          <div [title]="control.path">{{control.element.caption || control.key}}</div>
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
             [validationResult]="validationResult"
             (inputValue)="onInput(control, $event)">
        </div>
      </div>

      <div generic-form-form class="form-by-def-form form-by-def-form-inline"
           *ngIf="control.elementInline"
           [formDef]="control.elementInline.properties"
           [path]="control.path"
           [internModel]="(control.value$|async)"
           [validationResult]="validationResult"
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
  public path: string = '';

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
  }

  private buildForm() {
    this.formData = Object.entries(this.formDef || {}).map(([key, elementDef]) => this.getControlDefOfElement(key, elementDef));
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
          const subFd = this.getControlDefOfElement(`${ctrl.key}.${i}`, subType);
          ctrl.arrayElements.push(subFd);
          this.loadInternModelValue(subFd, arrayValue);
        }
      }
    }
  }


  public async onInput(control: ControlDef, value: any) {
    this.internModel[control.key] = value;
    this.internModelChange.emit(this.internModel);
  }


  private getControlDefOfElement(key: string, elementDef: FormDefElement) {
    return {
      key, path: `${this.path}.${key}`,
      value: null, value$: new BehaviorSubject<any>(null),
      element: elementDef.type !== 'object' || !elementDef.inline ? elementDef : null as any,
      elementInline: elementDef.type === 'object' && elementDef.inline ? elementDef : null as any,
    } as ControlDef;
  }

}
