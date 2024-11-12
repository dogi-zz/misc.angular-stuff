// tslint:disable:no-any
//TODO: WEG
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {GenericFormComponent} from '../generic-form.component';
import {FormDefBaseElementRequired, FormValidationResult} from '../generic-form.data';
import {WidgetControl} from './generic-form-component.data';
import {FormDefElementInteger, FormDefElementNumber, FormDefElementSelect, FormDefPrimitiveType} from "../generic-form-definition";

@Component({
  selector: '[generic-form-input]',
  template: `
    <ng-container *ngIf="widgetTemplate">
      HIER
      <ng-container
        *ngTemplateOutlet="widgetTemplate; context:{$implicit: widgetControl}"></ng-container>
    </ng-container>


    <!--    <div app-generic-form-caption [isArrayElement]="isArrayElement"-->
    <!--                              cssClass="generic-form-caption-before-input" [layoutPosition]="'BeforeInput'"-->
    <!--                              [control]="control" [isEmpty]="control.valueIsEmpty" [validationResult]="validationResult"></div>-->

    <!--    &lt;!&ndash;  *ngIf="control.element.type === 'text'" &ndash;&gt;-->
    <!--    &lt;!&ndash;  *ngIf="control.element.type === 'number'" &ndash;&gt;-->
    <!--    &lt;!&ndash;  *ngIf="control.element.type === 'integer'" &ndash;&gt;-->
    <!--    &lt;!&ndash;  *ngIf="control.element.type === 'boolean'" &ndash;&gt;-->
    <!--    &lt;!&ndash;  *ngIf="control.element.type === 'selection'" &ndash;&gt;-->

    <!--    <div *ngIf="control.element.type === 'object'"-->
    <!--         class="generic-form-input-object">-->

    <!--      <div app-generic-form-caption  [layoutPosition]="'InsidePanel'"-->
    <!--                                [control]="control" [isEmpty]="control.valueIsEmpty" [validationResult]="validationResult"></div>-->

    <!--      <div app-generic-form-button  [layoutPosition]="'InsidePanel'"-->
    <!--                               [control]="control" [isEmpty]="control.valueIsEmpty"></div>-->

    <!--      <div generic-form-form class="generic-form-form" *ngIf="control.value$|async"-->
    <!--           [formDef]="control.element.properties"-->
    <!--           [path]="control.path"-->
    <!--           [internModel]="value"-->
    <!--           [validationResult]="validationResult"></div>-->
    <!--    </div>-->


    <!--    <div *ngIf="control.element.type === 'subform'"-->
    <!--         class="generic-form-input-subform">-->

    <!--      <div app-generic-form-caption [layoutPosition]="'InsidePanel'"-->
    <!--                                [control]="control" [validationResult]="validationResult"></div>-->


    <!--      <div generic-form-form class="generic-form-form"-->
    <!--           [formDef]="control.element.content"-->
    <!--           [path]="parentPath"-->
    <!--           [internModel]="value"-->
    <!--           [validationResult]="validationResult"></div>-->
    <!--    </div>-->

    <!--    <div *ngIf="control.element.type === 'array'"-->
    <!--         class="generic-form-input">-->


    <!--      <div app-generic-form-caption [layoutPosition]="'InsidePanel'"-->
    <!--                                [control]="control" [isEmpty]="control.valueIsEmpty" [validationResult]="validationResult"></div>-->

    <!--      <div app-generic-form-button [layoutPosition]="'InsidePanel'"-->
    <!--                               [control]="control" [isEmpty]="control.valueIsEmpty"></div>-->

    <!--      <div class="generic-form-input-array-item"-->
    <!--           *ngFor="let childControl of control.arrayElements; let idx = index;  trackBy:trackArrayElement"-->
    <!--           [attr.array-index]="idx"-->
    <!--           [class.error]="validationResult[childControl.path]"-->
    <!--           [class.hovered]="childControl.hover"-->
    <!--           [class.hovered_delete]="childControl.hover === 'delete'"-->
    <!--      >-->
    <!--        <div class="generic-form-content"-->
    <!--             generic-form-control-->
    <!--             [isArrayElement]="true"-->

    <!--             [class.generic-form-input-text]="childControl.element.type === 'text'"-->
    <!--             [class.generic-form-input-number]="childControl.element.type === 'number'"-->
    <!--             [class.generic-form-input-integer]="childControl.element.type === 'integer'"-->
    <!--             [class.generic-form-input-boolean]="childControl.element.type === 'boolean'"-->
    <!--             [class.generic-form-input-selection]="childControl.element.type === 'selection'"-->
    <!--             [class.generic-form-input-object]="childControl.element.type === 'object'"-->
    <!--             [class.generic-form-input-array]="childControl.element.type === 'array'"-->
    <!--             [class.wide]="childControl.element.type === 'text' && childControl.element.layout === 'wide'"-->
    <!--             [class.empty]="childControl.valueIsEmpty"-->

    <!--             [control]="childControl"-->
    <!--             [validationResult]="validationResult">-->

    <!--        </div>-->
    <!--        <div  class="generic-form-input-array-remove-button">-->
    <!--          <ng-container-->
    <!--            *ngTemplateOutlet="removeFromArrayButtonTemplate; context:{$implicit: control.removeFromArrayButtonControls[idx]}"></ng-container>-->
    <!--        </div>-->
    <!--      </div>-->

    <!--      <div *ngIf="value && (!control.arrayMinMax || control.arrayMinMax[1] < 0 || control.arrayElements.length < control.arrayMinMax[1])"-->
    <!--           class="generic-form-input-array-add-button">-->
    <!--        <ng-container-->
    <!--          *ngTemplateOutlet="addToArrayButtonTemplate; context:{$implicit: control.addToArrayButtonControl}"></ng-container>-->
    <!--      </div>-->

    <!--    </div>-->

    <!--    <div app-generic-form-caption [isArrayElement]="isArrayElement"-->
    <!--                              cssClass="generic-form-caption-after-input" [layoutPosition]="'AfterInput'"-->
    <!--                              [control]="control" [isEmpty]="control.valueIsEmpty" [validationResult]="validationResult"></div>-->

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericFormInputComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  public element: FormDefPrimitiveType;

  // @Input()
  // public isArrayElement: boolean;

  @Input()
  public path: string;


  public value: any;
  private valueSubscription: Subscription;

  private isInit = false;

  public widgetTemplate: TemplateRef<{ $implicit: WidgetControl }>;

  public widgetControl: WidgetControl;

  // public addToArrayButtonTemplate: TemplateRef<{$implicit: ButtonControl}>;
  // public removeFromArrayButtonTemplate: TemplateRef<{$implicit: ButtonControl}>;
  //

  private cdSubscription: Subscription;

  public constructor(
    public genericFormComponent: GenericFormComponent,
    private cd: ChangeDetectorRef,
  ) {
    console.info(this);
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

    this.cdSubscription = this.genericFormComponent.viewChanged.subscribe(() => this.cd.markForCheck());

    setTimeout(() => {
      this.isInit = true;
      this.update();
    });

  }

  public ngOnChanges(changes: SimpleChanges) {
    if (this.isInit) {
      if (changes.element) {
        this.update();
      }
    }
  }

  public ngOnDestroy() {
    this.valueSubscription?.unsubscribe();
  }

  private update() {
    if (!this.isInit) {
      return;
    }
    this.valueSubscription?.unsubscribe();

    this.widgetTemplate = this.genericFormComponent.resolveWidget(this.element);
    this.widgetControl.options = (this.element as FormDefElementSelect).options;
    this.widgetControl.required = (this.element as FormDefBaseElementRequired).required;
    this.widgetControl.min = (this.element as FormDefElementNumber | FormDefElementInteger).min;
    this.widgetControl.max = (this.element as FormDefElementNumber | FormDefElementInteger).max;

    this.valueSubscription = this.genericFormComponent.internModelChanged.subscribe(value => {
      this.value = this.genericFormComponent.formInstance.getValue(this.path);
      this.widgetControl.value = this.value;
      this.cd.markForCheck();
    });

    // const wasCorrected = this.genericFormComponent.wasCorrected(this.control.path, this.value);
    // if (wasCorrected) {
    //   this.genericFormComponent.setValue(this.control.path, this.value);
    // }

    // setTimeout(()=>{
    //   if (this.control.element.type === 'array'){
    //     let buttonData : {template: TemplateRef<{$implicit: ButtonControl}>, position: ButtonLayoutPosition};
    //     buttonData = this.genericFormComponent.resolveButton(this.control, 'AddToArray');
    //     this.addToArrayButtonTemplate = buttonData.template;
    //     buttonData = this.genericFormComponent.resolveButton(this.control, 'RemoveFromArray');
    //     this.removeFromArrayButtonTemplate = buttonData.template;
    //   } else {
    //     this.addToArrayButtonTemplate = null;
    //     this.removeFromArrayButtonTemplate = null;
    //   }
    //
    // });
    this.cd.markForCheck();
  }

  public onInput() {
    // this.genericFormComponent.setValue(this.control.path, this.value);
  }

  // Array


  public enterInputField() {
    this.genericFormComponent.stopUpdate();
  }

  public blurInputField() {
    this.genericFormComponent.continueUpdate();
  }

  // public trackArrayElement(index, element: ControlDef) {
  //   // return JSON.stringify([element.element, element.value$.value, element.path, element.key]);
  //   return false;
  // }
}
