// tslint:disable:no-any

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef} from '@angular/core';
import {FormUiItemObjectItem} from '../generic-form-instance';
import {GenericFormComponent} from '../generic-form.component';
import {GenericFormComponentBase} from './generic-form-component.base';
import {ButtonControl} from './generic-form-component.data';

@Component({
  selector: 'generic-form-input-object',
  template: `
    <div class="generic-form-input-object" [class.empty]="isEmpty" [class.hovered_delete]="isHoveredDelete">
      <div *ngIf="uiItem.caption"
           app-generic-form-caption
           class="generic-form-caption"
           [caption]="uiItem.caption.caption"
           [help]="uiItem.caption.help"
           [path]="uiItem.path">
      </div>

      <div class="generic-form-add-button" *ngIf="isEmpty">
        <ng-container
          *ngTemplateOutlet="addObjectButtonTemplate; context: {$implicit: addObjectButtonControl}"></ng-container>
      </div>
      <div class="generic-form-remove-button" *ngIf="!isEmpty && !uiItem.required">
        <ng-container
          *ngTemplateOutlet="removeObjectButtonTemplate; context: {$implicit: removeObjectButtonControl}"></ng-container>
      </div>

      <div generic-form-form *ngIf="!isEmpty" class="generic-form-form" [uiItems]="uiItem.children"></div>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericFormInputObjectComponent extends GenericFormComponentBase {

  @Input()
  public uiItem: FormUiItemObjectItem;

  public isEmpty: boolean;
  public isHoveredDelete: boolean;

  public addObjectButtonTemplate: TemplateRef<{ $implicit: ButtonControl }>;
  public addObjectButtonControl: ButtonControl;

  public removeObjectButtonTemplate: TemplateRef<{ $implicit: ButtonControl }>;
  public removeObjectButtonControl: ButtonControl;

  public constructor(
    genericFormComponent: GenericFormComponent,
    cd: ChangeDetectorRef,
  ) {
    super(genericFormComponent, cd);
  }

  public override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    setTimeout(()=>{
      this.addObjectButtonTemplate = this.genericFormComponent.resolveButton('CreateObject');
      this.addObjectButtonControl = {
        action: () => {
          this.formInstance.setValue(this.uiItem.path, {});
        },
        mouseEnter: () => {
        },
        mouseLeave: () => {
        },
      };
      this.removeObjectButtonTemplate = this.genericFormComponent.resolveButton('RemoveObject');
      this.removeObjectButtonControl = {
        action: () => {
          this.formInstance.setValue(this.uiItem.path, null);
        },
        mouseEnter: () => {
          this.isHoveredDelete = true;
          this.cd.markForCheck();
        },
        mouseLeave: () => {
          this.isHoveredDelete = false;
          this.cd.markForCheck();
        },
      };
      this.cd.markForCheck();
    });
  }


  public update() {
    this.isEmpty = Object.keys(this.uiItem.children).length === 0;
    this.cd.markForCheck();
  }


}
