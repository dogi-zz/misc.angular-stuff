import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Path} from '../tools/generic-form-path';
import {GenericFormComponent} from '../generic-form.component';
import {GenericFormComponentBase} from './generic-form-component.base';

@Component({
  selector: '[app-generic-form-caption]',
  template: `
    <ng-container *ngIf="caption?.length || help?.length ">
      <!--      || genericFormComponent.validationResult[path]-->
      <div class="generic-form-title" *ngIf="caption?.length" [title]="path">{{ caption }}</div>
      <div class="generic-form-help" *ngIf="help?.length" [title]="help">{{ help }}</div>
      <div class="generic-form-error-message" *ngIf="error|async">{{ error|async }}</div>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericFormCaptionComponent extends GenericFormComponentBase {

  public constructor(
    genericFormComponent: GenericFormComponent,
    cd: ChangeDetectorRef,
  ) {
    super(genericFormComponent, cd);
  }

  @Input()
  public path: Path;

  @Input()
  public caption: string;

  @Input()
  public help: string;

  public error: Observable<string>;


  public update() {
    this.error = this.genericFormComponent.formInstance.outputErrors.pipe(map(errors => errors.getValue(this.path)));
  }
}
