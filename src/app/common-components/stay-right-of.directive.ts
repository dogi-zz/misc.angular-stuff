import {AfterViewInit, Directive, ElementRef, HostListener, Input, OnDestroy} from '@angular/core';


@Directive({
  selector: 'div[stay_right_of]',
})
export class StayRightOfDirective implements AfterViewInit, OnDestroy {

  private resizeObserver: ResizeObserver;

  @Input()
  public stay_right_of: HTMLDivElement;

  @Input()
  public stay_right_of_gap: number;

  @Input()
  public stay_right_of_min_width: number;

  constructor(
    private el: ElementRef,
  ) {
  }

  public ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver((entries) => {
      this.check();
    });
    this.resizeObserver.observe(this.stay_right_of);
    this.check();
  }

  public ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  @HostListener('window:resize', ['$event'])
  public onResize($event: any) {
    this.check();
  }

  private check() {
    const myLeft = this.el.nativeElement.getBoundingClientRect().left;
    const otherLeft = this.stay_right_of.getBoundingClientRect().left;
    this.el.nativeElement.style.maxWidth = `${Math.max(this.stay_right_of_min_width | 0, otherLeft - myLeft - (this.stay_right_of_gap | 0))}px`;
  }

}
