// tslint:disable:no-any

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs';
import {ControlDef} from '../generic-form.component';
import {FormDefArray} from '../generic-form.data';
import {UiConverters, UiTexts} from '../generic-form.module';

const NUMBER_KEYS = ['.', ',', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Backspace', 'Delete'];

@Component({
  selector: '[generic-form-input]',
  template: `
    <div *ngIf="control.element.type === 'text'"
         class="form-by-def-input">
      <input type="text" [(ngModel)]="valueString" (blur)="onInput()" (keydown)="textKeyDown($event)"/>
    </div>

    <div *ngIf="control.element.type === 'number'"
         class="form-by-def-input">
      <input type="text" [(ngModel)]="valueString" (keydown)="numberKeyDown($event)"
             (blur)="onInput()"/>
    </div>

    <div *ngIf="control.element.type === 'integer'"
         class="form-by-def-input">
      <div class="input-wrapper">
        <input type="text" [(ngModel)]="valueString" (keydown)="numberKeyDown($event)" (blur)="onInput()"/>
        <div>
          <button (click)="numberAdd(1)" tabindex="-1">▲</button>
          <button (click)="numberAdd(-1)" tabindex="-1">▼</button>
        </div>
      </div>
    </div>

    <div *ngIf="control.element.type === 'boolean'"
         class="form-by-def-input">
      <div [class.isTrue]="(control.value$|async)===true"
           [class.isFalse]="(control.value$|async)===false"
           (click)="booleanClick()">
        <div></div>
      </div>
    </div>

    <div *ngIf="control.element.type === 'selection'"
         class="form-by-def-input"
         app-input-selection-widget
         [(value)]="value" (valueChange)="onInput()" [options]="control.element.options">
    </div>


    <div *ngIf="control.element.type === 'array'"
         class="form-by-def-input">

      <div class="form-by-def-input-array-item"
           *ngFor="let childControl of control.arrayElements; let idx = index;"
           [class.hovered]="childControl.hover"
           [class.hovered_add]="childControl.hover === 'add'"
           [class.hovered_delete]="childControl.hover === 'delete'"
      >
        <div class="form-by-def-content"
             generic-form-control

             [class.form-by-def-input-text]="childControl.element.type === 'text'"
             [class.form-by-def-input-number]="childControl.element.type === 'number'"
             [class.form-by-def-input-integer]="childControl.element.type === 'integer'"
             [class.form-by-def-input-boolean]="childControl.element.type === 'boolean'"
             [class.form-by-def-input-selection]="childControl.element.type === 'selection'"
             [class.form-by-def-input-object]="childControl.element.type === 'object'"
             [class.form-by-def-input-array]="childControl.element.type === 'array'"
             [class.wide]="childControl.element.type === 'text' && childControl.element.layout === 'wide'"
             [class.empty]="(childControl.element.type === 'object' || childControl.element.type === 'array') && !(childControl.value$|async)"

             [control]="childControl"
             (inputValue)="onInputArray(idx, $event)">

        </div>
        <button class="form-by-def-input-array-delete-button"
                (mouseenter)="childControl.hover = 'delete'" (mouseleave)="childControl.hover = null"
                (click)="removeArrayElement(idx)">{{deleteFromArrayText}}</button>
      </div>

      <button *ngIf="value && (!control.arrayMinMax || control.arrayMinMax[0] < 0 || control.arrayElements.length < control.arrayMinMax[0])"
              class="form-by-def-input-array-add-button"
              (mouseenter)="control.hover = 'add'" (mouseleave)="control.hover = null"
              (click)="addArrayElement()">{{addToArrayText}}</button>

    </div>

    <div *ngIf="control.element.type === 'object'"
         class="form-by-def-input-object">
      <div generic-form-form class="form-by-def-form" *ngIf="control.value$|async" [formDef]="control.element.properties" [internModel]="value" [validationResult]="$any(control.error) || $any(control.childError)"
           (internModelChange)="onChildInput($event)"></div>
    </div>

  `,
})
export class GenericFormInputComponent implements OnInit, OnChanges, OnDestroy {

  public addToArrayText = UiTexts.addToArray;
  public deleteFromArrayText = UiTexts.removeFromArray;

  @Input()
  public control: ControlDef & { hover?: 'delete' | 'add' };

  @Output()
  public inputValue = new EventEmitter<any>();

  public value: any;
  public valueString: any;
  private valueSubscription: Subscription;

  private isInit = false;

  constructor() {
  }

  public ngOnInit(): void {
    this.isInit = true;
    this.update().then();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.update().then();
  }

  public ngOnDestroy() {
    this.valueSubscription?.unsubscribe();
  }

  private async update() {
    if (!this.isInit) {
      return;
    }
    this.valueSubscription?.unsubscribe();

    const uiConverter = UiConverters[this.control.element.type];
    this.valueSubscription = this.control.value$.subscribe(value => {
      this.value = value;
      if (uiConverter) {
        this.valueString = uiConverter.toString(this.value);
      }
    });

  }

  public onInput() {
    const uiConverter = UiConverters[this.control.element.type];
    const value: any = uiConverter ? uiConverter.fromString(this.valueString) : this.value;
    this.inputValue.emit(value);
  }

  public onChildInput(value: any) {
    this.inputValue.emit(value);
  }

  public onInputArray(idx: number, value: any) {
    //console.info(this.control)
    //this.control.arrayElements[idx].value$.next(value);
    this.control.value$.value[idx] = value;
    this.inputValue.emit(this.control.value$.value);
  }

  // Number

  public numberAdd(amount: number) {
    this.value = this.value || 0;
    this.value += amount;
    if (this.control.element.type === 'integer' && this.control.element.min && this.value < this.control.element.min) {
      this.value = this.control.element.min;
    }
    if (this.control.element.type === 'integer' && this.control.element.max && this.value > this.control.element.max) {
      this.value = this.control.element.max;
    }
    const uiConverter = UiConverters[this.control.element.type];
    this.valueString = uiConverter.toString(this.value);
    this.onInput();
  }

  public numberKeyDown(event: KeyboardEvent) {
    if (event.code === 'Enter'){
      this.onInput();
      return;
    }
    if (!NUMBER_KEYS.includes(event.key) && !event.ctrlKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  // Boolean

  public booleanClick() {
    if (this.control.element.type === 'boolean') {
      if (this.value === true) {
        this.value = false;
      } else if (this.value === false && !this.control.element.required) {
        this.value = null;
      } else {
        this.value = true;
      }
    }
    this.onInput();
  }

  // Array

  public addArrayElement() {
    const arrayDef = this.control.element as FormDefArray;
    if (arrayDef.elements.type === 'array') {
      this.value.push([]);
    } else if (arrayDef.elements.type === 'object') {
      this.value.push(arrayDef.elements.required ? {} : null);
    } else {
      this.value.push(null);
    }
    this.onInput();
  }

  public removeArrayElement(idx: number) {
    this.value.splice(idx, 1);
    this.onInput();
  }

  public textKeyDown($event: KeyboardEvent) {
    if ($event.code === 'Enter') {
      this.onInput();
    }
  }
}
