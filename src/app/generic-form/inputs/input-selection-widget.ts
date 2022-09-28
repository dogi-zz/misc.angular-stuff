import {Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {FormDefElementSelectOption} from '../generic-form.data';
import {optionDefinitionToObservable, optionDefinitionToPromise} from '../generic-form.functions';

const checkSearchString = (search: string, option: string) => {
  const searchWords = search.toLowerCase().trim().split(' ').map(w => w.trim()).filter(w => w.length);
  const optionString = option.toLowerCase();
  if (searchWords.length && !searchWords.every(word => optionString.includes(word))) {
    return false;
  } else {
    return true;
  }
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
        <button (mousedown)="onSelectionButton()" tabindex="-1">▼</button>
      </div>
    </div>
    <div *ngIf="filteredOptions" class="form-by-def-input-select-options" #selectionWindow>
      <div *ngFor="let option of filteredOptions; let idx = index"
           class="form-by-def-input-select-option"
           [class.selected]="option.value === value"
           [class.hovered]="cursorIndex === idx"
           (mousedown)="selectOption(option)">{{option.label}}</div>
      <div *ngIf="!filteredOptions?.length"
           class="form-by-def-input-select-option no-option">no options
      </div>

    </div>
  `,
})
export class InputSelectionWidget implements OnInit, OnChanges, OnDestroy {


  @ViewChild('selectionWindow')
  public selectionWindow: ElementRef<HTMLElement>;

  @ViewChild('selectionInput')
  public selectionInput: ElementRef<HTMLElement>;

  @Input() public value!: any;
  @Output() public valueChange = new EventEmitter<any>();

  @Output() public onFocus = new EventEmitter<void>();
  @Output() public onBlur = new EventEmitter<void>();



  @Input() public options: FormDefElementSelectOption[] | Promise<FormDefElementSelectOption[]> | Observable<FormDefElementSelectOption[]>;

  private value$ = new BehaviorSubject<any>(null);

  public selectionOptions: FormDefElementSelectOption[];
  public filteredOptions: FormDefElementSelectOption[];
  public cursorIndex = 1;

  public selectionSearchInput: string;
  private selectionSearchInputSubscription: Subscription;

  private isInit = false;

  constructor() {
  }

  public ngOnInit(): void {
    this.isInit = true;
    this.value$.next(this.value);
    this.update().then();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.options) {
      this.update().then();
    } else if (changes.value) {
      this.value$.next(this.value);
    }
  }

  public ngOnDestroy() {
    this.selectionSearchInputSubscription?.unsubscribe();
  }

  private async update() {
    if (!this.isInit) {
      return;
    }

    this.selectionSearchInputSubscription?.unsubscribe();
    this.selectionSearchInputSubscription = combineLatest([this.value$, optionDefinitionToObservable(this.options)]).subscribe(([value, selectionOptions]) => {
      this.selectionSearchInput = selectionOptions.find(so => so.value === value)?.label || '';
    });

  }


  public onSelectionButton() {
    if (this.selectionOptions) {
      this.closeSelection();
    } else {
      this.selectionSearchInput = '';
      this.openSelection().then(() => this.selectionInput.nativeElement.focus());
    }
  }

  public onSelectionFocus() {
    this.onFocus.emit();
    if (!this.selectionOptions) {
      this.openSelection().then();
    }
  }

  public onSelectionInput() {
    this.cursorIndex = -1;
    this.filterSelectionOptions();
    this.checkSelectionWindow();
  }

  private async openSelection() {
    this.cursorIndex = -1;
    this.selectionOptions = await optionDefinitionToPromise(this.options);
    this.filteredOptions = [...this.selectionOptions];
    await new Promise(res => setTimeout(res));
    this.checkSelectionWindow();
  }

  private filterSelectionOptions() {
    this.filteredOptions = this.selectionOptions.filter(option => checkSearchString(this.selectionSearchInput, option.label));
  }


  public selectOption(option: FormDefElementSelectOption) {
    // ... onSelectionLeave() does the rest
    this.filteredOptions = [option];
    this.selectionSearchInput = option.label;
  }

  public onSelectionLeave() {
    if (!this.filteredOptions) {
      return;
    }
    if (this.filteredOptions.length === 1) {
      const option = this.filteredOptions[0];
      const value = option.value;
      setTimeout(() => {
        this.selectionSearchInput = option.label || '';
        this.valueChange.next(value);
        this.onBlur.emit();
      });
    } else {
      this.selectionSearchInput = this.filteredOptions[0].label || '';
      this.value$.next(this.value);
      this.onBlur.emit();
    }
    this.closeSelection();
  }

  public closeSelection() {
    this.selectionOptions = null;
    this.filteredOptions = null;
  }


  private checkSelectionWindow() {
    if (this.selectionOptions) {
      const optionsRect = this.selectionWindow.nativeElement.getBoundingClientRect();
      const inputRect = this.selectionInput.nativeElement.getBoundingClientRect();

      if (inputRect.bottom + optionsRect.height > window.innerHeight) {
        this.selectionWindow.nativeElement.style.top = `-${optionsRect.height}px`;
      } else {
        this.selectionWindow.nativeElement.style.top = `100%`;
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
    console.info($event);
    if ($event.key === 'ArrowDown') {
      this.cursorIndex = Math.min(this.filteredOptions.length - 1, this.cursorIndex + 1);
    }
    if ($event.key === 'ArrowUp' && this.cursorIndex > 0) {
      this.cursorIndex = this.cursorIndex - 1;
    }
    if ($event.key === 'Enter') {
      console.info('HIER', this.cursorIndex);
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
