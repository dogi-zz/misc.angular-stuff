import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';

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
export class InputBooleanWidget implements OnInit, OnChanges, OnDestroy {


  @Input() public value: any;
  @Input() public required: boolean;

  @Output() public valueChange = new EventEmitter<any>();


  private isInit = false;

  constructor() {
  }

  public ngOnInit(): void {
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
  }

  public booleanClick() {
    if (this.value === true) {
      this.value = false;
    } else if (this.value === false && !this.required) {
      this.value = null;
    } else {
      this.value = true;
    }
    this.valueChange.emit(this.value);
  }

}
