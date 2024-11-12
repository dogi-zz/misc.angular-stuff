// tslint:disable:no-any

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef, TrackByFunction} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {getJson} from '../tools/generic-form-object-functions';
import {FormUiItem, FormUiItemPrimitiveItem} from '../generic-form-instance';
import {GenericFormComponent} from '../generic-form.component';
import {GenericFormComponentBase} from './generic-form-component.base';
import {WidgetControl} from './generic-form-component.data';

@Component({
  selector: 'generic-form-input-primitive',
  template: `
    <div class="generic-form-input"
         [class.generic-form-error]="hasError|async"

         [class.generic-form-input-text]="uiItem.def.type === 'text'"
         [class.generic-form-input-number]="uiItem.def.type === 'number'"
         [class.generic-form-input-integer]="uiItem.def.type === 'integer'"
         [class.generic-form-input-boolean]="uiItem.def.type === 'boolean'"
         [class.generic-form-input-selection]="uiItem.def.type === 'selection'"

         [class.generic-form-style-wide]="uiItem.def.type === 'text' && uiItem.def.layout === 'wide'"
    >
      <ng-container
        *ngTemplateOutlet="widgetTemplate; context:{$implicit: widgetControl}"></ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericFormInputPrimitiveComponent extends GenericFormComponentBase {

  @Input()
  public uiItem: FormUiItemPrimitiveItem;

  public widgetTemplate: TemplateRef<{ $implicit: WidgetControl }>;
  public widgetControl: WidgetControl;

  public hasError: Observable<boolean>;

  public constructor(
    genericFormComponent: GenericFormComponent,
    cd: ChangeDetectorRef,
  ) {
    super(genericFormComponent, cd);
  }

  public override ngOnInit(): void {
    this.widgetControl = {
      def: this.uiItem.def,
      path: this.uiItem.path,
      onFocus: () => {
        console.info('onFocus');
        this.enterInputField();
      },
      onBlur: () => {
        console.info('onBlur');
        this.blurInputField();
      },
      onInput: (value: any) => {
        this.formInstance.setValue(this.uiItem.path, value);
      },
    };

    setTimeout(() => {
      super.ngOnInit();
    });

  }


  public update() {
    this.hasError = this.genericFormComponent.formInstance.outputErrors.pipe(map(errors => !!errors.getValue(this.uiItem.path)));
    this.widgetTemplate = this.genericFormComponent.resolveWidget(this.uiItem);
  }

  public enterInputField() {
    this.genericFormComponent.stopUpdate();
  }

  public blurInputField() {
    this.genericFormComponent.continueUpdate();
  }

}
