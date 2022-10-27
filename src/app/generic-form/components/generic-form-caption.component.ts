import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {GenericFormComponent} from '../generic-form.component';
import {FormValidationResult} from '../generic-form.data';
import {ControlDef, ElementLayout, ElementLayoutPosition} from './generic-form-component.data';

@Component({
  selector: 'app-generic-form-caption',
  template: `
    <div class="generic-form-caption"
         [class.generic-form-caption-with-button]="withButton"
         [ngStyle]="visible? {}:{display: 'none'}" [ngClass]="cssClass" [class.error]="validationResult[control.path]">
      <div class="generic-form-title" *ngIf="titleVisible" [title]="control.path">{{control.calculatedCaption || control.element.caption}}</div>
      <div class="generic-form-help" *ngIf="helpVisible && control.element.help"
           [title]="control.element.help">{{control.element.help}}</div>
      <div class="generic-form-error" *ngIf="errorVisible && validationResult[control.path]">{{validationResult[control.path]}}</div>
    </div>
  `,
})
export class GenericFormCaptionComponent implements OnInit, OnChanges {

  @Input()
  public control: ControlDef;

  @Input()
  public isEmpty: boolean;

  @Input()
  public validationResult: FormValidationResult;

  @Input()
  public layoutPosition: ElementLayoutPosition;

  @Input()
  public cssClass: string;

  @Input()
  public withButton: string;

  @Input()
  public isArrayElement: boolean;

  public elementLayout: ElementLayout;

  public visible: boolean;
  public titleVisible: boolean;
  public helpVisible: boolean;
  public errorVisible: boolean;

  constructor(
    private genericFormComponent: GenericFormComponent,
  ) {
  }

  public ngOnInit(): void {
    this.update();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  private update() {
    this.elementLayout = this.genericFormComponent.resolveElementLayout(this.control, this.isEmpty);

    this.titleVisible = this.elementLayout.title === this.layoutPosition;
    this.helpVisible = this.elementLayout.help === this.layoutPosition;
    this.errorVisible = this.isArrayElement ? (this.elementLayout.arrayError === this.layoutPosition) : (this.elementLayout.error === this.layoutPosition);

    this.visible = this.titleVisible || this.helpVisible || this.errorVisible;
  }
}
