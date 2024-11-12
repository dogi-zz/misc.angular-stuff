import {AfterViewInit, ChangeDetectorRef, Directive, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs';
import {GenericFormInstance} from '../generic-form-instance';
import {GenericFormComponent} from '../generic-form.component';

@Directive()
export abstract class GenericFormComponentBase  implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  private isInit = false;
  private cdSubscription: Subscription;


  protected constructor(
    public genericFormComponent: GenericFormComponent,
    protected cd: ChangeDetectorRef,
  ) {
  }

  public get formInstance() : GenericFormInstance{
    return this.genericFormComponent.formInstance;
  }

  public ngOnInit(): void {
    this.isInit = true;

    this.cdSubscription = this.genericFormComponent.viewChanged.subscribe(() => {
      this.update();
      this.cd.markForCheck();
    });
  }

  public ngAfterViewInit(): void {
    this.cd.markForCheck();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (this.isInit) {
      this.update();
      this.cd.markForCheck();
    }
  }

  public ngOnDestroy() {
    this.cdSubscription?.unsubscribe();
  }
  public abstract update(): void;

}
