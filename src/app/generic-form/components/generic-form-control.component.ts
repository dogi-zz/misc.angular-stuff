import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ControlDef} from '../generic-form.component';
import {UiTexts} from '../generic-form.module';

@Component({
  selector: '[generic-form-control]',
  template: `
    <div class="form-by-def-add-button" *ngIf="control.element.type === 'object' && !(control.value$|async)">
      <button (mouseenter)="control.hover = 'add'" (mouseleave)="control.hover = null"
              (click)="clickAddObjectButton()">{{objectCreateText}}</button>
    </div>
    <div class="form-by-def-add-button" *ngIf="control.element.type === 'array' && !(control.value$|async)">
      <button (mouseenter)="control.hover = 'add'" (mouseleave)="control.hover = null"
              (click)="clickAddArrayButton()">{{arrayCreateText}}</button>
    </div>


    <div class="form-by-def-input-div"
         generic-form-input [control]="control" (inputValue)="inputValue.emit($event)">
    </div>

    <div class="form-by-def-error" *ngIf="control.error && control.element.type !== 'object'">{{control.error}}</div>

    <div class="form-by-def-remove-button" *ngIf="control.element.type === 'object' && !control.element.required && (control.value$|async)">
      <button (mouseenter)="control.hover = 'delete'" (mouseleave)="control.hover = null"
              (click)="clickRemoveObjectButton()">{{objectSetToNullText}}</button>
    </div>
    <div class="form-by-def-remove-button" *ngIf="control.element.type === 'array' && !control.element.required && (control.value$|async)">
      <button (mouseenter)="control.hover = 'delete'" (mouseleave)="control.hover = null"
              (click)="clickRemoveArrayButton()">{{arraySetToNullText}}</button>
    </div>
  `,
})
export class GenericFormControlComponent implements OnInit, OnChanges {

  public objectSetToNullText = UiTexts.objectSetToNull;
  public objectCreateText = UiTexts.objectCreate;
  public arraySetToNullText = UiTexts.arraySetToNull;
  public arrayCreateText = UiTexts.arrayCreate;

  @Input()
  public control: ControlDef & { hover?: 'delete' | 'add' };

  @Output()
  public inputValue = new EventEmitter<any>();

  constructor() {
  }

  public ngOnInit(): void {

  }

  public ngOnChanges(changes: SimpleChanges) {

  }


  public async onInput(control: ControlDef, value: any) {

  }

  public clickAddArrayButton() {
    this.control.hover = null;
    this.inputValue.emit([]);
  }


  public clickAddObjectButton() {
    this.control.hover = null;
    this.inputValue.emit({});
  }

  public clickRemoveArrayButton() {
    this.control.hover = null;
    this.inputValue.emit(null);
  }

  public clickRemoveObjectButton() {
    this.control.hover = null;
    this.inputValue.emit(null);
  }


}
