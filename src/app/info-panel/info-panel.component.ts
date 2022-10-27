import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';

declare const ResizeObserver: any;

@Component({
  selector: 'info-panel',
  template: `
    <div class="info-panel" #panel [ngStyle]="style">
      <ng-content></ng-content>
    </div>`,
  styles: [
    `.info-panel {
      box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
    }`,
  ],
})
export class InfoPanelComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input()
  public container: HTMLElement;

  @ViewChild('panel')
  public panel: ElementRef<HTMLElement>;

  @Input()
  public margin: number = 0;

  @Input()
  public animate: number = 0;

  @Input()
  public anchor: 'top' | 'bottom' | 'left' | 'right';

  @Input()
  public direction: 'vertical' | 'horizontal';

  @Input()
  public sticky: boolean;

  @Input()
  public stickyVisible: boolean;

  @Input()
  public style: any;

  @Input()
  public fullSize: boolean;

  @Input()
  public fullMargin: number;


  private actualPosition: 'top' | 'bottom' | 'left' | 'right';
  private isInitialised = false;

  private animationState: {
    cloneElement: HTMLElement,
    animationState: number,
    targetTime: number,
  } = null;
  private animationTimeout = null;

  constructor() {
  }

  public ngOnInit(): void {
  }

  public ngAfterViewInit() {
    this.isInitialised = true;
    this.initContainer();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.container) {
      this.initContainer();
    }
    if (changes.stickyVisible && this.isInitialised) {
      if (this.sticky) {
        this.initAnimation(false);
      }
    }
  }

  public ngOnDestroy() {
    this.stopAnimation();
  }

  private initContainer() {
    if (this.container && this.panel?.nativeElement) {
      this.container.style.position = 'relative';
      this.container.style.overflow = 'hidden';

      this.panel.nativeElement.style.position = 'absolute';
      this.panel.nativeElement.style.display = 'inline-block';

      this.panel.nativeElement.style.top = '';
      this.panel.nativeElement.style.bottom = '';
      this.panel.nativeElement.style.left = '';
      this.panel.nativeElement.style.right = '';

      if (!this.actualPosition) {
        if (this.direction === 'horizontal') {
          if (this.anchor === 'right') {
            this.actualPosition = 'right';
          } else {
            this.actualPosition = 'left';
          }
        } else {
          if (this.anchor === 'top') {
            this.actualPosition = 'top';
          } else {
            this.actualPosition = 'bottom';
          }
        }
      }
      this.drawUpdate();

      if (!this.sticky) {
        this.container.addEventListener('mousemove', (event) => {
          const gapPointTop = this.container.getBoundingClientRect().top + this.panel.nativeElement.getBoundingClientRect().height + this.margin * 2;
          const gapPointBottom = this.container.getBoundingClientRect().bottom - this.panel.nativeElement.getBoundingClientRect().height - this.margin * 2;
          const gapPointLeft = this.container.getBoundingClientRect().left + this.panel.nativeElement.getBoundingClientRect().width + this.margin * 2;
          const gapPointRight = this.container.getBoundingClientRect().right - this.panel.nativeElement.getBoundingClientRect().width - this.margin * 2;

          if (this.direction === 'horizontal') {
            if (this.anchor === 'left') {
              if (event.clientX < gapPointLeft) {
                this.placeTo('right');
              } else {
                this.placeTo('left');
              }
            } else if (this.anchor === 'right') {
              if (event.clientX > gapPointRight) {
                this.placeTo('left');
              } else {
                this.placeTo('right');
              }
            } else {
              if (this.actualPosition === 'left' && event.clientX < gapPointLeft) {
                this.placeTo('right');
              } else if (this.actualPosition === 'right' && event.clientX > gapPointRight) {
                this.placeTo('left');
              }
            }
          } else {
            if (this.anchor === 'top') {
              if (event.clientY < gapPointTop) {
                this.placeTo('bottom');
              } else {
                this.placeTo('top');
              }
            } else if (this.anchor === 'bottom') {
              if (event.clientY > gapPointBottom) {
                this.placeTo('top');
              } else {
                this.placeTo('bottom');
              }
            } else {
              if (this.actualPosition === 'top' && event.clientY < gapPointTop) {
                this.placeTo('bottom');
              } else if (this.actualPosition === 'bottom' && event.clientY > gapPointBottom) {
                this.placeTo('top');
              }
            }
          }
        });

        this.container.addEventListener('mouseleave', (event) => {
          if (this.anchor) {
            this.placeTo(this.anchor);
          }
        });

      }

      const resize = new ResizeObserver(() => {
        this.checkPanelSize();
      });
      resize.observe(this.container);
      resize.observe(this.panel.nativeElement);

      this.checkPanelSize();
    }
  }

  private checkPanelSize() {
    if (this.direction === 'horizontal') {
      const containerHeight = this.container.getBoundingClientRect().height;
      const height = this.panel.nativeElement.getBoundingClientRect().height;
      if (this.fullSize) {
        this.panel.nativeElement.style.top = `${this.fullMargin || 0}px`;
        this.panel.nativeElement.style.bottom = `${this.fullMargin || 0}px`;
      } else {
        this.panel.nativeElement.style.top = `${(containerHeight - height) / 2}px`;
      }
    } else {
      const containerWidth = this.container.getBoundingClientRect().width;
      const width = this.panel.nativeElement.getBoundingClientRect().width;
      if (this.fullSize) {
        this.panel.nativeElement.style.left = `${this.fullMargin || 0}px`;
        this.panel.nativeElement.style.right = `${this.fullMargin || 0}px`;
      } else {
        this.panel.nativeElement.style.left = `${(containerWidth - width) / 2}px`;
      }
    }
    this.drawUpdate()
  }


  private placeTo(position: 'top' | 'bottom' | 'left' | 'right') {
    if (this.actualPosition === position) {
      return;
    }
    if (this.animate) {
      this.initAnimation(!this.sticky);
    }
    this.actualPosition = position;
    this.drawUpdate();
  }

  private initAnimation(withClone: boolean) {
    clearTimeout(this.animationTimeout);
    if (this.animationState) {
      this.animationState.targetTime = new Date().getTime() + (this.animate * this.animationState.animationState);
      this.drawUpdate();
      this.continueAnimation();
    } else {
      this.animationState = {
        cloneElement: withClone ? this.panel.nativeElement.cloneNode(true) as HTMLElement : null,
        animationState: 0,
        targetTime: new Date().getTime() + this.animate,
      };
      if (this.animationState.cloneElement) {
        this.panel.nativeElement.parentElement.appendChild(this.animationState.cloneElement);
      }
      this.continueAnimation();
    }
  }

  private continueAnimation() {
    clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => {
      this.drawUpdate();
      if (this.animationState.animationState >= 1) {
        this.stopAnimation();
      } else {
        this.continueAnimation();
      }
    }, 20);
  }

  private stopAnimation() {
    clearTimeout(this.animationTimeout);
    if (this.animationState?.cloneElement) {
      this.animationState.cloneElement.remove();
    }
    this.animationState = null;
    this.drawUpdate();
  }


  private drawUpdate() {
    if (this.animationState) {
      this.animationState.animationState = 1 - (this.animationState.targetTime - new Date().getTime()) / this.animate;
    }

    const animationStateSize = this.direction === 'horizontal' ? this.panel.nativeElement.getBoundingClientRect().width : this.panel.nativeElement.getBoundingClientRect().height;
    const animationStateDistance = animationStateSize + this.margin;
    const animationStateOffsetForClone = this.animationState ? this.animationState.animationState * animationStateDistance : animationStateDistance;
    const animationStateOffsetForPanel = this.animationState ? (1 - this.animationState.animationState) * animationStateDistance : 0;

    const draw = (selfKey: string, otherKey: string) => {
      if (this.animationState?.cloneElement) {
        this.animationState.cloneElement.style[selfKey] = '';
        this.animationState.cloneElement.style[otherKey] = `${this.margin - animationStateOffsetForClone}px`;
      }
      if (this.sticky) {
        if (this.stickyVisible) {
          this.panel.nativeElement.style[otherKey] = '';
          this.panel.nativeElement.style[selfKey] = `${this.margin - animationStateOffsetForPanel}px`;
        } else {
          this.panel.nativeElement.style[otherKey] = '';
          this.panel.nativeElement.style[selfKey] = `${this.margin - animationStateOffsetForClone}px`;
        }
      } else {
        this.panel.nativeElement.style[otherKey] = '';
        this.panel.nativeElement.style[selfKey] = `${this.margin - animationStateOffsetForPanel}px`;
      }
    };

    if (this.actualPosition === 'top') {
      draw('top', 'bottom');
    }
    if (this.actualPosition === 'bottom') {
      draw('bottom', 'top');
    }
    if (this.actualPosition === 'left') {
      draw('left', 'right');
    }
    if (this.actualPosition === 'right') {
      draw('right', 'left');
    }
  }

}
