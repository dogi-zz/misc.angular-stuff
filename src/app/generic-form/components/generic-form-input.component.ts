// tslint:disable:no-any

import {Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {GenericFormComponent} from '../generic-form.component';
import {FormDefArray, FormDefElementNotInline, FormDefElementInteger, FormDefElementNumber, FormDefElementSelect, FormValidationResult, FormDefBaseElementRequired} from '../generic-form.data';
import {UiTexts} from '../generic-form.definitions';
import {ButtonControl, ButtonLayoutPosition, ControlDef, WidgetControl} from './generic-form-component.data';

@Component({
  selector: '[generic-form-input]',
  template: `
    <app-generic-form-caption remove-wrapper
                              [isArrayElement]="isArrayElement"
                              cssClass="generic-form-caption-before-input" [layoutPosition]="'BeforeInput'"
                              [control]="control" [isEmpty]="control.valueIsEmpty" [validationResult]="validationResult"></app-generic-form-caption>

    <!--  *ngIf="control.element.type === 'text'" -->
    <!--  *ngIf="control.element.type === 'number'" -->
    <!--  *ngIf="control.element.type === 'integer'" -->
    <!--  *ngIf="control.element.type === 'boolean'" -->
    <!--  *ngIf="control.element.type === 'selection'" -->
    <ng-container *ngIf="widgetTemplate">
      <ng-container
        *ngTemplateOutlet="widgetTemplate; context:{$implicit: widgetControl}"></ng-container>
    </ng-container>

    <div *ngIf="control.element.type === 'object'"
         class="generic-form-input-object">

      <app-generic-form-caption remove-wrapper
                                cssClass="generic-form-caption-inside-panel" [layoutPosition]="'InsidePanel'"
                                [withButton]="!control.element.required && (control.value$|async)"
                                [control]="control" [isEmpty]="control.valueIsEmpty" [validationResult]="validationResult"></app-generic-form-caption>

      <app-generic-form-button remove-wrapper
                               cssClass="generic-form-button-inside-panel" [layoutPosition]="'InsidePanel'"
                               [control]="control" [isEmpty]="control.valueIsEmpty"></app-generic-form-button>

      <div class="generic-form-form" *ngIf="!(control.value$|async)">
        <!--        <app-generic-form-button remove-wrapper-->
        <!--                                 cssClass="generic-form-button-inside-panel" [layoutPosition]="'InsidePanel'"-->
        <!--                                 [control]="control" [isEmpty]="control.valueIsEmpty"></app-generic-form-button>-->
      </div>

      <div generic-form-form class="generic-form-form" *ngIf="control.value$|async"
           [formDef]="control.element.properties"
           [path]="control.path"
           [internModel]="value"
           [validationResult]="validationResult"></div>
    </div>


    <div *ngIf="control.element.type === 'array'"
         class="generic-form-input">


      <app-generic-form-caption remove-wrapper
                                cssClass="generic-form-caption-inside-panel" [layoutPosition]="'InsidePanel'"
                                [withButton]="!control.element.required && (control.value$|async)"
                                [control]="control" [isEmpty]="control.valueIsEmpty" [validationResult]="validationResult"></app-generic-form-caption>

      <app-generic-form-button remove-wrapper
                               cssClass="generic-form-button-inside-panel" [layoutPosition]="'InsidePanel'"
                               [control]="control" [isEmpty]="control.valueIsEmpty"></app-generic-form-button>

      <div class="generic-form-input-array-item"
           *ngFor="let childControl of control.arrayElements; let idx = index;  trackBy:trackArrayElement"
           [attr.array-index]="idx"
           [class.hovered]="childControl.hover"
           [class.hovered_delete]="childControl.hover === 'delete'"
      >
        <div class="generic-form-content"
             generic-form-control
             [isArrayElement]="true"

             [class.generic-form-input-text]="childControl.element.type === 'text'"
             [class.generic-form-input-number]="childControl.element.type === 'number'"
             [class.generic-form-input-integer]="childControl.element.type === 'integer'"
             [class.generic-form-input-boolean]="childControl.element.type === 'boolean'"
             [class.generic-form-input-selection]="childControl.element.type === 'selection'"
             [class.generic-form-input-object]="childControl.element.type === 'object'"
             [class.generic-form-input-array]="childControl.element.type === 'array'"
             [class.wide]="childControl.element.type === 'text' && childControl.element.layout === 'wide'"
             [class.empty]="childControl.valueIsEmpty"

             [control]="childControl"
             [validationResult]="validationResult">

        </div>
        <div  class="generic-form-input-array-remove-button">
          <ng-container
            *ngTemplateOutlet="removeFromArrayButtonTemplate; context:{$implicit: control.removeFromArrayButtonControls[idx]}"></ng-container>
        </div>
      </div>

      <div *ngIf="value && (!control.arrayMinMax || control.arrayMinMax[1] < 0 || control.arrayElements.length < control.arrayMinMax[1])"
           class="generic-form-input-array-add-button">
        <ng-container
          *ngTemplateOutlet="addToArrayButtonTemplate; context:{$implicit: control.addToArrayButtonControl}"></ng-container>
      </div>

    </div>

    <app-generic-form-caption remove-wrapper
                              [isArrayElement]="isArrayElement"
                              cssClass="generic-form-caption-after-input" [layoutPosition]="'AfterInput'"
                              [control]="control" [isEmpty]="control.valueIsEmpty" [validationResult]="validationResult"></app-generic-form-caption>

  `,
})
export class GenericFormInputComponent implements OnInit, OnChanges, OnDestroy {

  public addToArrayText = UiTexts.addToArray;
  public deleteFromArrayText = UiTexts.removeFromArray;

  @Input()
  public control: ControlDef;

  @Input()
  public validationResult: FormValidationResult;

  @Input()
  public isArrayElement: boolean;


  public value: any;
  private valueSubscription: Subscription;

  private isInit = false;

  public widgetTemplate: TemplateRef<ElementRef>;

  public widgetControl: WidgetControl;

  public addToArrayButtonTemplate: TemplateRef<ElementRef>;
  public removeFromArrayButtonTemplate: TemplateRef<ElementRef>;


  constructor(
    private genericFormComponent: GenericFormComponent,
  ) {
  }

  public ngOnInit(): void {
    this.widgetControl = {
      value: null,
      onFocus: () => {
        this.enterInputField();
      },
      onBlur: () => {
        this.blurInputField();
      },
      onInput: (value: any) => {
        this.value = value;
        this.onInput();
      },
    };

    setTimeout(() => {
      this.isInit = true;
      this.update().then();
    });

  }

  public ngOnChanges(changes: SimpleChanges) {
    if (this.isInit) {
      if (changes.control) {
        this.update().then();
      }
    }
  }

  public ngOnDestroy() {
    this.valueSubscription?.unsubscribe();
  }

  private async update() {
    if (!this.isInit) {
      return;
    }
    this.valueSubscription?.unsubscribe();

    this.widgetTemplate = this.genericFormComponent.resolveWidget(this.control);
    this.widgetControl.options = (this.control.element as FormDefElementSelect).options;
    this.widgetControl.required = (this.control.element as FormDefBaseElementRequired).required;
    this.widgetControl.min = (this.control.element as FormDefElementNumber | FormDefElementInteger).min;
    this.widgetControl.max = (this.control.element as FormDefElementNumber | FormDefElementInteger).max;

    this.valueSubscription = this.control.value$.subscribe(value => {
      this.value = value;
      this.widgetControl.value = value;
    });

    const wasCorrected = this.genericFormComponent.wasCorrected(this.control.path, this.value);
    if (wasCorrected) {
      this.genericFormComponent.setValue(this.control.path, this.value);
    }

    setTimeout(()=>{
      if (this.control.element.type === 'array'){
        let buttonData : {template: TemplateRef<ElementRef>, position: ButtonLayoutPosition};
        buttonData = this.genericFormComponent.resolveButton(this.control, 'AddToArray');
        this.addToArrayButtonTemplate = buttonData.template;
        buttonData = this.genericFormComponent.resolveButton(this.control, 'RemoveFromArray');
        this.removeFromArrayButtonTemplate = buttonData.template;
      } else {
        this.addToArrayButtonTemplate = null;
        this.removeFromArrayButtonTemplate = null;
      }

    });
  }

  public onInput() {
    this.genericFormComponent.setValue(this.control.path, this.value);
  }

  // Array



  public enterInputField() {
    this.genericFormComponent.stopUpdate();
  }

  public blurInputField() {
    this.genericFormComponent.continueUpdate();
  }

  public trackArrayElement(index, element: ControlDef) {
    return JSON.stringify([element.element, element.value$.value, element.path, element.key]);
  }
}
