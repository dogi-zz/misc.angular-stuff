import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Input, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {GenericFormComponentBase} from '../components/generic-form-component.base';
import {WidgetControl} from '../components/generic-form-component.data';
import {FormDefElementSelect, FormDefElementSelectOption} from '../generic-form-definition';
import {GenericFormComponent} from '../generic-form.component';

const checkSearchString = (search: string, option: string) => {
  const searchWords = search.toLowerCase().trim().split(' ').map(w => w.trim()).filter(w => w.length);
  const optionString = option.toLowerCase();
  if (searchWords.length && !searchWords.every(word => optionString.includes(word))) {
    return false;
  } else {
    return true;
  }
};


const optionDefinitionToPromise = <T>(value: T | Promise<T> | Observable<T>) => {
  if (value instanceof Promise) {
    return value;
  }
  if (value instanceof Observable) {
    return new Promise<T>(res => {
      const subscription = value.subscribe(val => {
        res(val);
        setTimeout(() => subscription?.unsubscribe());
      });
    });
  }
  return Promise.resolve(value);
};


@Component({
  selector: '[app-input-selection-widget]',
  template: `
    <div class="input-wrapper">
      <input type="text" #selectionInput [(ngModel)]="selectionSearchInput"
             (ngModelChange)="onSelectionInput()"
             (focusin)="onSelectionFocus()"
             (blur)="onSelectionLeave()"
             (keydown)="onKeyDown($event)"/>
      <div>
        <button (mousedown)="onSelectionButton()" tabindex="-1"></button>
      </div>
    </div>
    <div class="generic-form-input-select-options" #selectionWindow>
      <div *ngFor="let option of filteredOptions; let idx = index"
           class="generic-form-input-select-option"
           [class.selected]="option.value === value"
           [class.hovered]="cursorIndex === idx"
           (mousedown)="selectOption($event, option)">{{ option.label }}
      </div>
      <div *ngIf="!filteredOptions?.length"
           class="generic-form-input-select-option no-option">no options
      </div>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSelectionWidget extends GenericFormComponentBase implements AfterViewInit {


  @ViewChild('selectionWindow')
  public selectionWindow: ElementRef<HTMLElement>;

  @ViewChild('selectionInput')
  public selectionInput: ElementRef<HTMLElement>;


  @Input()
  public control: WidgetControl;

  public selectionOptions: FormDefElementSelectOption[];
  public filteredOptions: FormDefElementSelectOption[];
  public cursorIndex = 1;

  public selectionSearchInput: string;
  public selectionOpen = false;
  public value: any;


  public constructor(
    genericFormComponent: GenericFormComponent,
    cd: ChangeDetectorRef,
  ) {
    super(genericFormComponent, cd);
  }

  private get def(): FormDefElementSelect {
    return this.control.def as FormDefElementSelect;
  }

  public override ngAfterViewInit() {
    super.ngAfterViewInit();
    this.selectionWindow.nativeElement.parentElement.style.position = 'relative';
    this.selectionWindow.nativeElement.style.position = 'absolute';
    this.selectionWindow.nativeElement.style.display = 'none';
  }


  public update() {
    this.value = this.formInstance.valueMap.getValue(this.control.path);
    this.selectionOptions = this.def.options as FormDefElementSelectOption[];
    this.selectionSearchInput = (this.selectionOptions || []).find(so => so.value === this.value)?.label || '';
  }


  public onSelectionButton() {
    if (this.selectionOpen) {
      this.closeSelection();
    } else {
      this.selectionSearchInput = '';
      this.openSelection().then(() => this.selectionInput.nativeElement.focus());
    }
  }

  public onSelectionFocus() {
    this.control.onFocus();
    if (!this.selectionOpen) {
      this.openSelection().then();
    }
  }

  public onSelectionInput() {
    this.cursorIndex = -1;
    this.filterSelectionOptions();
    this.checkSelectionWindow();
  }

  private async openSelection() {
    this.selectionOpen = true;
    this.cursorIndex = -1;
    this.filteredOptions = [...this.selectionOptions];
    await new Promise(res => setTimeout(res));
    this.selectionWindow.nativeElement.style.display = '';
    this.checkSelectionWindow();
  }

  private filterSelectionOptions() {
    this.filteredOptions = this.selectionOptions.filter(option => checkSearchString(this.selectionSearchInput, option.label));
  }


  public selectOption(event: MouseEvent, option: FormDefElementSelectOption) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.filteredOptions = [option];
    this.selectionSearchInput = option.label;
    this.selectionInput.nativeElement.blur(); // this.onSelectionLeave(); does the rest
  }

  public onSelectionLeave() {
    if (!this.filteredOptions) {
      return;
    }
    if (this.filteredOptions.length === 1) {
      const option = this.filteredOptions[0];
      setTimeout(() => {
        this.selectionSearchInput = option.label || '';
        this.formInstance.setValue(this.control.path, option.value);
        this.control.onBlur();
        this.cd.markForCheck();
      });
    } else {
      this.selectionSearchInput = this.filteredOptions[0]?.label || '';
      this.formInstance.setValue(this.control.path, this.value);
      this.control.onBlur();
    }
    this.closeSelection();
  }

  public closeSelection() {
    console.info("closeSelection");
    this.selectionOpen = false;
    this.filteredOptions = null;
    this.selectionWindow.nativeElement.style.display = 'none';
    this.cd.markForCheck();
  }


  private checkSelectionWindow() {
    if (this.selectionOptions) {
      const optionsRect = this.selectionWindow.nativeElement.getBoundingClientRect();
      const inputRect = this.selectionInput.nativeElement.getBoundingClientRect();

      if (inputRect.bottom + optionsRect.height > window.innerHeight) {
        this.selectionWindow.nativeElement.style.top = `-${optionsRect.height}px`;
      } else {
        this.selectionWindow.nativeElement.style.top = `calc( 100% - 1px )`;
      }

      const rect = this.selectionWindow.nativeElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        this.closeSelection();
      }
    }
  }


  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this.checkSelectionWindow();
  }

  @HostListener('window:scroll', ['$event'])
  public onWindowScroll($event) {
    this.checkSelectionWindow();
  }

  public onKeyDown($event: KeyboardEvent) {
    if ($event.key === 'ArrowDown') {
      this.cursorIndex = Math.min(this.filteredOptions.length - 1, this.cursorIndex + 1);
    }
    if ($event.key === 'ArrowUp' && this.cursorIndex > 0) {
      this.cursorIndex = this.cursorIndex - 1;
    }
    if ($event.key === 'Enter') {
      if (this.filteredOptions?.length && this.filteredOptions[this.cursorIndex]) {
        this.filteredOptions = this.filteredOptions.slice(this.cursorIndex, this.cursorIndex + 1);
        this.selectionInput.nativeElement.blur();
      }
    }
    if ($event.key === 'Escape') {
      this.selectionInput.nativeElement.blur();
    }
  }
}
