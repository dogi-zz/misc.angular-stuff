import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {GenericFormComponentBase} from '../components/generic-form-component.base';
import {WidgetControl} from '../components/generic-form-component.data';
import {UiConverter, UiConverters} from '../generic-form-commons';
import {FormDefElementText} from '../generic-form-definition';
import {GenericFormComponent} from '../generic-form.component';

const NUMBER_KEYS = ['.', ',', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Backspace', 'Delete'];

@Component({
  selector: '[app-input-text-widget]',
  template: `
    <div class="input-wrapper">
      <input type="text" [(ngModel)]="valueString" (keydown)="textKeyDown($event)"
             (focus)="control.onFocus()" (blur)="control.onBlur()"
             (ngModelChange)="onInput()"/>
    </div>
  `,
})
export class InputTextWidget extends GenericFormComponentBase {


  @Input()
  public control: WidgetControl;

  public value: any;
  public valueString: string;

  private uiConverter: UiConverter;

  constructor(
    genericFormComponent: GenericFormComponent,
    cd: ChangeDetectorRef,
  ) {
    super(genericFormComponent, cd);

  }

  private get def(): FormDefElementText {
    return this.control.def as FormDefElementText;
  }

  public override ngOnInit(): void {
    this.uiConverter = UiConverters.text;
    super.ngOnInit();
  }


  public update() {
    this.value = this.formInstance.valueMap.getValue(this.control.path);
    this.valueString = this.uiConverter.toString(this.value);
  }


  public textKeyDown($event: KeyboardEvent) {
    if ($event.code === 'Enter') {
      this.onInput();
    }
  }

  public onInput() {
    const value: any = this.uiConverter.fromString(this.valueString);
    this.formInstance.setValue(this.control.path, value);
  }

}
