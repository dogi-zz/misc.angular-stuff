import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {GenericFormComponent} from '../generic-form.component';

// import {ButtonControl, ButtonLayoutPosition, ControlDef, ElementLayout} from './generic-form-component.data';

@Component({
  selector: '[app-generic-form-button]',
  template: `
    <div class="generic-form-button">

      <!--      <div class="generic-form-add-button" *ngIf="control.element.type === 'object' && !(control.value$|async)">-->
      <!--        <ng-container-->
      <!--          *ngTemplateOutlet="addObjectButtonTemplate; context:{$implicit: addObjectButtonControl}"></ng-container>-->
      <!--      </div>-->

      <!--      <div class="generic-form-remove-button"  *ngIf="control.element.type === 'object' && !control.element.required && (control.value$|async)">-->
      <!--        <ng-container-->
      <!--          *ngTemplateOutlet="removeObjectButtonTemplate; context:{$implicit: removeObjectButtonControl}"></ng-container>-->
      <!--      </div>-->

      <!--      <div class="generic-form-add-button"  *ngIf="control.element.type === 'array' && !(control.value$|async)">-->
      <!--        <ng-container-->
      <!--          *ngTemplateOutlet="addArrayButtonTemplate; context:{$implicit: addArrayButtonControl}"></ng-container>-->
      <!--      </div>-->

      <!--      <div class="generic-form-remove-button"  *ngIf="control.element.type === 'array' && !control.element.required && (control.value$|async)">-->
      <!--        <ng-container-->
      <!--          *ngTemplateOutlet="removeArrayButtonTemplate; context:{$implicit: removeArrayButtonControl}"></ng-container>-->
      <!--      </div>-->
    </div>

  `,
})
export class GenericFormButtonComponent implements OnInit, OnChanges, AfterViewInit {

  // @Input()
  // public control: ControlDef;

  @Input()
  public isEmpty: boolean;

  // @Input()
  // public layoutPosition: ButtonLayoutPosition;
  //
  // public visible: Observable<boolean>;
  //
  // public addObjectButtonTemplate: TemplateRef<{$implicit: ButtonControl}>;
  // public addObjectButtonControl: ButtonControl;
  //
  // public addArrayButtonTemplate: TemplateRef<{$implicit: ButtonControl}>;
  // public addArrayButtonControl: ButtonControl;
  //
  // public removeObjectButtonTemplate: TemplateRef<{$implicit: ButtonControl}>;
  // public removeObjectButtonControl: ButtonControl;
  //
  // public removeArrayButtonTemplate: TemplateRef<{$implicit: ButtonControl}>;
  // public removeArrayButtonControl: ButtonControl;

  public constructor(
    private el: ElementRef<HTMLElement>,
    private genericFormComponent: GenericFormComponent,
  ) {
  }

  public ngOnInit(): void {
    this.update();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  public ngAfterViewInit() {
    this.el.nativeElement.classList.add('generic-form-button');
  }

  private update() {
    setTimeout(() => {

      // this.visible = new BehaviorSubject<boolean>(false);
      // this.addObjectButtonTemplate = null;
      // this.addObjectButtonControl = null;
      // this.removeObjectButtonTemplate = null;
      // this.removeObjectButtonControl = null;
      // this.addArrayButtonTemplate = null;
      // this.addArrayButtonControl = null;
      // this.removeArrayButtonTemplate = null;
      // this.removeArrayButtonControl = null;

      // if (this.control.element.type === 'object') {
      //   const buttonDataAdd = this.genericFormComponent.resolveButton(this.control, 'CreateObject');
      //   const buttonDataRemove = this.genericFormComponent.resolveButton(this.control, 'RemoveObject');
      //
      //   this.addObjectButtonTemplate = buttonDataAdd.template;
      //   this.removeObjectButtonTemplate = buttonDataRemove.template;
      //   this.addObjectButtonControl = {
      //     action: () => {
      //       this.control.hover = null;
      //       this.genericFormComponent.setValue(this.control.path, {});
      //     },
      //     mouseEnter: () => this.control.hover = 'add',
      //     mouseLeave: () => this.control.hover = null,
      //   };
      //   this.removeObjectButtonControl = {
      //     action: () => {
      //       this.control.hover = null;
      //       this.genericFormComponent.setValue(this.control.path, null);
      //     },
      //     mouseEnter: () => this.control.hover = 'delete',
      //     mouseLeave: () => this.control.hover = null,
      //   };
      //
      //   this.visible = this.control.value$.pipe(map((value: any) => {
      //     if (value && this.layoutPosition === buttonDataRemove.position) {
      //       return true;
      //     }
      //     if (!value && this.layoutPosition === buttonDataAdd.position) {
      //       return true;
      //     }
      //     return false;
      //   }));
      //
      // }


      // if (this.control.element.type === 'array'  ) {
      //   const buttonDataAdd = this.genericFormComponent.resolveButton(this.control, 'CreateArray');
      //   const buttonDataRemove = this.genericFormComponent.resolveButton(this.control, 'RemoveArray');
      //
      //   this.addArrayButtonTemplate = buttonDataAdd.template;
      //   this.removeArrayButtonTemplate = buttonDataRemove.template;
      //   this.addArrayButtonControl = {
      //     action: () => {
      //       this.control.hover = null;
      //       this.genericFormComponent.setValue(this.control.path, []);
      //     },
      //     mouseEnter: () => this.control.hover = 'add',
      //     mouseLeave: () => this.control.hover = null,
      //   };
      //   this.removeArrayButtonControl = {
      //     action: () => {
      //       this.control.hover = null;
      //       this.genericFormComponent.setValue(this.control.path, null);
      //     },
      //     mouseEnter: () => this.control.hover = 'delete',
      //     mouseLeave: () => this.control.hover = null,
      //   };
      //
      //   this.visible = this.control.value$.pipe(map((value: any) => {
      //     if (value && this.layoutPosition === buttonDataRemove.position) {
      //       return true;
      //     }
      //     if (!value && this.layoutPosition === buttonDataAdd.position) {
      //       return true;
      //     }
      //     return false;
      //   }));
      // }

    });
  }
}
