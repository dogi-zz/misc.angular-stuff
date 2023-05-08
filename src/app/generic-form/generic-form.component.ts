// tslint:disable:no-any

import {Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
import * as _ from 'lodash';
import {Subscription} from 'rxjs';
import {ButtonControl, ButtonLayoutPosition, ButtonType, ControlDef, ElementLayout, WidgetControl} from './components/generic-form-component.data';
import {GenericFormInstance} from './generic-form-instance';
import {FormDefinition, FormModel, FormValidationResult} from './generic-form.data';

@Component({
  selector: 'generic-form',
  template: `
    <div class="generic-form">
      <div generic-form-form class="generic-form-form" [formDef]="formDef" [internModel]="actualInternModel" [validationResult]="validationResult"></div>
    </div>

    <ng-template #buttonCreateObject [typedTemplate]="buttonControlTypeTemplate" let-control>
      <img class="add-button" src="./assets/generic-form/add-button.svg" (mouseenter)="control.mouseEnter()" (mouseleave)="control.mouseLeave()"
              (mousedown)="control.action()"/>
    </ng-template>

    <ng-template #buttonRemoveObject [typedTemplate]="buttonControlTypeTemplate" let-control>
      <img class="add-button" src="./assets/generic-form/remove-button.svg" (mouseenter)="control.mouseEnter()" (mouseleave)="control.mouseLeave()"
           (mousedown)="control.action()"/>
    </ng-template>

    <ng-template #buttonAddToArray [typedTemplate]="buttonControlTypeTemplate" let-control>
      <img class="add-button" src="./assets/generic-form/add-to-array.svg" (mouseenter)="control.mouseEnter()" (mouseleave)="control.mouseLeave()"
           (mousedown)="control.action()"/>
    </ng-template>

    <ng-template #buttonRemoveFromArray [typedTemplate]="buttonControlTypeTemplate" let-control>
      <img class="add-button" src="./assets/generic-form/remove-from-array.svg" (mouseenter)="control.mouseEnter()" (mouseleave)="control.mouseLeave()"
           (mousedown)="control.action()"/>
    </ng-template>


    <ng-template #inputSelect [typedTemplate]="widgetControlTypeTemplate" let-control>
      <div class="generic-form-input"
           app-input-selection-widget
           (onFocus)="control.onFocus()" (onBlur)="control.onBlur()" (valueChange)="control.onInput($event)"
           [value]="control.value"
           [options]="control.options">
      </div>
    </ng-template>

    <ng-template #inputBoolean [typedTemplate]="widgetControlTypeTemplate" let-control>
      <div class="generic-form-input"
           app-input-boolean-widget
           [required]="control.required"
           [value]="control.value" (valueChange)="control.onInput($event)">
      </div>
    </ng-template>

    <ng-template #inputInteger [typedTemplate]="widgetControlTypeTemplate" let-control>
      <div  class="generic-form-input"
            app-input-integer-widget
            [min]="control.min" [max]="control.max"
            (onFocus)="control.onFocus()" (onBlur)="control.onBlur()" (valueChange)="control.onInput($event)"
            [value]="control.value"
      >
      </div>
    </ng-template>

    <ng-template #inputNumber [typedTemplate]="widgetControlTypeTemplate" let-control>
      <div  class="generic-form-input"
            app-input-number-widget
            [min]="control.min" [max]="control.max"
            (onFocus)="control.onFocus()" (onBlur)="control.onBlur()" (valueChange)="control.onInput($event)"
            [value]="control.value"
      >
      </div>
    </ng-template>

    <ng-template #inputText [typedTemplate]="widgetControlTypeTemplate" let-control>
      <div  class="generic-form-input"
            app-input-text-widget
            (onFocus)="control.onFocus()" (onBlur)="control.onBlur()" (valueChange)="control.onInput($event)"
            [value]="control.value"
      >
      </div>
    </ng-template>

  `,
})
export class GenericFormComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('buttonCreateObject') public buttonCreateObject: TemplateRef<ElementRef>;
  @ViewChild('buttonRemoveObject') public buttonRemoveObject: TemplateRef<ElementRef>;
  @ViewChild('buttonAddToArray') public buttonAddToArray: TemplateRef<ElementRef>;
  @ViewChild('buttonRemoveFromArray') public buttonRemoveFromArray: TemplateRef<ElementRef>;

  @ViewChild('inputSelect') public inputSelect: TemplateRef<ElementRef>;
  @ViewChild('inputBoolean') public inputBoolean: TemplateRef<ElementRef>;
  @ViewChild('inputInteger') public inputInteger: TemplateRef<ElementRef>;
  @ViewChild('inputNumber') public inputNumber: TemplateRef<ElementRef>;
  @ViewChild('inputText') public inputText: TemplateRef<ElementRef>;


  @Input()
  public formDef: FormDefinition;

  @Input()
  public model: FormModel;

  @Input()
  public getWidget: (control: ControlDef) => TemplateRef<ElementRef>;

  @Input()
  public getButton: (control: ControlDef, type: ButtonType) => {template: TemplateRef<ElementRef>, position: ButtonLayoutPosition};

  @Input()
  public getElementLayout: (control: ControlDef, isEmpty: boolean) => TemplateRef<ElementLayout>;

  public widgetControlTypeTemplate: { $implicit: WidgetControl };
  public buttonControlTypeTemplate: { $implicit: ButtonControl };


  @Output()
  public modelChange = new EventEmitter<any>();
  public actualInternModel: any;
  public modelChangeSubject: any;

  @Output()
  public validChange = new EventEmitter<boolean>();

  public formInstance: GenericFormInstance;


  public validationResult: FormValidationResult = {};

  private isInitialised = false;
  private updateStopped = false;

  private outputModelSubscription: Subscription;
  private errorsSubscription: Subscription;

  public resolveElementLayout: (control: ControlDef, isEmpty: boolean) => ElementLayout;
  public resolveWidget: (control: ControlDef) => TemplateRef<ElementRef>;
  public resolveButton: (control: ControlDef, type: ButtonType) => {template: TemplateRef<ElementRef>, position: ButtonLayoutPosition};

  constructor() {
  }

  public ngOnInit(): void {
    this.isInitialised = true;

    this.resolveElementLayout = (control: ControlDef, isEmpty: boolean) => {
      const customLayout = this.getElementLayout ? this.getElementLayout(control, isEmpty) : {};
      return {...this.getDefaultElementLayout(control, isEmpty), ...customLayout};
    };

    this.resolveWidget = (control: ControlDef) => {
      if (this.getWidget) {
        return this.getWidget(control) || this.getDefaultWidget(control);
      } else {
        return this.getDefaultWidget(control);
      }
    };

    this.resolveButton = (control: ControlDef, type: ButtonType) => {
      if (this.getButton) {
        return this.getButton(control, type) || this.getDefaultButton(control, type);
      } else {
        return this.getDefaultButton(control, type);
      }
    };

    this.loadInternModel();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.formDef) {
      this.formInstance = new GenericFormInstance(this.formDef);
      this.updateModelSubscription();
    }
    if (changes.model) {
      this.loadInternModel();
    }
  }

  private updateModelSubscription() {
    this.outputModelSubscription?.unsubscribe();
    this.outputModelSubscription = this.formInstance.outputModel.subscribe(model => {
      if (!this.modelChangeSubject || !_.isEqual(this.modelChangeSubject, model)) {
        const clone = _.cloneDeep(model);
        this.modelChange.next(clone);
        this.modelChangeSubject = clone;
        if (!this.updateStopped) {
          this.actualInternModel = clone;
        }
      }
    });
    this.errorsSubscription?.unsubscribe();
    this.errorsSubscription = this.formInstance.errors.subscribe(errors => {
      this.validationResult = errors;
      setTimeout(()=>this.validChange.next(!Object.keys(errors).length));
    });
  }

  public ngOnDestroy() {
    // this.internModelSubscription?.unsubscribe();
    // clearTimeout(this.internModelTimeout);
  }

  public setValue(path: string, value: any) {
    this.formInstance.setValue(path, value);
  }

  public addToArray(path: string, value: any) {
    this.formInstance.addToArray(path, value);
  }

  public deleteFromArray(path: string, idx: number) {
    this.formInstance.deleteFromArray(path, idx);
  }

  // public wasCorrected(path: string, value: any) {
  //   return this.formInstance.wasCorrected(path, value);
  // }

  public stopUpdate() {
    this.updateStopped = true;
  }

  public continueUpdate() {
    this.updateStopped = false;
    this.actualInternModel = this.modelChangeSubject;
  }


  private loadInternModel() {
    if (!this.isInitialised) {
      return;
    }
    const workingModel = _.cloneDeep(this.model);
    this.formInstance.setModel(workingModel);
  }

  private getDefaultWidget(control: ControlDef): TemplateRef<ElementRef> {
    if (control.element.type === 'selection') {
      return this.inputSelect;
    }
    if (control.element.type === 'boolean') {
      return this.inputBoolean;
    }
    if (control.element.type === 'integer') {
      return this.inputInteger;
    }
    if (control.element.type === 'number') {
      return this.inputNumber;
    }
    if (control.element.type === 'text') {
      return this.inputText;
    }
    return null;
  }

  private getDefaultButton(control: ControlDef, type: ButtonType): {template: TemplateRef<ElementRef>, position: ButtonLayoutPosition} {
    if (type === 'CreateObject') {
      return {position: 'BeforeInput', template: this.buttonCreateObject};
    }
    if (type === 'RemoveObject') {
      return {position: 'InsidePanel', template: this.buttonRemoveObject};
    }
    if (type === 'CreateArray') {
      return {position: 'BeforeInput', template: this.buttonCreateObject};
    }
    if (type === 'RemoveArray') {
      return {position: 'InsidePanel', template: this.buttonRemoveObject};
    }
    if (type === 'AddToArray') {
      return {position:  null, template: this.buttonAddToArray};
    }
    if (type === 'RemoveFromArray') {
      return {position: null, template: this.buttonRemoveFromArray};
    }
    return null;
  }

  private getDefaultElementLayout(control: ControlDef, isEmpty: boolean): ElementLayout {
    if (control.element.type === 'object' && !isEmpty) {
      return {
        title: 'InsidePanel',
        help: 'InsidePanel',
        error: 'InsidePanel',
        arrayError: 'InsidePanel',
        removeButtonPosition: null,
      };
    }
    if (control.element.type === 'array' && !isEmpty) {
      return {
        title: 'InsidePanel',
        help: 'InsidePanel',
        error: 'InsidePanel',
        arrayError: 'InsidePanel',
        removeButtonPosition: null,
      };
    }
    return {
      title: 'BeforeControl',
      help: 'BeforeControl',
      error: 'BeforeControl',
      arrayError: 'AfterInput',
      removeButtonPosition: null,
    };
  }

}


