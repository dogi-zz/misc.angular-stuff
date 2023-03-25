import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';

@Component({
  selector: 'slider',
  template: `
    <div class="slider" #slider
         [class.big]="size === 'big'" [class.medium]="size === 'medium'"
         [class.vertical]="orientation === 'vertical'" [class.horizontal]="orientation === 'horizontal'"
         (mousedown)="mouseDown($event)">
      <div class="bar" [ngStyle]="barBeforeOuterCss"></div>
      <div class="bar" [ngStyle]="barBeforeCss"></div>
      <div class="bar" [ngStyle]="barAfterCss"></div>
      <div class="bar" [ngStyle]="barAfterOuterCss"></div>
      <div class="handle" [ngStyle]="handleStyle"></div>
    </div>`,
  styles: [
    `
      .slider {
        position: relative;
      }

      .bar {
        position: absolute;
        border: none;
      }

      .handle {
        position: absolute;
        cursor: pointer;
      }

      .slider.horizontal .handle {
        top: 0;
      }

      .slider.vertical .handle {
        left: 0;
      }

      .slider.horizontal {
        width: 100%;
        height: 20px;
      }

      .slider.vertical {
        width: 20px;
        height: 100%;
      }

      .slider.horizontal.big .bar {
        top: 8px;
        height: 2px;
      }

      .slider.vertical.big .bar {
        left: 8px;
        width: 2px;
      }

      .slider.big .handle {
        border: 2px solid;
        border-radius: 6px;
        width: 18px;
        height: 18px;
      }

      .slider.horizontal.medium {
        height: 16px;
      }

      .slider.vertical.medium {
        width: 16px;
      }

      .slider.horizontal.medium .bar {
        top: 6px;
        height: 2px;
      }

      .slider.vertical.medium .bar {
        left: 6px;
        width: 2px;
      }

      .slider.medium .handle {
        border: 1px solid;
        border-radius: 4px;
        width: 14px;
        height: 14px;
      }

    `,
  ],
})
export class SliderComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChild('slider')
  public slider: ElementRef<HTMLElement>;

  @Input()
  public value: number;

  @Output()
  public valueChange = new EventEmitter<number>();

  @Input()
  public color: string;

  @Input()
  public min: number = 0;

  @Input()
  public max: number = 100;

  @Input()
  public size: 'medium' | 'big' = 'big';

  @Input()
  public orientation: 'horizontal' | 'vertical' = 'horizontal';


  public handleStyle: any = {};
  public barBeforeCss: any = {};
  public barAfterCss: any = {};
  public barBeforeOuterCss: any = {};
  public barAfterOuterCss: any = {};

  private slidingListener: any;
  private leaveListener: any;
  private endListener: any;

  private handleWidth: number;

  constructor() {
  }

  public ngOnInit(): void {
    this.handleWidth = this.size === 'medium' ? 16 : 20;
    this.update();
  }

  public ngAfterViewInit() {

  }

  public ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  public mouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.slide(event);
    if (!this.slidingListener) {
      this.slidingListener = (innerEvent) => {
        innerEvent.preventDefault();
        innerEvent.stopImmediatePropagation();
        this.slide(innerEvent);
      };
      this.endListener = () => {
        this.end();
      };
      this.leaveListener = (event) => {
        if (!event.toElement) {
          this.end();
        }
      };
      window.addEventListener('mousemove', this.slidingListener);
      window.addEventListener('mouseout', this.leaveListener);
      window.addEventListener('mouseup', this.endListener);
    }
  }

  private end() {
    window.removeEventListener('mousemove', this.slidingListener);
    window.removeEventListener('mouseout', this.leaveListener);
    window.removeEventListener('mouseup', this.endListener);
    this.slidingListener = null;
    this.leaveListener = null;
    this.endListener = null;
  }

  private slide(event: MouseEvent) {
    const hSize = this.handleWidth;
    const rect = this.slider.nativeElement.getBoundingClientRect();

    let value = this.value;
    if (this.orientation === 'horizontal') {
      const domWidth = rect.width;
      const mouseLeft = event.clientX - rect.left;
      const mouseLeftPercent = (mouseLeft - hSize / 2) / (domWidth - hSize) * 100;
      value = Math.max(this.min, Math.min(this.max, mouseLeftPercent));
    }
    if (this.orientation === 'vertical') {
      const domHeight = rect.height;
      const mouseTop = event.clientY - rect.top;
      const mouseTopPercent = (mouseTop - hSize / 2) / (domHeight - hSize) * 100;
      value = Math.max(this.min, Math.min(this.max, mouseTopPercent));
    }
    this.value = value;
    this.valueChange.emit(value);
    this.update();

  }


  public update() {
    const hSize = this.handleWidth;
    const hMargin = this.handleWidth / 4;

    const getCorrectedOffset = (val: number) => `( (100% - ${hSize}px) * ${val / 100} )`;

    const offsetParameter = this.orientation === 'vertical' ? 'top' : 'left';
    const offsetParameterInverted = this.orientation === 'vertical' ? 'bottom' : 'right';
    const sizeParameter = this.orientation === 'vertical' ? 'height' : 'width';

    const boxShadowBar = `0px 0px 0px 1px ${this.color} inset`;
    const boxShadowOuter = `0px 0px 0px 1px #cccccc inset`;
    this.handleStyle = {[offsetParameter]: `calc( ${getCorrectedOffset(this.value)} )`, borderColor: this.color};
    this.barBeforeCss = {[offsetParameter]: `calc( ${getCorrectedOffset(this.min)} )`, [sizeParameter]: `calc( ${getCorrectedOffset(this.value - this.min)} - ${hMargin}px )`, boxShadow: boxShadowBar};
    this.barAfterCss = {[offsetParameterInverted]: `calc( ${getCorrectedOffset(100 - this.max)} )`, [sizeParameter]: `calc( ${getCorrectedOffset((100 - this.value) - (100 - this.max))} - ${hMargin}px )`, boxShadow: boxShadowBar};

    this.barBeforeOuterCss = {[offsetParameter]: '0', [sizeParameter]: `calc( ${getCorrectedOffset(this.min)} )`, boxShadow: boxShadowOuter};
    this.barAfterOuterCss = {[offsetParameterInverted]: '0', [sizeParameter]: `calc( ${getCorrectedOffset(100 - this.max)} )`, boxShadow: boxShadowOuter};
  }

}
