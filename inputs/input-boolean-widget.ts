import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {GenericFormComponentBase} from '../components/generic-form-component.base';
import {WidgetControl} from '../components/generic-form-component.data';
import {FormDefElementBoolean} from '../generic-form-definition';
import {GenericFormComponent} from '../generic-form.component';

@Component({
  selector: '[app-input-boolean-widget]',
  template: `
    <div class="input-switch"
         [class.isTrue]="value===true"
         [class.isFalse]="value===false"
         (mousedown)="booleanClick()">
      <div></div>
    </div>
  `,
})
export class InputBooleanWidget extends GenericFormComponentBase {

  @Input()
  public control: WidgetControl;

  public value: boolean;

  constructor(
    genericFormComponent: GenericFormComponent,
    cd: ChangeDetectorRef,
  ) {
    super(genericFormComponent, cd);
  }

  private get def(): FormDefElementBoolean {
    return this.control.def as FormDefElementBoolean;
  }

  public update() {
    this.value = this.formInstance.valueMap.getValue(this.control.path);
  }

  public booleanClick() {
    if (this.value === true) {
      this.value = false;
    } else if (this.value === false && !this.def.required) {
      this.value = null;
    } else {
      this.value = true;
    }
    this.formInstance.setValue(this.control.path, this.value);
  }

}
