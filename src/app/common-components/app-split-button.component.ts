import {Component, EventEmitter, Input, Output} from '@angular/core';


@Component({
  selector: 'app-split-button',
  template: `
    <ul class="selector">
      <li *ngFor="let option of options"
          [class.active]="value === option.value"
          (click)="valueChange.emit(option.value)">{{ option.label }}
      </li>
    </ul>
  `,
  styles: [
    `
      @import (reference) "../../styles/includes";

      ul.selector {
        .button-style();
        display: inline-flex;
        color: inherit;
        overflow: hidden;
        list-style: none;
        padding: 0;

        li {
          padding: @button-padding;

          .button-style-active(~".active");
        }
      }


    `,
  ],
})
export class AppSplitButtonComponent {

  @Input()
  public options: { label: string, value: string }[];

  @Input()
  public value: string;

  @Output()
  public valueChange = new EventEmitter<string>();

}
