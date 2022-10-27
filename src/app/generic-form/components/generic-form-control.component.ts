// tslint:disable:no-any

import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {GenericFormComponent} from '../generic-form.component';
import {FormValidationResult} from '../generic-form.data';
import {UiTexts} from '../generic-form.definitions';
import {ControlDef} from './generic-form-component.data';

@Component({
  selector: '[generic-form-control]',
  template: `

    <app-generic-form-button remove-wrapper
                             *ngIf="control.element.type === 'object' || control.element.type === 'array'"
                             cssClass="generic-form-button-before-input" [layoutPosition]="'BeforeInput'"
                             [control]="control" [isEmpty]="control.valueIsEmpty"></app-generic-form-button>

    <div class="generic-form-input-div"
         generic-form-input [isArrayElement]="isArrayElement" [control]="control" [validationResult]="validationResult"
    ></div>

    <app-generic-form-button remove-wrapper
                             *ngIf="control.element.type === 'object' || control.element.type === 'array'"
                             cssClass="generic-form-button-after-input" [layoutPosition]="'AfterInput'"
                             [control]="control" [isEmpty]="control.valueIsEmpty"></app-generic-form-button>
  `,
})
export class GenericFormControlComponent implements OnInit, OnChanges {

  public objectSetToNullText = UiTexts.objectSetToNull;
  public arraySetToNullText = UiTexts.arraySetToNull;
  public arrayCreateText = UiTexts.arrayCreate;

  @Input()
  public control: ControlDef;

  @Input()
  public validationResult: FormValidationResult;

  @Input()
  public isArrayElement: boolean;

  constructor(
    private genericFormComponent: GenericFormComponent,
  ) {
  }

  public ngOnInit(): void {
  }

  public ngOnChanges(changes: SimpleChanges) {

  }



}
