import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {UiConverter, UiConverters} from '../generic-form.definitions';

const NUMBER_KEYS = ['.', ',', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Backspace', 'Delete'];

@Component({
  selector: '[app-input-integer-widget]',
  template: `
    <div class="input-wrapper">
      <input type="text" [(ngModel)]="valueString" (keydown)="numberKeyDown($event)"
             (focus)="onFocus.emit()" (blur)="onBlur.emit()"
             (ngModelChange)="onInput()"/>
      <div>
        <button (click)="numberAdd(1)" tabindex="-1"></button>
        <button (click)="numberAdd(-1)" tabindex="-1"></button>
      </div>
    </div>
  `,
})
export class InputIntegerWidget implements OnInit, OnChanges, OnDestroy {


  @Input() public value: any;
  @Input() public min: number;
  @Input() public max: number;

  @Output() public valueChange = new EventEmitter<any>();

  @Output() public onFocus = new EventEmitter<void>();
  @Output() public onBlur = new EventEmitter<void>();

  public valueString: any;

  private isInit = false;
  private uiConverter : UiConverter;

  constructor() {
  }

  public ngOnInit(): void {
    this.uiConverter = UiConverters.integer;

    this.isInit = true;
    this.valueChange.emit(this.value);
    this.update().then();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.options) {
      this.update().then();
    }
  }

  public ngOnDestroy() {
  }

  private async update() {
    if (!this.isInit) {
      return;
    }
    this.valueString = this.uiConverter.toString(this.value);
  }

  public numberAdd(amount: number) {
    this.value = this.value || 0;
    this.value += amount;
    if (this.min && this.value < this.min) {
      this.value = this.min;
    }
    if (this.max && this.value > this.max) {
      this.value = this.max;
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
      this.onBlur.emit();
    }
    if (!NUMBER_KEYS.includes(event.key) && !event.ctrlKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  public onInput() {
    const value: any = this.uiConverter.fromString(this.valueString);
    this.valueChange.emit(value);
  }

}
