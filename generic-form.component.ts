// tslint:disable:no-any

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, TrackByFunction, ViewChild} from '@angular/core';
import {SafeUrl} from '@angular/platform-browser';
import {BehaviorSubject, Subscription} from 'rxjs';
import {ButtonControl, ButtonType, WidgetControl} from './components/generic-form-component.data';
import {FormDefinition, FormModelObject} from './generic-form-definition';
import {FormUiItem, FormUiItemObject, FormUiItemPrimitiveItem, GenericFormInstance} from './generic-form-instance';
import {getJson} from "./tools/generic-form-object-functions";

@Component({
  selector: 'generic-form',
  template: `
    <div class="generic-form">
      <div generic-form-form class="generic-form-form" [uiItems]="actualUiItems"></div>
    </div>

    <ng-template #buttonCreateObject [typedTemplate]="buttonControlTypeTemplate" let-control>
      <img class="add-button" [src]="addButtonSource|async" (mouseenter)="control.mouseEnter()" (mouseleave)="control.mouseLeave()"
           (mousedown)="control.action()"/>
    </ng-template>

    <ng-template #buttonRemoveObject [typedTemplate]="buttonControlTypeTemplate" let-control>
      <img class="add-button" [src]="removeButtonSource|async" (mouseenter)="control.mouseEnter()" (mouseleave)="control.mouseLeave()"
           (mousedown)="control.action()"/>
    </ng-template>

    <ng-template #buttonAddToArray [typedTemplate]="buttonControlTypeTemplate" let-control>
      <img class="add-button" [src]="addToArraySource|async" (mouseenter)="control.mouseEnter()" (mouseleave)="control.mouseLeave()"
           (mousedown)="control.action()"/>
    </ng-template>

    <ng-template #buttonRemoveFromArray [typedTemplate]="buttonControlTypeTemplate" let-control>
      <img class="add-button" [src]="removeFromArraySource|async" (mouseenter)="control.mouseEnter()" (mouseleave)="control.mouseLeave()"
           (mousedown)="control.action()"/>
    </ng-template>


    <ng-template #inputSelect [typedTemplate]="widgetControlTypeTemplate" let-control>
      <div class="generic-form-input" app-input-selection-widget [control]="control"></div>
    </ng-template>

    <ng-template #inputBoolean [typedTemplate]="widgetControlTypeTemplate" let-control>
      <div class="generic-form-input" app-input-boolean-widget [control]="control"></div>
    </ng-template>

    <ng-template #inputInteger [typedTemplate]="widgetControlTypeTemplate" let-control>
      <div class="generic-form-input" app-input-integer-widget [control]="control"></div>
    </ng-template>

    <ng-template #inputNumber [typedTemplate]="widgetControlTypeTemplate" let-control>
      <div class="generic-form-input" app-input-number-widget [control]="control"></div>
    </ng-template>

    <ng-template #inputText [typedTemplate]="widgetControlTypeTemplate" let-control>
      <div class="generic-form-input" app-input-text-widget [control]="control"></div>
    </ng-template>

  `,
})
export class GenericFormComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('buttonCreateObject') public buttonCreateObject: TemplateRef<{ $implicit: ButtonControl }>;
  @ViewChild('buttonRemoveObject') public buttonRemoveObject: TemplateRef<{ $implicit: ButtonControl }>;
  @ViewChild('buttonAddToArray') public buttonAddToArray: TemplateRef<{ $implicit: ButtonControl }>;
  @ViewChild('buttonRemoveFromArray') public buttonRemoveFromArray: TemplateRef<{ $implicit: ButtonControl }>;

  @ViewChild('inputSelect') public inputSelect: TemplateRef<{ $implicit: WidgetControl }>;
  @ViewChild('inputBoolean') public inputBoolean: TemplateRef<{ $implicit: WidgetControl }>;
  @ViewChild('inputInteger') public inputInteger: TemplateRef<{ $implicit: WidgetControl }>;
  @ViewChild('inputNumber') public inputNumber: TemplateRef<{ $implicit: WidgetControl }>;
  @ViewChild('inputText') public inputText: TemplateRef<{ $implicit: WidgetControl }>;


  @Input()
  public formDef: FormDefinition;

  @Input()
  public model: FormModelObject;

  @Input()
  public getWidget: (element: FormUiItemPrimitiveItem) => TemplateRef<{ $implicit: WidgetControl }>;

  @Input()
  public getButton: (type: ButtonType) => TemplateRef<{ $implicit: ButtonControl }>;

  // @Input()
  // public getElementLayout: (control: ControlDef, isEmpty: boolean) => TemplateRef<ElementLayout>;

  public widgetControlTypeTemplate: { $implicit: WidgetControl };
  public buttonControlTypeTemplate: { $implicit: ButtonControl };

  @Input()
  public getAsset: (asset: string) => Promise<string | SafeUrl> = (image: string) => Promise.resolve(`./assets/generic-form/${image}`)

  @Output()
  public modelChange = new EventEmitter<any>();

  @Output()
  public validChange = new EventEmitter<boolean>();

  public formInstance: GenericFormInstance;

  public resolveWidget: (element: FormUiItemPrimitiveItem) => TemplateRef<{ $implicit: WidgetControl }>;
  public resolveButton: (type: ButtonType) => TemplateRef<{ $implicit: ButtonControl }>;

  public addButtonSource: Promise<string | SafeUrl>;
  public removeButtonSource: Promise<string | SafeUrl>;
  public addToArraySource: Promise<string | SafeUrl>;
  public removeFromArraySource: Promise<string | SafeUrl>;

  private formStateSubscription: Subscription;

  private updateStopped = false;

  public actualUiItems: FormUiItemObject;
  public viewChanged = new BehaviorSubject<void>(null);

  public entryTrackFormUiItem: TrackByFunction<{ key: string; item: FormUiItem }> = (index, item) => {
    if (item.item.type === 'input') {
      return getJson([item.key, item.item.type, item.item.inputType]);
    } else {
      return getJson([item.key, item.item.type]);
    }
  };

  public entryTrackUiItemEntry: TrackByFunction<{ item: FormUiItem }> = (index, item) => {
    if (item.item.type === 'input') {
      return getJson([item.item.type, item.item.inputType]);
    } else {
      return getJson([item.item.type]);
    }
  };

  public constructor() {
  }

  public ngOnInit(): void {
    this.addButtonSource = this.getAsset('add-button.svg');
    this.removeButtonSource = this.getAsset('remove-button.svg');
    this.addToArraySource = this.getAsset('add-to-array.svg');
    this.removeFromArraySource = this.getAsset('remove-from-array.svg');

    this.resolveWidget = (element: FormUiItemPrimitiveItem) => {
      if (this.getWidget) {
        return this.getWidget(element) || this.getDefaultWidget(element);
      } else {
        return this.getDefaultWidget(element);
      }
    };

    this.resolveButton = (type: ButtonType) => {
      if (this.getButton) {
        return this.getButton(type) || this.getDefaultButton(type);
      } else {
        return this.getDefaultButton(type);
      }
    };
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.formInstance?.unsubscribe();
    this.formStateSubscription?.unsubscribe();
    if (changes.formDef || changes.model) {
      this.formInstance = new GenericFormInstance(this.formDef, this.model);
      this.formStateSubscription = this.formInstance.updateState.subscribe(() => {
        if (!this.updateStopped) {
          this.fireUpdate();
        }
      });
    }
  }

  public ngOnDestroy() {
    this.formInstance?.unsubscribe();
    this.formStateSubscription?.unsubscribe();
  }

  // public wasCorrected(path: string, value: any) {
  //   return this.formInstance.wasCorrected(path, value);
  // }

  public stopUpdate() {
    this.updateStopped = true;
  }

  public continueUpdate() {
    this.updateStopped = false;
    this.fireUpdate();
  }

  private fireUpdate() {
    this.modelChange.emit(this.formInstance.outputModel);
    this.validChange.emit(this.formInstance.outputErrors.value.length === 0);
    this.actualUiItems = this.formInstance.uiItems;
    this.viewChanged.next();
  }


  private getDefaultWidget(element: FormUiItemPrimitiveItem): TemplateRef<{ $implicit: WidgetControl }> {
    if (element.inputType === 'selection') {
      return this.inputSelect;
    }
    if (element.inputType === 'boolean') {
      return this.inputBoolean;
    }
    if (element.inputType === 'integer') {
      return this.inputInteger;
    }
    if (element.inputType === 'number') {
      return this.inputNumber;
    }
    if (element.inputType === 'text') {
      return this.inputText;
    }
    return null;
  }

  private getDefaultButton(type: ButtonType):TemplateRef<{ $implicit: ButtonControl }> {
    if (type === 'CreateObject') {
      return this.buttonCreateObject;
    }
    if (type === 'RemoveObject') {
      return this.buttonRemoveObject;
    }
    if (type === 'CreateArray') {
      return this.buttonCreateObject;
    }
    if (type === 'RemoveArray') {
      return this.buttonRemoveObject;
    }
    if (type === 'AddToArray') {
      return this.buttonAddToArray;
    }
    if (type === 'RemoveFromArray') {
      return this.buttonRemoveFromArray;
    }
    return null;
  }


}


