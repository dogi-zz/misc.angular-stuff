// tslint:disable:no-any

import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {GenericFormComponent} from '../generic-form.component';
import {FormDefArray, FormDefElement, FormDefinition, FormModel, FormModelValue, FormValidationResult} from '../generic-form.data';
import {formDefGetInlineProperties, formDefIsInline} from '../generic-form.functions';
import {ButtonControl, ControlDef} from './generic-form-component.data';

@Component({
  selector: '[generic-form-form]',
  template: `
    <ng-container *ngFor="let control of formData">
      <ng-container *ngIf="control.visible">
        <div class="generic-form-control"
             [class.error]="validationResult[control.path]"
             [class.hovered]="control.hover"
             [class.hovered_add]="control.hover === 'add'"
             [class.hovered_delete]="control.hover === 'delete'"

             [class.generic-form-control-text]="control.element.type === 'text'"
             [class.generic-form-control-number]="control.element.type === 'number'"
             [class.generic-form-control-integer]="control.element.type === 'integer'"
             [class.generic-form-control-boolean]="control.element.type === 'boolean'"
             [class.generic-form-control-selection]="control.element.type === 'selection'"
             [class.generic-form-control-object]="control.element.type === 'object'"
             [class.generic-form-control-array]="control.element.type === 'array'"

             [class.wide]="control.element.type === 'text' && control.element.layout === 'wide'"
             [class.empty]="control.valueIsEmpty"

             *ngIf="control.element">


          <app-generic-form-caption remove-wrapper
                                    cssClass="generic-form-caption-before-control" [layoutPosition]="'BeforeControl'"
                                    [control]="control" [isEmpty]="control.valueIsEmpty" [validationResult]="validationResult"></app-generic-form-caption>

          <div class="generic-form-content"
               generic-form-control
               [control]="control"
               [validationResult]="validationResult">
          </div>

          <app-generic-form-caption remove-wrapper
                                    cssClass="generic-form-caption-after-control" [layoutPosition]="'AfterControl'"
                                    [control]="control" [isEmpty]="control.valueIsEmpty" [validationResult]="validationResult"></app-generic-form-caption>

        </div>

        <div generic-form-form class="generic-form-form generic-form-form-inline"
             *ngIf="control.elementInline"
             [formDef]="control.elementInlineProperties"
             [path]="control.path"
             [internModel]="(control.value$|async)"
             [validationResult]="validationResult"></div>

      </ng-container>
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

  public formData: ControlDef[];

  constructor(
    private genericFormComponent: GenericFormComponent,
  ) {
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
    this.formData = [];
    this.buildFormFillFormData(this.formDef || {});
  }

  private buildFormFillFormData(formDefinition: FormDefinition) {
    Object.entries(formDefinition).forEach(([key, elementDef]) => {
      if (elementDef.type === 'subform') {
        this.buildFormFillFormData(elementDef.content);
      } else {
        const controlDefOfElement = this.getControlDefOfElement(key, elementDef);
        this.formData.push(controlDefOfElement);
        controlDefOfElement.visible = this.genericFormComponent.formInstance.visiblePaths[controlDefOfElement.path];
      }
    });
  }

  private loadInternModel() {
    this.formData.forEach(controlDef => {
      controlDef.visible = this.genericFormComponent.formInstance.visiblePaths[controlDef.path];
      this.loadInternModelValue(controlDef, this.internModel?.[controlDef.key]);
    });
  }

  private loadInternModelValue(controlDef: ControlDef, value: FormModelValue) {
    controlDef.value$.next(value);

    controlDef.valueIsString = false;
    controlDef.valueIsEmpty = false;

    if (controlDef.element?.type === 'text' || controlDef.element?.type === 'number') {
      controlDef.valueIsString = true;
    }
    if (controlDef.element?.type === 'object') {
      controlDef.valueIsEmpty = !value;
    }
    if (controlDef.element?.type === 'array') {
      controlDef.valueIsEmpty = !value;
      const arrayDef = controlDef.element;
      controlDef.arrayMinMax = [typeof arrayDef.minLength === 'number' ? arrayDef.minLength : -1, typeof arrayDef.maxLength === 'number' ? arrayDef.maxLength : -1];
      controlDef.arrayElements = [];
      controlDef.removeFromArrayButtonControls = [];
      if (value) {
        for (let i = 0; i < (value as FormModelValue[]).length; i++) {
          const arrayValue = (value as FormModelValue[])[i];
          const subType = arrayDef.elements;
          const subFd = this.getControlDefOfElement(`${controlDef.key}.${i}`, subType);
          subFd.calculatedCaption = `${i+1}.`;
          controlDef.arrayElements.push(subFd);
          this.loadInternModelValue(subFd, arrayValue);

          const idx = i;
          const removeItemButtonControl: ButtonControl = {
            action: () => {
              removeItemButtonControl.mouseLeave();
              this.genericFormComponent.deleteFromArray(controlDef.path, idx);
            },
            mouseEnter: () => subFd.hover = 'delete',
            mouseLeave: () => subFd.hover = null,
          };
          controlDef.removeFromArrayButtonControls.push(removeItemButtonControl);
        }
      }
      const addItemButtonControl: ButtonControl = {
        action: () => {
          addItemButtonControl.mouseLeave();
          this.addArrayElement(controlDef);
        },
        mouseEnter: () => controlDef.hover = 'add',
        mouseLeave: () => controlDef.hover = null,
      };
      controlDef.addToArrayButtonControl = addItemButtonControl;
    }
  }

  private getControlDefOfElement(key: string, elementDef: FormDefElement): ControlDef {
    return {
      key, path: `${this.path}.${key}`,
      value$: new BehaviorSubject<any>(null),
      element: !formDefIsInline(elementDef) ? elementDef : null as any,
      elementInline: formDefIsInline(elementDef) ? elementDef : null as any,
      elementInlineProperties: formDefGetInlineProperties(elementDef),
    };
  }

  public addArrayElement(controlDef: ControlDef) {
    const arrayDef = controlDef.element as FormDefArray;
    if (arrayDef.elements.type === 'array') {
      this.genericFormComponent.addToArray(controlDef.path, []);
    } else if (arrayDef.elements.type === 'object') {
      this.genericFormComponent.addToArray(controlDef.path, arrayDef.elements.required ? {} : null);
    } else {
      this.genericFormComponent.addToArray(controlDef.path, null);
    }
  }

}
