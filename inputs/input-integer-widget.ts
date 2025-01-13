import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {GenericFormComponentBase} from '../components/generic-form-component.base';
import {WidgetControl} from '../components/generic-form-component.data';
import {isNotEmpty} from '../tools/generic-form-object-functions';
import {UiConverter, UiConverters} from '../generic-form-commons';
import {FormDefElementInteger} from '../generic-form-definition';
import {GenericFormComponent} from '../generic-form.component';

const NUMBER_KEYS = ['.', ',', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Backspace', 'Delete'];

@Component({
  selector: '[app-input-integer-widget]',
  template: `
    <div class="input-wrapper">
      <input type="text" [(ngModel)]="valueString" (keydown)="numberKeyDown($event)"
             (focus)="control.onFocus()" (blur)="control.onBlur()"
             (ngModelChange)="onInput()"/>
      <div>
        <button (click)="numberAdd(1)" tabindex="-1"></button>
        <button (click)="numberAdd(-1)" tabindex="-1"></button>
      </div>
    </div>
  `,
})
export class InputIntegerWidget extends GenericFormComponentBase {


  @Input()
  public control: WidgetControl;

  public value: any;
  public valueString: any;

  private uiConverter: UiConverter;


  constructor(
    genericFormComponent: GenericFormComponent,
    cd: ChangeDetectorRef,
  ) {
    super(genericFormComponent, cd);
  }

  private get def(): FormDefElementInteger {
    return this.control.def as FormDefElementInteger;
  }

  public override ngOnInit(): void {
    this.uiConverter = UiConverters[`integer`];
    super.ngOnInit();
  }

  public update() {
    this.value = this.formInstance.valueMap.getValue(this.control.path);
    this.valueString = this.uiConverter.toString(this.value);
  }

  public numberAdd(amount: number) {
    this.value = this.value || 0;
    this.value += amount;
    if (isNotEmpty(this.def.min) && this.value < this.def.min) {
      this.value = this.def.min;
    }
    if (isNotEmpty(this.def.max) && this.value > this.def.max) {
      this.value = this.def.max;
    }
    this.valueString = this.uiConverter.toString(this.value);
    this.onInput();
  }

  public numberKeyDown(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      this.onInput();
      return;
    }
    if (event.code === 'Tab') {
      this.control.onBlur();
    }
    if (!NUMBER_KEYS.includes(event.key) && !event.ctrlKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  public onInput() {
    const value: any = this.uiConverter.fromString(this.valueString);
    this.formInstance.setValue(this.control.path, value);
  }

}
