// tslint:disable:no-any

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {FormUiItem} from '../generic-form-instance';
import {GenericFormComponent} from '../generic-form.component';
import {GenericFormComponentBase} from './generic-form-component.base';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'generic-form-ui-element',
  template: `
    <ng-container *ngIf="uiItem.type === 'input'">
      <div class="generic-form-control" [class.generic-form-error]="hasError|async">
        <div *ngIf="uiItem.caption"
             app-generic-form-caption
             class="generic-form-caption"
             [class.generic-form-error]="hasError|async"
             [caption]="uiItem.caption.caption"
             [help]="uiItem.caption.help"
             [path]="uiItem.path"></div>
        <generic-form-input-primitive [uiItem]="uiItem"></generic-form-input-primitive>
      </div>
    </ng-container>

    <ng-container *ngIf="uiItem.type === 'object'">
      <div class="generic-form-control" [class.generic-form-error]="hasError|async">
        <generic-form-input-object [uiItem]="uiItem"></generic-form-input-object>
      </div>
    </ng-container>

    <ng-container *ngIf="uiItem.type === 'array'">
      <div class="generic-form-control" [class.generic-form-error]="hasError|async">
        <generic-form-input-array [uiItem]="uiItem"></generic-form-input-array>
      </div>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericFormUiElementComponent extends GenericFormComponentBase {

  @Input()
  public uiItem: FormUiItem;

  public hasError: Observable<boolean>;

  public constructor(
    genericFormComponent: GenericFormComponent,
    cd: ChangeDetectorRef,
  ) {
    super(genericFormComponent, cd);
  }

  public override update() {
    this.hasError = this.genericFormComponent.formInstance.outputErrors.pipe(map(errors => !!errors.getValue(this.uiItem.path)));
  }


}
