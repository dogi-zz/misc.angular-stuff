// tslint:disable:no-any

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TrackByFunction} from '@angular/core';
import {map} from 'rxjs/operators';
import {getJson} from '../tools/generic-form-object-functions';
import {FormUiItem, FormUiItemObject} from '../generic-form-instance';
import {GenericFormComponent} from '../generic-form.component';
import {GenericFormComponentBase} from './generic-form-component.base';

@Component({
  selector: '[generic-form-form]',
  template: `
    <ng-container *ngFor="let entry of entries; trackBy: entryTrack">
      <generic-form-ui-element [uiItem]="entry.item"></generic-form-ui-element>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericFormFormComponent extends GenericFormComponentBase {

  @Input()
  public uiItems: FormUiItemObject;

  public entries: { key: string, item: FormUiItem }[] = [];

  public entryTrack: TrackByFunction<{ key: string; item: FormUiItem }> = (key, item) => this.genericFormComponent.entryTrackFormUiItem(key, item);

  public constructor(
    genericFormComponent: GenericFormComponent,
    cd: ChangeDetectorRef,
  ) {
    super(genericFormComponent, cd);
  }

  public update() {
    this.entries = Object.entries(this.uiItems || {}).map(([key, item]) => {
      return {
        key, item,
        hasError: this.genericFormComponent.formInstance.outputErrors.pipe(map(errors => !!errors.getValue(item.path))),
      };
    });
  }

}
