// tslint:disable:no-any

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef, TrackByFunction} from '@angular/core';
import {Observable} from 'rxjs';
import {FormUiItem, FormUiItemArrayItem} from '../generic-form-instance';
import {GenericFormComponent} from '../generic-form.component';
import {GenericFormComponentBase} from './generic-form-component.base';
import {ButtonControl} from './generic-form-component.data';
import {map} from "rxjs/operators";

type UiEntry = { item: FormUiItem, remove: ButtonControl, hoverDelete: boolean, error: Observable<string> };

@Component({
  selector: 'generic-form-input-array',
  template: `
    <div class="generic-form-input-array" [class.empty]="isEmpty" [class.hovered_delete]="isHoveredDelete" [class.hovered_add]="isHoveredAdd">
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

      <div class="generic-form-array-content" *ngIf="uiItem.children?.length">
        <ng-container *ngFor="let entry of entries; trackBy: entryTrack">
          <div class="generic-form-array-content-item" [class.hovered_remove]="entry.hoverDelete">
            <div class="generic-form-array-content-item-child">
              <generic-form-ui-element [uiItem]="entry.item"></generic-form-ui-element>
            </div>
            <div class="generic-form-array-remove">
              <ng-container
                *ngTemplateOutlet="removeElementButtonTemplate; context: {$implicit: entry.remove}"></ng-container>
            </div>
            <div class="generic-form-error-message" *ngIf="entry.error | async">{{ entry.error | async }}</div>
          </div>
        </ng-container>
      </div>

      <div class="generic-form-array-add" *ngIf="!isEmpty && uiItem.canAdd">
        <ng-container
          *ngTemplateOutlet="addElementButtonTemplate; context: {$implicit: addElementButtonControl}"></ng-container>
      </div>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericFormInputArrayComponent extends GenericFormComponentBase {

  @Input()
  public uiItem: FormUiItemArrayItem;

  public entries: UiEntry[] = [];

  public isEmpty: boolean;
  public isHoveredDelete: boolean;
  public isHoveredAdd: boolean;

  public addObjectButtonTemplate: TemplateRef<{ $implicit: ButtonControl }>;
  public addObjectButtonControl: ButtonControl;

  public removeObjectButtonTemplate: TemplateRef<{ $implicit: ButtonControl }>;
  public removeObjectButtonControl: ButtonControl;

  public addElementButtonTemplate: TemplateRef<{ $implicit: ButtonControl }>;
  public addElementButtonControl: ButtonControl;

  public removeElementButtonTemplate: TemplateRef<{ $implicit: ButtonControl }>;

  public entryTrack: TrackByFunction<UiEntry> = (key, item) => this.genericFormComponent.entryTrackUiItemEntry(key, item);

  public constructor(
    genericFormComponent: GenericFormComponent,
    cd: ChangeDetectorRef,
  ) {
    super(genericFormComponent, cd);
  }

  public override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    setTimeout(() => {

      this.addObjectButtonTemplate = this.genericFormComponent.resolveButton('CreateArray');
      this.addObjectButtonControl = {
        action: () => {
          this.formInstance.setValue(this.uiItem.path, []);
        },
        mouseEnter: () => {
        },
        mouseLeave: () => {
        },
      };

      this.removeObjectButtonTemplate = this.genericFormComponent.resolveButton('RemoveArray');
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

      this.addElementButtonTemplate = this.genericFormComponent.resolveButton('AddToArray');
      this.addElementButtonControl = {
        action: () => {
          this.formInstance.addToArray(this.uiItem.path);
        },
        mouseEnter: () => {
          this.isHoveredAdd = true;
          this.cd.markForCheck();
        },
        mouseLeave: () => {
          this.isHoveredAdd = false;
          this.cd.markForCheck();
        },
      };

      this.removeElementButtonTemplate = this.genericFormComponent.resolveButton('RemoveFromArray');
      this.cd.markForCheck();
    });
  }


  public update() {
    this.isEmpty = this.uiItem.children === null;
    this.entries = (this.uiItem.children || []).map((item) => {
      const result: UiEntry = {
        item,
        hoverDelete: false,
        error: this.genericFormComponent.formInstance.outputErrors.pipe(map(errors => errors.getValue(item.path))),
        remove: {
          action: () => {
            this.formInstance.removeFromArray(item.path);
          },
          mouseEnter: () => {
            result.hoverDelete = true;
            this.cd.markForCheck();
          },
          mouseLeave: () => {
            result.hoverDelete = false;
            this.cd.markForCheck();
          },
        },
      };
      return result;
    });
    this.cd.markForCheck();
  }


}
