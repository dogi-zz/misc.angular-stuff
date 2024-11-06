import {Component, EventEmitter, Input, Output} from '@angular/core';


@Component({
  selector: 'app-toggle-button',
  template: `
    <button class="toggle-button" [class.active]="value" (click)="toggle()">{{label}}</button>
  `,
  styles: [
    `
      @import (reference) "../../styles/includes";

      .toggle-button {
        .button-style();
        .button-style-active(~".active");
      }


    `,
  ],
})
export class AppToggleButtonComponent {

  @Input()
  public label: string;

  @Input()
  public value: boolean;

  @Output()
  public valueChange = new EventEmitter<boolean>();


  public toggle() {
    this.value = !this.value;
    this.valueChange.next(this.value);
  }
}
