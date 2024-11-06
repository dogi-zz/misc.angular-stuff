import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';

const barWidth = 6;

@Component({
  selector: 'split-bar',
  template: `
    <div class="split-bar" #bar
         (mouseenter)="mouseEnter()"
         (mouseleave)="mouseLeave()"
    ></div>`,
  styles: [
    `.split-bar {
      width: ${barWidth}px;
      background: linear-gradient(90deg, rgb(200, 200, 200) 0%, rgb(255, 255, 255) 35%, rgb(200, 200, 200) 100%);
      cursor: col-resize;
    }`,
  ],
})
export class SplitBarComponent implements OnInit, OnChanges, AfterViewInit {

  @Input()
  public container: HTMLElement;

  @ViewChild('bar')
  public bar: ElementRef<HTMLElement>;

  @Input()
  public positionLeft: number;

  @Input()
  public positionRight: number;

  @Input()
  public outsideIntervalTime: number = 200;

  @Input()
  public stickVisibility: boolean = false;


  @Output()
  public newPosition = new EventEmitter<{ left: number, right: number }>();

  @Output()
  public outsideRight = new EventEmitter<void>();

  @Output()
  public outsideLeft = new EventEmitter<void>();

  @Output()
  public exitRight = new EventEmitter<void>();

  @Output()
  public exitLeft = new EventEmitter<void>();

  @Output()
  public moveEnd = new EventEmitter<void>();


  constructor() {
  }

  public ngOnInit(): void {
  }

  public ngAfterViewInit() {
    this.initContainer();
    this.initBarDrag();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.container) {
      this.initContainer();
    }
    if (changes.positionLeft || changes.positionRight) {
      this.checkPosition();
    }
  }

  private initContainer() {
    if (this.container && this.bar?.nativeElement) {
      if (!['relative', 'absolute', 'fixed'].includes(this.container.style.position)) {
        this.container.style.position = 'relative';
      }

      this.bar.nativeElement.style.position = 'absolute';
      this.bar.nativeElement.style.pointerEvents = 'initial';
      this.bar.nativeElement.style.top = '0';
      this.bar.nativeElement.style.bottom = '0';

      this.bar.nativeElement.style.opacity = this.stickVisibility ? '1' : '0';
      this.checkPosition();
    }
  }

  private checkPosition() {
    if (this.container && this.bar?.nativeElement) {
      this.bar.nativeElement.style.left = '';
      this.bar.nativeElement.style.right = '';
      this.bar.nativeElement.style.display = 'none';
      if (typeof this.positionLeft === 'number') {
        this.bar.nativeElement.style.left = (this.positionLeft - barWidth / 3) + 'px';
        this.bar.nativeElement.style.display = '';
      }
      if (typeof this.positionRight === 'number') {
        this.bar.nativeElement.style.right = (this.positionRight - barWidth / 3) + 'px';
        this.bar.nativeElement.style.display = '';
      }
    }
  }

  public mouseEnter() {
    this.bar.nativeElement.style.opacity = this.stickVisibility ? '1' : '1';
  }

  public mouseLeave() {
    this.bar.nativeElement.style.opacity = this.stickVisibility ? '1' : '0';
  }

  private initBarDrag() {
    const bar = this.bar.nativeElement;
    const container = this.container;

    let startPosition: [number, number];
    let position: number;

    let outsideRightInterval: any;
    let outsideLeftInterval: any;

    bar.draggable = true;
    bar.ondragstart = (event) => {
      startPosition = [event.clientX, event.clientY];

      if (typeof this.positionLeft === 'number') {
        position = this.positionLeft;
      }
      if (typeof this.positionRight === 'number') {
        position = container.getBoundingClientRect().width - this.positionRight;
      }

      const crt = bar.cloneNode(false) as HTMLElement;
      crt.style.display = 'none';
      event.dataTransfer.setDragImage(crt, 0, 0);
    };
    bar.ondrag = (event) => {
      if (typeof position !== 'number') {
        return;
      }
      const actualPosition = [event.clientX, event.clientY];
      if (event.clientX && event.clientY) {
        const dragOffset = actualPosition[0] - startPosition[0];
        const containerWidth = container.getBoundingClientRect().width;
        const right = (containerWidth - position) - dragOffset;
        const left = position + dragOffset;

        if (right >= 0 && left >= 0) {
          this.newPosition.emit({left, right});
        }

        if (right < 0) {
          if (!outsideRightInterval) {
            this.exitRight.emit();
            outsideRightInterval = setInterval(() => this.outsideRight.emit(), this.outsideIntervalTime);
          }
        } else {
          clearInterval(outsideRightInterval);
          outsideRightInterval = null;
        }
        if (left < 0) {
          if (!outsideLeftInterval) {
            this.exitLeft.emit();
            outsideLeftInterval = setInterval(() => this.outsideLeft.emit(), this.outsideIntervalTime);
          }
        } else {
          clearInterval(outsideLeftInterval);
          outsideLeftInterval = null;
        }
      }
    };
    bar.ondragend = (event) => {
      clearInterval(outsideRightInterval);
      clearInterval(outsideLeftInterval);
      outsideRightInterval = null;
      outsideLeftInterval = null;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.checkPosition();
      this.moveEnd.emit();
    };
  }
}
