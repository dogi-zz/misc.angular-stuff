import { Component, Input, ViewChild } from '@angular/core';
import * as i0 from "@angular/core";
export class InfoPanelComponent {
    container;
    panel;
    margin = 0;
    animate = 0;
    anchor;
    direction;
    sticky;
    stickyVisible;
    style;
    fullSize;
    fullMargin;
    actualPosition;
    isInitialised = false;
    animationState = null;
    animationTimeout = null;
    constructor() {
    }
    ngOnInit() {
    }
    ngAfterViewInit() {
        this.isInitialised = true;
        this.initContainer();
    }
    ngOnChanges(changes) {
        if (changes.container) {
            this.initContainer();
        }
        if (changes.stickyVisible && this.isInitialised) {
            if (this.sticky) {
                this.initAnimation(false);
            }
        }
    }
    ngOnDestroy() {
        this.stopAnimation();
    }
    initContainer() {
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
                    }
                    else {
                        this.actualPosition = 'left';
                    }
                }
                else {
                    if (this.anchor === 'top') {
                        this.actualPosition = 'top';
                    }
                    else {
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
                            }
                            else {
                                this.placeTo('left');
                            }
                        }
                        else if (this.anchor === 'right') {
                            if (event.clientX > gapPointRight) {
                                this.placeTo('left');
                            }
                            else {
                                this.placeTo('right');
                            }
                        }
                        else {
                            if (this.actualPosition === 'left' && event.clientX < gapPointLeft) {
                                this.placeTo('right');
                            }
                            else if (this.actualPosition === 'right' && event.clientX > gapPointRight) {
                                this.placeTo('left');
                            }
                        }
                    }
                    else {
                        if (this.anchor === 'top') {
                            if (event.clientY < gapPointTop) {
                                this.placeTo('bottom');
                            }
                            else {
                                this.placeTo('top');
                            }
                        }
                        else if (this.anchor === 'bottom') {
                            if (event.clientY > gapPointBottom) {
                                this.placeTo('top');
                            }
                            else {
                                this.placeTo('bottom');
                            }
                        }
                        else {
                            if (this.actualPosition === 'top' && event.clientY < gapPointTop) {
                                this.placeTo('bottom');
                            }
                            else if (this.actualPosition === 'bottom' && event.clientY > gapPointBottom) {
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
    checkPanelSize() {
        if (this.direction === 'horizontal') {
            const containerHeight = this.container.getBoundingClientRect().height;
            const height = this.panel.nativeElement.getBoundingClientRect().height;
            if (this.fullSize) {
                this.panel.nativeElement.style.top = `${this.fullMargin || 0}px`;
                this.panel.nativeElement.style.bottom = `${this.fullMargin || 0}px`;
            }
            else {
                this.panel.nativeElement.style.top = `${(containerHeight - height) / 2}px`;
            }
        }
        else {
            const containerWidth = this.container.getBoundingClientRect().width;
            const width = this.panel.nativeElement.getBoundingClientRect().width;
            if (this.fullSize) {
                this.panel.nativeElement.style.left = `${this.fullMargin || 0}px`;
                this.panel.nativeElement.style.right = `${this.fullMargin || 0}px`;
            }
            else {
                this.panel.nativeElement.style.left = `${(containerWidth - width) / 2}px`;
            }
        }
        this.drawUpdate();
    }
    placeTo(position) {
        if (this.actualPosition === position) {
            return;
        }
        if (this.animate) {
            this.initAnimation(!this.sticky);
        }
        this.actualPosition = position;
        this.drawUpdate();
    }
    initAnimation(withClone) {
        clearTimeout(this.animationTimeout);
        if (this.animationState) {
            this.animationState.targetTime = new Date().getTime() + (this.animate * this.animationState.animationState);
            this.drawUpdate();
            this.continueAnimation();
        }
        else {
            this.animationState = {
                cloneElement: withClone ? this.panel.nativeElement.cloneNode(true) : null,
                animationState: 0,
                targetTime: new Date().getTime() + this.animate,
            };
            if (this.animationState.cloneElement) {
                this.panel.nativeElement.parentElement.appendChild(this.animationState.cloneElement);
            }
            this.continueAnimation();
        }
    }
    continueAnimation() {
        clearTimeout(this.animationTimeout);
        this.animationTimeout = setTimeout(() => {
            this.drawUpdate();
            if (this.animationState.animationState >= 1) {
                this.stopAnimation();
            }
            else {
                this.continueAnimation();
            }
        }, 20);
    }
    stopAnimation() {
        clearTimeout(this.animationTimeout);
        if (this.animationState?.cloneElement) {
            this.animationState.cloneElement.remove();
        }
        this.animationState = null;
        this.drawUpdate();
    }
    drawUpdate() {
        if (this.animationState) {
            this.animationState.animationState = 1 - (this.animationState.targetTime - new Date().getTime()) / this.animate;
        }
        const animationStateSize = this.direction === 'horizontal' ? this.panel.nativeElement.getBoundingClientRect().width : this.panel.nativeElement.getBoundingClientRect().height;
        const animationStateDistance = animationStateSize + this.margin;
        const animationStateOffsetForClone = this.animationState ? this.animationState.animationState * animationStateDistance : animationStateDistance;
        const animationStateOffsetForPanel = this.animationState ? (1 - this.animationState.animationState) * animationStateDistance : 0;
        const draw = (selfKey, otherKey) => {
            if (this.animationState?.cloneElement) {
                this.animationState.cloneElement.style[selfKey] = '';
                this.animationState.cloneElement.style[otherKey] = `${this.margin - animationStateOffsetForClone}px`;
            }
            if (this.sticky) {
                if (this.stickyVisible) {
                    this.panel.nativeElement.style[otherKey] = '';
                    this.panel.nativeElement.style[selfKey] = `${this.margin - animationStateOffsetForPanel}px`;
                }
                else {
                    this.panel.nativeElement.style[otherKey] = '';
                    this.panel.nativeElement.style[selfKey] = `${this.margin - animationStateOffsetForClone}px`;
                }
            }
            else {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: InfoPanelComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.1.7", type: InfoPanelComponent, selector: "info-panel", inputs: { container: "container", margin: "margin", animate: "animate", anchor: "anchor", direction: "direction", sticky: "sticky", stickyVisible: "stickyVisible", style: "style", fullSize: "fullSize", fullMargin: "fullMargin" }, viewQueries: [{ propertyName: "panel", first: true, predicate: ["panel"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <div class="info-panel" #panel [ngStyle]="style">
      <ng-content></ng-content>
    </div>`, isInline: true, styles: [".info-panel{box-shadow:#00000026 1.95px 1.95px 2.6px}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: InfoPanelComponent, decorators: [{
            type: Component,
            args: [{ selector: 'info-panel', template: `
    <div class="info-panel" #panel [ngStyle]="style">
      <ng-content></ng-content>
    </div>`, styles: [".info-panel{box-shadow:#00000026 1.95px 1.95px 2.6px}\n"] }]
        }], ctorParameters: function () { return []; }, propDecorators: { container: [{
                type: Input
            }], panel: [{
                type: ViewChild,
                args: ['panel']
            }], margin: [{
                type: Input
            }], animate: [{
                type: Input
            }], anchor: [{
                type: Input
            }], direction: [{
                type: Input
            }], sticky: [{
                type: Input
            }], stickyVisible: [{
                type: Input
            }], style: [{
                type: Input
            }], fullSize: [{
                type: Input
            }], fullMargin: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mby1wYW5lbC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmZvLXBhbmVsLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWdCLFNBQVMsRUFBYyxLQUFLLEVBQStDLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFnQmxJLE1BQU0sT0FBTyxrQkFBa0I7SUFHdEIsU0FBUyxDQUFjO0lBR3ZCLEtBQUssQ0FBMEI7SUFHL0IsTUFBTSxHQUFXLENBQUMsQ0FBQztJQUduQixPQUFPLEdBQVcsQ0FBQyxDQUFDO0lBR3BCLE1BQU0sQ0FBc0M7SUFHNUMsU0FBUyxDQUE0QjtJQUdyQyxNQUFNLENBQVU7SUFHaEIsYUFBYSxDQUFVO0lBR3ZCLEtBQUssQ0FBTTtJQUdYLFFBQVEsQ0FBVTtJQUdsQixVQUFVLENBQVM7SUFHbEIsY0FBYyxDQUFzQztJQUNwRCxhQUFhLEdBQUcsS0FBSyxDQUFDO0lBRXRCLGNBQWMsR0FJbEIsSUFBSSxDQUFDO0lBQ0QsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0lBRWhDO0lBQ0EsQ0FBQztJQUVNLFFBQVE7SUFDZixDQUFDO0lBRU0sZUFBZTtRQUNwQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUMxQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVNLFdBQVcsQ0FBQyxPQUFzQjtRQUN2QyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDckIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ3RCO1FBQ0QsSUFBSSxPQUFPLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDL0MsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNmLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDM0I7U0FDRjtJQUNILENBQUM7SUFFTSxXQUFXO1FBQ2hCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FB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Qjs7O1dBR0Q7OzJGQU9FLGtCQUFrQjtrQkFaOUIsU0FBUzsrQkFDRSxZQUFZLFlBQ1o7OztXQUdEOzBFQVVGLFNBQVM7c0JBRGYsS0FBSztnQkFJQyxLQUFLO3NCQURYLFNBQVM7dUJBQUMsT0FBTztnQkFJWCxNQUFNO3NCQURaLEtBQUs7Z0JBSUMsT0FBTztzQkFEYixLQUFLO2dCQUlDLE1BQU07c0JBRFosS0FBSztnQkFJQyxTQUFTO3NCQURmLEtBQUs7Z0JBSUMsTUFBTTtzQkFEWixLQUFLO2dCQUlDLGFBQWE7c0JBRG5CLEtBQUs7Z0JBSUMsS0FBSztzQkFEWCxLQUFLO2dCQUlDLFFBQVE7c0JBRGQsS0FBSztnQkFJQyxVQUFVO3NCQURoQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgT25Jbml0LCBTaW1wbGVDaGFuZ2VzLCBWaWV3Q2hpbGR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5kZWNsYXJlIGNvbnN0IFJlc2l6ZU9ic2VydmVyOiBhbnk7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2luZm8tcGFuZWwnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXYgY2xhc3M9XCJpbmZvLXBhbmVsXCIgI3BhbmVsIFtuZ1N0eWxlXT1cInN0eWxlXCI+XG4gICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgPC9kaXY+YCxcbiAgc3R5bGVzOiBbXG4gICAgYC5pbmZvLXBhbmVsIHtcbiAgICAgIGJveC1zaGFkb3c6IHJnYmEoMCwgMCwgMCwgMC4xNSkgMS45NXB4IDEuOTVweCAyLjZweDtcbiAgICB9YCxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgSW5mb1BhbmVsQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG5cbiAgQElucHV0KClcbiAgcHVibGljIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQ7XG5cbiAgQFZpZXdDaGlsZCgncGFuZWwnKVxuICBwdWJsaWMgcGFuZWw6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+O1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBtYXJnaW46IG51bWJlciA9IDA7XG5cbiAgQElucHV0KClcbiAgcHVibGljIGFuaW1hdGU6IG51bWJlciA9IDA7XG5cbiAgQElucHV0KClcbiAgcHVibGljIGFuY2hvcjogJ3RvcCcgfCAnYm90dG9tJyB8ICdsZWZ0JyB8ICdyaWdodCc7XG5cbiAgQElucHV0KClcbiAgcHVibGljIGRpcmVjdGlvbjogJ3ZlcnRpY2FsJyB8ICdob3Jpem9udGFsJztcblxuICBASW5wdXQoKVxuICBwdWJsaWMgc3RpY2t5OiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzdGlja3lWaXNpYmxlOiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzdHlsZTogYW55O1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBmdWxsU2l6ZTogYm9vbGVhbjtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgZnVsbE1hcmdpbjogbnVtYmVyO1xuXG5cbiAgcHJpdmF0ZSBhY3R1YWxQb3NpdGlvbjogJ3RvcCcgfCAnYm90dG9tJyB8ICdsZWZ0JyB8ICdyaWdodCc7XG4gIHByaXZhdGUgaXNJbml0aWFsaXNlZCA9IGZhbHNlO1xuXG4gIHByaXZhdGUgYW5pbWF0aW9uU3RhdGU6IHtcbiAgICBjbG9uZUVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICAgIGFuaW1hdGlvblN0YXRlOiBudW1iZXIsXG4gICAgdGFyZ2V0VGltZTogbnVtYmVyLFxuICB9ID0gbnVsbDtcbiAgcHJpdmF0ZSBhbmltYXRpb25UaW1lb3V0ID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgfVxuXG4gIHB1YmxpYyBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgfVxuXG4gIHB1YmxpYyBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgdGhpcy5pc0luaXRpYWxpc2VkID0gdHJ1ZTtcbiAgICB0aGlzLmluaXRDb250YWluZXIoKTtcbiAgfVxuXG4gIHB1YmxpYyBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKGNoYW5nZXMuY29udGFpbmVyKSB7XG4gICAgICB0aGlzLmluaXRDb250YWluZXIoKTtcbiAgICB9XG4gICAgaWYgKGNoYW5nZXMuc3RpY2t5VmlzaWJsZSAmJiB0aGlzLmlzSW5pdGlhbGlzZWQpIHtcbiAgICAgIGlmICh0aGlzLnN0aWNreSkge1xuICAgICAgICB0aGlzLmluaXRBbmltYXRpb24oZmFsc2UpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnN0b3BBbmltYXRpb24oKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdENvbnRhaW5lcigpIHtcbiAgICBpZiAodGhpcy5jb250YWluZXIgJiYgdGhpcy5wYW5lbD8ubmF0aXZlRWxlbWVudCkge1xuICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcblxuICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG5cbiAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZS50b3AgPSAnJztcbiAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5ib3R0b20gPSAnJztcbiAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5sZWZ0ID0gJyc7XG4gICAgICB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUucmlnaHQgPSAnJztcblxuICAgICAgaWYgKCF0aGlzLmFjdHVhbFBvc2l0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgaWYgKHRoaXMuYW5jaG9yID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgICB0aGlzLmFjdHVhbFBvc2l0aW9uID0gJ3JpZ2h0JztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3R1YWxQb3NpdGlvbiA9ICdsZWZ0JztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuYW5jaG9yID09PSAndG9wJykge1xuICAgICAgICAgICAgdGhpcy5hY3R1YWxQb3NpdGlvbiA9ICd0b3AnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdHVhbFBvc2l0aW9uID0gJ2JvdHRvbSc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmRyYXdVcGRhdGUoKTtcblxuICAgICAgaWYgKCF0aGlzLnN0aWNreSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBnYXBQb2ludFRvcCA9IHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgKyB0aGlzLm1hcmdpbiAqIDI7XG4gICAgICAgICAgY29uc3QgZ2FwUG9pbnRCb3R0b20gPSB0aGlzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b20gLSB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0IC0gdGhpcy5tYXJnaW4gKiAyO1xuICAgICAgICAgIGNvbnN0IGdhcFBvaW50TGVmdCA9IHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgKyB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGggKyB0aGlzLm1hcmdpbiAqIDI7XG4gICAgICAgICAgY29uc3QgZ2FwUG9pbnRSaWdodCA9IHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0IC0gdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoIC0gdGhpcy5tYXJnaW4gKiAyO1xuXG4gICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmFuY2hvciA9PT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICAgIGlmIChldmVudC5jbGllbnRYIDwgZ2FwUG9pbnRMZWZ0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGFjZVRvKCdyaWdodCcpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucGxhY2VUbygnbGVmdCcpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYW5jaG9yID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgICAgIGlmIChldmVudC5jbGllbnRYID4gZ2FwUG9pbnRSaWdodCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGxhY2VUbygnbGVmdCcpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucGxhY2VUbygncmlnaHQnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0dWFsUG9zaXRpb24gPT09ICdsZWZ0JyAmJiBldmVudC5jbGllbnRYIDwgZ2FwUG9pbnRMZWZ0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGFjZVRvKCdyaWdodCcpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWN0dWFsUG9zaXRpb24gPT09ICdyaWdodCcgJiYgZXZlbnQuY2xpZW50WCA+IGdhcFBvaW50UmlnaHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYWNlVG8oJ2xlZnQnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hbmNob3IgPT09ICd0b3AnKSB7XG4gICAgICAgICAgICAgIGlmIChldmVudC5jbGllbnRZIDwgZ2FwUG9pbnRUb3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYWNlVG8oJ2JvdHRvbScpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucGxhY2VUbygndG9wJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbmNob3IgPT09ICdib3R0b20nKSB7XG4gICAgICAgICAgICAgIGlmIChldmVudC5jbGllbnRZID4gZ2FwUG9pbnRCb3R0b20pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYWNlVG8oJ3RvcCcpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucGxhY2VUbygnYm90dG9tJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmFjdHVhbFBvc2l0aW9uID09PSAndG9wJyAmJiBldmVudC5jbGllbnRZIDwgZ2FwUG9pbnRUb3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYWNlVG8oJ2JvdHRvbScpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWN0dWFsUG9zaXRpb24gPT09ICdib3R0b20nICYmIGV2ZW50LmNsaWVudFkgPiBnYXBQb2ludEJvdHRvbSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGxhY2VUbygndG9wJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5hbmNob3IpIHtcbiAgICAgICAgICAgIHRoaXMucGxhY2VUbyh0aGlzLmFuY2hvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgfVxuXG4gICAgICBjb25zdCByZXNpemUgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICB0aGlzLmNoZWNrUGFuZWxTaXplKCk7XG4gICAgICB9KTtcbiAgICAgIHJlc2l6ZS5vYnNlcnZlKHRoaXMuY29udGFpbmVyKTtcbiAgICAgIHJlc2l6ZS5vYnNlcnZlKHRoaXMucGFuZWwubmF0aXZlRWxlbWVudCk7XG5cbiAgICAgIHRoaXMuY2hlY2tQYW5lbFNpemUoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNoZWNrUGFuZWxTaXplKCkge1xuICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICBjb25zdCBjb250YWluZXJIZWlnaHQgPSB0aGlzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgaWYgKHRoaXMuZnVsbFNpemUpIHtcbiAgICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLnRvcCA9IGAke3RoaXMuZnVsbE1hcmdpbiB8fCAwfXB4YDtcbiAgICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLmJvdHRvbSA9IGAke3RoaXMuZnVsbE1hcmdpbiB8fCAwfXB4YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZS50b3AgPSBgJHsoY29udGFpbmVySGVpZ2h0IC0gaGVpZ2h0KSAvIDJ9cHhgO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb250YWluZXJXaWR0aCA9IHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xuICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICBpZiAodGhpcy5mdWxsU2l6ZSkge1xuICAgICAgICB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUubGVmdCA9IGAke3RoaXMuZnVsbE1hcmdpbiB8fCAwfXB4YDtcbiAgICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLnJpZ2h0ID0gYCR7dGhpcy5mdWxsTWFyZ2luIHx8IDB9cHhgO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLmxlZnQgPSBgJHsoY29udGFpbmVyV2lkdGggLSB3aWR0aCkgLyAyfXB4YDtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5kcmF3VXBkYXRlKClcbiAgfVxuXG5cbiAgcHJpdmF0ZSBwbGFjZVRvKHBvc2l0aW9uOiAndG9wJyB8ICdib3R0b20nIHwgJ2xlZnQnIHwgJ3JpZ2h0Jykge1xuICAgIGlmICh0aGlzLmFjdHVhbFBvc2l0aW9uID09PSBwb3NpdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5hbmltYXRlKSB7XG4gICAgICB0aGlzLmluaXRBbmltYXRpb24oIXRoaXMuc3RpY2t5KTtcbiAgICB9XG4gICAgdGhpcy5hY3R1YWxQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuZHJhd1VwZGF0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0QW5pbWF0aW9uKHdpdGhDbG9uZTogYm9vbGVhbikge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmFuaW1hdGlvblRpbWVvdXQpO1xuICAgIGlmICh0aGlzLmFuaW1hdGlvblN0YXRlKSB7XG4gICAgICB0aGlzLmFuaW1hdGlvblN0YXRlLnRhcmdldFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSArICh0aGlzLmFuaW1hdGUgKiB0aGlzLmFuaW1hdGlvblN0YXRlLmFuaW1hdGlvblN0YXRlKTtcbiAgICAgIHRoaXMuZHJhd1VwZGF0ZSgpO1xuICAgICAgdGhpcy5jb250aW51ZUFuaW1hdGlvbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFuaW1hdGlvblN0YXRlID0ge1xuICAgICAgICBjbG9uZUVsZW1lbnQ6IHdpdGhDbG9uZSA/IHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQgOiBudWxsLFxuICAgICAgICBhbmltYXRpb25TdGF0ZTogMCxcbiAgICAgICAgdGFyZ2V0VGltZTogbmV3IERhdGUoKS5nZXRUaW1lKCkgKyB0aGlzLmFuaW1hdGUsXG4gICAgICB9O1xuICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uU3RhdGUuY2xvbmVFbGVtZW50KSB7XG4gICAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5wYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuYW5pbWF0aW9uU3RhdGUuY2xvbmVFbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29udGludWVBbmltYXRpb24oKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNvbnRpbnVlQW5pbWF0aW9uKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmFuaW1hdGlvblRpbWVvdXQpO1xuICAgIHRoaXMuYW5pbWF0aW9uVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5kcmF3VXBkYXRlKCk7XG4gICAgICBpZiAodGhpcy5hbmltYXRpb25TdGF0ZS5hbmltYXRpb25TdGF0ZSA+PSAxKSB7XG4gICAgICAgIHRoaXMuc3RvcEFuaW1hdGlvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb250aW51ZUFuaW1hdGlvbigpO1xuICAgICAgfVxuICAgIH0sIDIwKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RvcEFuaW1hdGlvbigpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5hbmltYXRpb25UaW1lb3V0KTtcbiAgICBpZiAodGhpcy5hbmltYXRpb25TdGF0ZT8uY2xvbmVFbGVtZW50KSB7XG4gICAgICB0aGlzLmFuaW1hdGlvblN0YXRlLmNsb25lRWxlbWVudC5yZW1vdmUoKTtcbiAgICB9XG4gICAgdGhpcy5hbmltYXRpb25TdGF0ZSA9IG51bGw7XG4gICAgdGhpcy5kcmF3VXBkYXRlKCk7XG4gIH1cblxuXG4gIHByaXZhdGUgZHJhd1VwZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5hbmltYXRpb25TdGF0ZSkge1xuICAgICAgdGhpcy5hbmltYXRpb25TdGF0ZS5hbmltYXRpb25TdGF0ZSA9IDEgLSAodGhpcy5hbmltYXRpb25TdGF0ZS50YXJnZXRUaW1lIC0gbmV3IERhdGUoKS5nZXRUaW1lKCkpIC8gdGhpcy5hbmltYXRlO1xuICAgIH1cblxuICAgIGNvbnN0IGFuaW1hdGlvblN0YXRlU2l6ZSA9IHRoaXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcgPyB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGggOiB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgIGNvbnN0IGFuaW1hdGlvblN0YXRlRGlzdGFuY2UgPSBhbmltYXRpb25TdGF0ZVNpemUgKyB0aGlzLm1hcmdpbjtcbiAgICBjb25zdCBhbmltYXRpb25TdGF0ZU9mZnNldEZvckNsb25lID0gdGhpcy5hbmltYXRpb25TdGF0ZSA/IHRoaXMuYW5pbWF0aW9uU3RhdGUuYW5pbWF0aW9uU3RhdGUgKiBhbmltYXRpb25TdGF0ZURpc3RhbmNlIDogYW5pbWF0aW9uU3RhdGVEaXN0YW5jZTtcbiAgICBjb25zdCBhbmltYXRpb25TdGF0ZU9mZnNldEZvclBhbmVsID0gdGhpcy5hbmltYXRpb25TdGF0ZSA/ICgxIC0gdGhpcy5hbmltYXRpb25TdGF0ZS5hbmltYXRpb25TdGF0ZSkgKiBhbmltYXRpb25TdGF0ZURpc3RhbmNlIDogMDtcblxuICAgIGNvbnN0IGRyYXcgPSAoc2VsZktleTogc3RyaW5nLCBvdGhlcktleTogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAodGhpcy5hbmltYXRpb25TdGF0ZT8uY2xvbmVFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUuY2xvbmVFbGVtZW50LnN0eWxlW3NlbGZLZXldID0gJyc7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUuY2xvbmVFbGVtZW50LnN0eWxlW290aGVyS2V5XSA9IGAke3RoaXMubWFyZ2luIC0gYW5pbWF0aW9uU3RhdGVPZmZzZXRGb3JDbG9uZX1weGA7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zdGlja3kpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RpY2t5VmlzaWJsZSkge1xuICAgICAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZVtvdGhlcktleV0gPSAnJztcbiAgICAgICAgICB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGVbc2VsZktleV0gPSBgJHt0aGlzLm1hcmdpbiAtIGFuaW1hdGlvblN0YXRlT2Zmc2V0Rm9yUGFuZWx9cHhgO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZVtvdGhlcktleV0gPSAnJztcbiAgICAgICAgICB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGVbc2VsZktleV0gPSBgJHt0aGlzLm1hcmdpbiAtIGFuaW1hdGlvblN0YXRlT2Zmc2V0Rm9yQ2xvbmV9cHhgO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGVbb3RoZXJLZXldID0gJyc7XG4gICAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZVtzZWxmS2V5XSA9IGAke3RoaXMubWFyZ2luIC0gYW5pbWF0aW9uU3RhdGVPZmZzZXRGb3JQYW5lbH1weGA7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICh0aGlzLmFjdHVhbFBvc2l0aW9uID09PSAndG9wJykge1xuICAgICAgZHJhdygndG9wJywgJ2JvdHRvbScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5hY3R1YWxQb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIGRyYXcoJ2JvdHRvbScsICd0b3AnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuYWN0dWFsUG9zaXRpb24gPT09ICdsZWZ0Jykge1xuICAgICAgZHJhdygnbGVmdCcsICdyaWdodCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5hY3R1YWxQb3NpdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgICAgZHJhdygncmlnaHQnLCAnbGVmdCcpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=