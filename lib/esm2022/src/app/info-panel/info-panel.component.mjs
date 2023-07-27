import { Component, Input, ViewChild } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
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
    </div>`, isInline: true, styles: [".info-panel{box-shadow:#00000026 1.95px 1.95px 2.6px}\n"], dependencies: [{ kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }] });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mby1wYW5lbC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvYXBwL2luZm8tcGFuZWwvaW5mby1wYW5lbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFnQixTQUFTLEVBQWMsS0FBSyxFQUErQyxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7OztBQWdCbEksTUFBTSxPQUFPLGtCQUFrQjtJQUd0QixTQUFTLENBQWM7SUFHdkIsS0FBSyxDQUEwQjtJQUcvQixNQUFNLEdBQVcsQ0FBQyxDQUFDO0lBR25CLE9BQU8sR0FBVyxDQUFDLENBQUM7SUFHcEIsTUFBTSxDQUFzQztJQUc1QyxTQUFTLENBQTRCO0lBR3JDLE1BQU0sQ0FBVTtJQUdoQixhQUFhLENBQVU7SUFHdkIsS0FBSyxDQUFNO0lBR1gsUUFBUSxDQUFVO0lBR2xCLFVBQVUsQ0FBUztJQUdsQixjQUFjLENBQXNDO0lBQ3BELGFBQWEsR0FBRyxLQUFLLENBQUM7SUFFdEIsY0FBYyxHQUlsQixJQUFJLENBQUM7SUFDRCxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7SUFFaEM7SUFDQSxDQUFDO0lBRU0sUUFBUTtJQUNmLENBQUM7SUFFTSxlQUFlO1FBQ3BCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQzFCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRU0sV0FBVyxDQUFDLE9BQXNCO1FBQ3ZDLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUNyQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDdEI7UUFDRCxJQUFJLE9BQU8sQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUMvQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMzQjtTQUNGO0lBQ0gsQ0FBQztJQUVN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Qzt1R0EvUlUsa0JBQWtCOzJGQUFsQixrQkFBa0IsNllBVm5COzs7V0FHRDs7MkZBT0Usa0JBQWtCO2tCQVo5QixTQUFTOytCQUNFLFlBQVksWUFDWjs7O1dBR0Q7MEVBVUYsU0FBUztzQkFEZixLQUFLO2dCQUlDLEtBQUs7c0JBRFgsU0FBUzt1QkFBQyxPQUFPO2dCQUlYLE1BQU07c0JBRFosS0FBSztnQkFJQyxPQUFPO3NCQURiLEtBQUs7Z0JBSUMsTUFBTTtzQkFEWixLQUFLO2dCQUlDLFNBQVM7c0JBRGYsS0FBSztnQkFJQyxNQUFNO3NCQURaLEtBQUs7Z0JBSUMsYUFBYTtzQkFEbkIsS0FBSztnQkFJQyxLQUFLO3NCQURYLEtBQUs7Z0JBSUMsUUFBUTtzQkFEZCxLQUFLO2dCQUlDLFVBQVU7c0JBRGhCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFNpbXBsZUNoYW5nZXMsIFZpZXdDaGlsZH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmRlY2xhcmUgY29uc3QgUmVzaXplT2JzZXJ2ZXI6IGFueTtcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnaW5mby1wYW5lbCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiBjbGFzcz1cImluZm8tcGFuZWxcIiAjcGFuZWwgW25nU3R5bGVdPVwic3R5bGVcIj5cbiAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAgICA8L2Rpdj5gLFxuICBzdHlsZXM6IFtcbiAgICBgLmluZm8tcGFuZWwge1xuICAgICAgYm94LXNoYWRvdzogcmdiYSgwLCAwLCAwLCAwLjE1KSAxLjk1cHggMS45NXB4IDIuNnB4O1xuICAgIH1gLFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBJbmZvUGFuZWxDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgY29udGFpbmVyOiBIVE1MRWxlbWVudDtcblxuICBAVmlld0NoaWxkKCdwYW5lbCcpXG4gIHB1YmxpYyBwYW5lbDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD47XG5cbiAgQElucHV0KClcbiAgcHVibGljIG1hcmdpbjogbnVtYmVyID0gMDtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgYW5pbWF0ZTogbnVtYmVyID0gMDtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgYW5jaG9yOiAndG9wJyB8ICdib3R0b20nIHwgJ2xlZnQnIHwgJ3JpZ2h0JztcblxuICBASW5wdXQoKVxuICBwdWJsaWMgZGlyZWN0aW9uOiAndmVydGljYWwnIHwgJ2hvcml6b250YWwnO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzdGlja3k6IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgcHVibGljIHN0aWNreVZpc2libGU6IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgcHVibGljIHN0eWxlOiBhbnk7XG5cbiAgQElucHV0KClcbiAgcHVibGljIGZ1bGxTaXplOiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBmdWxsTWFyZ2luOiBudW1iZXI7XG5cblxuICBwcml2YXRlIGFjdHVhbFBvc2l0aW9uOiAndG9wJyB8ICdib3R0b20nIHwgJ2xlZnQnIHwgJ3JpZ2h0JztcbiAgcHJpdmF0ZSBpc0luaXRpYWxpc2VkID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBhbmltYXRpb25TdGF0ZToge1xuICAgIGNsb25lRWxlbWVudDogSFRNTEVsZW1lbnQsXG4gICAgYW5pbWF0aW9uU3RhdGU6IG51bWJlcixcbiAgICB0YXJnZXRUaW1lOiBudW1iZXIsXG4gIH0gPSBudWxsO1xuICBwcml2YXRlIGFuaW1hdGlvblRpbWVvdXQgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICB9XG5cbiAgcHVibGljIG5nT25Jbml0KCk6IHZvaWQge1xuICB9XG5cbiAgcHVibGljIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLmlzSW5pdGlhbGlzZWQgPSB0cnVlO1xuICAgIHRoaXMuaW5pdENvbnRhaW5lcigpO1xuICB9XG5cbiAgcHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoY2hhbmdlcy5jb250YWluZXIpIHtcbiAgICAgIHRoaXMuaW5pdENvbnRhaW5lcigpO1xuICAgIH1cbiAgICBpZiAoY2hhbmdlcy5zdGlja3lWaXNpYmxlICYmIHRoaXMuaXNJbml0aWFsaXNlZCkge1xuICAgICAgaWYgKHRoaXMuc3RpY2t5KSB7XG4gICAgICAgIHRoaXMuaW5pdEFuaW1hdGlvbihmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuc3RvcEFuaW1hdGlvbigpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0Q29udGFpbmVyKCkge1xuICAgIGlmICh0aGlzLmNvbnRhaW5lciAmJiB0aGlzLnBhbmVsPy5uYXRpdmVFbGVtZW50KSB7XG4gICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuXG4gICAgICB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcblxuICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLnRvcCA9ICcnO1xuICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLmJvdHRvbSA9ICcnO1xuICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLmxlZnQgPSAnJztcbiAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5yaWdodCA9ICcnO1xuXG4gICAgICBpZiAoIXRoaXMuYWN0dWFsUG9zaXRpb24pIHtcbiAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgICBpZiAodGhpcy5hbmNob3IgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0dWFsUG9zaXRpb24gPSAncmlnaHQnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdHVhbFBvc2l0aW9uID0gJ2xlZnQnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5hbmNob3IgPT09ICd0b3AnKSB7XG4gICAgICAgICAgICB0aGlzLmFjdHVhbFBvc2l0aW9uID0gJ3RvcCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0dWFsUG9zaXRpb24gPSAnYm90dG9tJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZHJhd1VwZGF0ZSgpO1xuXG4gICAgICBpZiAoIXRoaXMuc3RpY2t5KSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChldmVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGdhcFBvaW50VG9wID0gdGhpcy5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wICsgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCArIHRoaXMubWFyZ2luICogMjtcbiAgICAgICAgICBjb25zdCBnYXBQb2ludEJvdHRvbSA9IHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbSAtIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgLSB0aGlzLm1hcmdpbiAqIDI7XG4gICAgICAgICAgY29uc3QgZ2FwUG9pbnRMZWZ0ID0gdGhpcy5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCArIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCArIHRoaXMubWFyZ2luICogMjtcbiAgICAgICAgICBjb25zdCBnYXBQb2ludFJpZ2h0ID0gdGhpcy5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgLSB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGggLSB0aGlzLm1hcmdpbiAqIDI7XG5cbiAgICAgICAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuYW5jaG9yID09PSAnbGVmdCcpIHtcbiAgICAgICAgICAgICAgaWYgKGV2ZW50LmNsaWVudFggPCBnYXBQb2ludExlZnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYWNlVG8oJ3JpZ2h0Jyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGFjZVRvKCdsZWZ0Jyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbmNob3IgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgICAgaWYgKGV2ZW50LmNsaWVudFggPiBnYXBQb2ludFJpZ2h0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGFjZVRvKCdsZWZ0Jyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGFjZVRvKCdyaWdodCcpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAodGhpcy5hY3R1YWxQb3NpdGlvbiA9PT0gJ2xlZnQnICYmIGV2ZW50LmNsaWVudFggPCBnYXBQb2ludExlZnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYWNlVG8oJ3JpZ2h0Jyk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5hY3R1YWxQb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiBldmVudC5jbGllbnRYID4gZ2FwUG9pbnRSaWdodCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGxhY2VUbygnbGVmdCcpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmFuY2hvciA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgICAgaWYgKGV2ZW50LmNsaWVudFkgPCBnYXBQb2ludFRvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGxhY2VUbygnYm90dG9tJyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGFjZVRvKCd0b3AnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFuY2hvciA9PT0gJ2JvdHRvbScpIHtcbiAgICAgICAgICAgICAgaWYgKGV2ZW50LmNsaWVudFkgPiBnYXBQb2ludEJvdHRvbSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGxhY2VUbygndG9wJyk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGFjZVRvKCdib3R0b20nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0dWFsUG9zaXRpb24gPT09ICd0b3AnICYmIGV2ZW50LmNsaWVudFkgPCBnYXBQb2ludFRvcCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGxhY2VUbygnYm90dG9tJyk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5hY3R1YWxQb3NpdGlvbiA9PT0gJ2JvdHRvbScgJiYgZXZlbnQuY2xpZW50WSA+IGdhcFBvaW50Qm90dG9tKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGFjZVRvKCd0b3AnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIChldmVudCkgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLmFuY2hvcikge1xuICAgICAgICAgICAgdGhpcy5wbGFjZVRvKHRoaXMuYW5jaG9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlc2l6ZSA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgIHRoaXMuY2hlY2tQYW5lbFNpemUoKTtcbiAgICAgIH0pO1xuICAgICAgcmVzaXplLm9ic2VydmUodGhpcy5jb250YWluZXIpO1xuICAgICAgcmVzaXplLm9ic2VydmUodGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50KTtcblxuICAgICAgdGhpcy5jaGVja1BhbmVsU2l6ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2hlY2tQYW5lbFNpemUoKSB7XG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgIGNvbnN0IGNvbnRhaW5lckhlaWdodCA9IHRoaXMuY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICBpZiAodGhpcy5mdWxsU2l6ZSkge1xuICAgICAgICB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUudG9wID0gYCR7dGhpcy5mdWxsTWFyZ2luIHx8IDB9cHhgO1xuICAgICAgICB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUuYm90dG9tID0gYCR7dGhpcy5mdWxsTWFyZ2luIHx8IDB9cHhgO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLnRvcCA9IGAkeyhjb250YWluZXJIZWlnaHQgLSBoZWlnaHQpIC8gMn1weGA7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNvbnRhaW5lcldpZHRoID0gdGhpcy5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICBjb25zdCB3aWR0aCA9IHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgIGlmICh0aGlzLmZ1bGxTaXplKSB7XG4gICAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5sZWZ0ID0gYCR7dGhpcy5mdWxsTWFyZ2luIHx8IDB9cHhgO1xuICAgICAgICB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUucmlnaHQgPSBgJHt0aGlzLmZ1bGxNYXJnaW4gfHwgMH1weGA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhbmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUubGVmdCA9IGAkeyhjb250YWluZXJXaWR0aCAtIHdpZHRoKSAvIDJ9cHhgO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmRyYXdVcGRhdGUoKVxuICB9XG5cblxuICBwcml2YXRlIHBsYWNlVG8ocG9zaXRpb246ICd0b3AnIHwgJ2JvdHRvbScgfCAnbGVmdCcgfCAncmlnaHQnKSB7XG4gICAgaWYgKHRoaXMuYWN0dWFsUG9zaXRpb24gPT09IHBvc2l0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmFuaW1hdGUpIHtcbiAgICAgIHRoaXMuaW5pdEFuaW1hdGlvbighdGhpcy5zdGlja3kpO1xuICAgIH1cbiAgICB0aGlzLmFjdHVhbFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5kcmF3VXBkYXRlKCk7XG4gIH1cblxuICBwcml2YXRlIGluaXRBbmltYXRpb24od2l0aENsb25lOiBib29sZWFuKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuYW5pbWF0aW9uVGltZW91dCk7XG4gICAgaWYgKHRoaXMuYW5pbWF0aW9uU3RhdGUpIHtcbiAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUudGFyZ2V0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgKHRoaXMuYW5pbWF0ZSAqIHRoaXMuYW5pbWF0aW9uU3RhdGUuYW5pbWF0aW9uU3RhdGUpO1xuICAgICAgdGhpcy5kcmF3VXBkYXRlKCk7XG4gICAgICB0aGlzLmNvbnRpbnVlQW5pbWF0aW9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUgPSB7XG4gICAgICAgIGNsb25lRWxlbWVudDogd2l0aENsb25lID8gdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudCA6IG51bGwsXG4gICAgICAgIGFuaW1hdGlvblN0YXRlOiAwLFxuICAgICAgICB0YXJnZXRUaW1lOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSArIHRoaXMuYW5pbWF0ZSxcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5hbmltYXRpb25TdGF0ZS5jbG9uZUVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5hbmltYXRpb25TdGF0ZS5jbG9uZUVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb250aW51ZUFuaW1hdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY29udGludWVBbmltYXRpb24oKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuYW5pbWF0aW9uVGltZW91dCk7XG4gICAgdGhpcy5hbmltYXRpb25UaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmRyYXdVcGRhdGUoKTtcbiAgICAgIGlmICh0aGlzLmFuaW1hdGlvblN0YXRlLmFuaW1hdGlvblN0YXRlID49IDEpIHtcbiAgICAgICAgdGhpcy5zdG9wQW5pbWF0aW9uKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbnRpbnVlQW5pbWF0aW9uKCk7XG4gICAgICB9XG4gICAgfSwgMjApO1xuICB9XG5cbiAgcHJpdmF0ZSBzdG9wQW5pbWF0aW9uKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmFuaW1hdGlvblRpbWVvdXQpO1xuICAgIGlmICh0aGlzLmFuaW1hdGlvblN0YXRlPy5jbG9uZUVsZW1lbnQpIHtcbiAgICAgIHRoaXMuYW5pbWF0aW9uU3RhdGUuY2xvbmVFbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cbiAgICB0aGlzLmFuaW1hdGlvblN0YXRlID0gbnVsbDtcbiAgICB0aGlzLmRyYXdVcGRhdGUoKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBkcmF3VXBkYXRlKCkge1xuICAgIGlmICh0aGlzLmFuaW1hdGlvblN0YXRlKSB7XG4gICAgICB0aGlzLmFuaW1hdGlvblN0YXRlLmFuaW1hdGlvblN0YXRlID0gMSAtICh0aGlzLmFuaW1hdGlvblN0YXRlLnRhcmdldFRpbWUgLSBuZXcgRGF0ZSgpLmdldFRpbWUoKSkgLyB0aGlzLmFuaW1hdGU7XG4gICAgfVxuXG4gICAgY29uc3QgYW5pbWF0aW9uU3RhdGVTaXplID0gdGhpcy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJyA/IHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCA6IHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgY29uc3QgYW5pbWF0aW9uU3RhdGVEaXN0YW5jZSA9IGFuaW1hdGlvblN0YXRlU2l6ZSArIHRoaXMubWFyZ2luO1xuICAgIGNvbnN0IGFuaW1hdGlvblN0YXRlT2Zmc2V0Rm9yQ2xvbmUgPSB0aGlzLmFuaW1hdGlvblN0YXRlID8gdGhpcy5hbmltYXRpb25TdGF0ZS5hbmltYXRpb25TdGF0ZSAqIGFuaW1hdGlvblN0YXRlRGlzdGFuY2UgOiBhbmltYXRpb25TdGF0ZURpc3RhbmNlO1xuICAgIGNvbnN0IGFuaW1hdGlvblN0YXRlT2Zmc2V0Rm9yUGFuZWwgPSB0aGlzLmFuaW1hdGlvblN0YXRlID8gKDEgLSB0aGlzLmFuaW1hdGlvblN0YXRlLmFuaW1hdGlvblN0YXRlKSAqIGFuaW1hdGlvblN0YXRlRGlzdGFuY2UgOiAwO1xuXG4gICAgY29uc3QgZHJhdyA9IChzZWxmS2V5OiBzdHJpbmcsIG90aGVyS2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIGlmICh0aGlzLmFuaW1hdGlvblN0YXRlPy5jbG9uZUVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25TdGF0ZS5jbG9uZUVsZW1lbnQuc3R5bGVbc2VsZktleV0gPSAnJztcbiAgICAgICAgdGhpcy5hbmltYXRpb25TdGF0ZS5jbG9uZUVsZW1lbnQuc3R5bGVbb3RoZXJLZXldID0gYCR7dGhpcy5tYXJnaW4gLSBhbmltYXRpb25TdGF0ZU9mZnNldEZvckNsb25lfXB4YDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnN0aWNreSkge1xuICAgICAgICBpZiAodGhpcy5zdGlja3lWaXNpYmxlKSB7XG4gICAgICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlW290aGVyS2V5XSA9ICcnO1xuICAgICAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZVtzZWxmS2V5XSA9IGAke3RoaXMubWFyZ2luIC0gYW5pbWF0aW9uU3RhdGVPZmZzZXRGb3JQYW5lbH1weGA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlW290aGVyS2V5XSA9ICcnO1xuICAgICAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZVtzZWxmS2V5XSA9IGAke3RoaXMubWFyZ2luIC0gYW5pbWF0aW9uU3RhdGVPZmZzZXRGb3JDbG9uZX1weGA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGFuZWwubmF0aXZlRWxlbWVudC5zdHlsZVtvdGhlcktleV0gPSAnJztcbiAgICAgICAgdGhpcy5wYW5lbC5uYXRpdmVFbGVtZW50LnN0eWxlW3NlbGZLZXldID0gYCR7dGhpcy5tYXJnaW4gLSBhbmltYXRpb25TdGF0ZU9mZnNldEZvclBhbmVsfXB4YDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuYWN0dWFsUG9zaXRpb24gPT09ICd0b3AnKSB7XG4gICAgICBkcmF3KCd0b3AnLCAnYm90dG9tJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmFjdHVhbFBvc2l0aW9uID09PSAnYm90dG9tJykge1xuICAgICAgZHJhdygnYm90dG9tJywgJ3RvcCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5hY3R1YWxQb3NpdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgICBkcmF3KCdsZWZ0JywgJ3JpZ2h0Jyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmFjdHVhbFBvc2l0aW9uID09PSAncmlnaHQnKSB7XG4gICAgICBkcmF3KCdyaWdodCcsICdsZWZ0Jyk7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==