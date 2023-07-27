import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import * as i0 from "@angular/core";
const barWidth = 6;
export class SplitBarComponent {
    container;
    bar;
    positionLeft;
    positionRight;
    outsideIntervalTime = 200;
    stickVisibility = false;
    newPosition = new EventEmitter();
    outsideRight = new EventEmitter();
    outsideLeft = new EventEmitter();
    exitRight = new EventEmitter();
    exitLeft = new EventEmitter();
    moveEnd = new EventEmitter();
    constructor() {
    }
    ngOnInit() {
    }
    ngAfterViewInit() {
        this.initContainer();
        this.initBarDrag();
    }
    ngOnChanges(changes) {
        if (changes.container) {
            this.initContainer();
        }
        if (changes.positionLeft || changes.positionRight) {
            this.checkPosition();
        }
    }
    initContainer() {
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
    checkPosition() {
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
    mouseEnter() {
        this.bar.nativeElement.style.opacity = this.stickVisibility ? '1' : '1';
    }
    mouseLeave() {
        this.bar.nativeElement.style.opacity = this.stickVisibility ? '1' : '0';
    }
    initBarDrag() {
        const bar = this.bar.nativeElement;
        const container = this.container;
        let startPosition;
        let position;
        let outsideRightInterval;
        let outsideLeftInterval;
        bar.draggable = true;
        bar.ondragstart = (event) => {
            startPosition = [event.clientX, event.clientY];
            if (typeof this.positionLeft === 'number') {
                position = this.positionLeft;
            }
            if (typeof this.positionRight === 'number') {
                position = container.getBoundingClientRect().width - this.positionRight;
            }
            const crt = bar.cloneNode(false);
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
                    this.newPosition.emit({ left, right });
                }
                if (left > 0) {
                    if (!outsideRightInterval) {
                        this.exitRight.emit();
                        outsideRightInterval = setInterval(() => this.outsideRight.emit(), this.outsideIntervalTime);
                    }
                }
                else {
                    clearInterval(outsideRightInterval);
                    outsideRightInterval = null;
                }
                if (left < 0) {
                    if (!outsideLeftInterval) {
                        this.exitLeft.emit();
                        outsideLeftInterval = setInterval(() => this.outsideLeft.emit(), this.outsideIntervalTime);
                    }
                }
                else {
                    clearInterval(outsideLeftInterval);
                    outsideLeftInterval = null;
                }
            }
        };
        bar.ondragend = (event) => {
            clearInterval(outsideRightInterval);
            clearInterval(outsideLeftInterval);
            event.preventDefault();
            event.stopImmediatePropagation();
            this.checkPosition();
            this.moveEnd.emit();
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: SplitBarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.1.7", type: SplitBarComponent, selector: "split-bar", inputs: { container: "container", positionLeft: "positionLeft", positionRight: "positionRight", outsideIntervalTime: "outsideIntervalTime", stickVisibility: "stickVisibility" }, outputs: { newPosition: "newPosition", outsideRight: "outsideRight", outsideLeft: "outsideLeft", exitRight: "exitRight", exitLeft: "exitLeft", moveEnd: "moveEnd" }, viewQueries: [{ propertyName: "bar", first: true, predicate: ["bar"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <div class="split-bar" #bar
         (mouseenter)="mouseEnter()"
         (mouseleave)="mouseLeave()"
    ></div>`, isInline: true, styles: [".split-bar{width:6px;background:linear-gradient(90deg,rgb(200,200,200) 0%,rgb(255,255,255) 35%,rgb(200,200,200) 100%);cursor:col-resize}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: SplitBarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'split-bar', template: `
    <div class="split-bar" #bar
         (mouseenter)="mouseEnter()"
         (mouseleave)="mouseLeave()"
    ></div>`, styles: [".split-bar{width:6px;background:linear-gradient(90deg,rgb(200,200,200) 0%,rgb(255,255,255) 35%,rgb(200,200,200) 100%);cursor:col-resize}\n"] }]
        }], ctorParameters: function () { return []; }, propDecorators: { container: [{
                type: Input
            }], bar: [{
                type: ViewChild,
                args: ['bar']
            }], positionLeft: [{
                type: Input
            }], positionRight: [{
                type: Input
            }], outsideIntervalTime: [{
                type: Input
            }], stickVisibility: [{
                type: Input
            }], newPosition: [{
                type: Output
            }], outsideRight: [{
                type: Output
            }], outsideLeft: [{
                type: Output
            }], exitRight: [{
                type: Output
            }], exitLeft: [{
                type: Output
            }], moveEnd: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BsaXQtYmFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNwbGl0LWJhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFnQixTQUFTLEVBQWMsWUFBWSxFQUFFLEtBQUssRUFBcUIsTUFBTSxFQUFpQixTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBRTdJLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQztBQWlCbkIsTUFBTSxPQUFPLGlCQUFpQjtJQUdyQixTQUFTLENBQWM7SUFHdkIsR0FBRyxDQUEwQjtJQUc3QixZQUFZLENBQVM7SUFHckIsYUFBYSxDQUFTO0lBR3RCLG1CQUFtQixHQUFXLEdBQUcsQ0FBQztJQUdsQyxlQUFlLEdBQVksS0FBSyxDQUFDO0lBSWpDLFdBQVcsR0FBRyxJQUFJLFlBQVksRUFBbUMsQ0FBQztJQUdsRSxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQVEsQ0FBQztJQUd4QyxXQUFXLEdBQUcsSUFBSSxZQUFZLEVBQVEsQ0FBQztJQUd2QyxTQUFTLEdBQUcsSUFBSSxZQUFZLEVBQVEsQ0FBQztJQUdyQyxRQUFRLEdBQUcsSUFBSSxZQUFZLEVBQVEsQ0FBQztJQUdwQyxPQUFPLEdBQUcsSUFBSSxZQUFZLEVBQVEsQ0FBQztJQUcxQztJQUNBLENBQUM7SUFFTSxRQUFRO0lBQ2YsQ0FBQztJQUVNLGVBQWU7UUFDcEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRU0sV0FBVyxDQUFDLE9BQXNCO1FBQ3ZDLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUNyQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDdEI7UUFDRCxJQUFJLE9BQU8sQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUNqRCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDdEI7SUFDSCxDQUFD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SUFBSSxDQUFDO2lCQUM1QjthQUNGO1FBQ0gsQ0FBQyxDQUFDO1FBQ0YsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3hCLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3BDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ25DLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN2QixLQUFLLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QixDQUFDLENBQUM7SUFDSixDQUFDO3VHQXhLVSxpQkFBaUI7MkZBQWpCLGlCQUFpQix5ZkFibEI7Ozs7WUFJQTs7MkZBU0MsaUJBQWlCO2tCQWY3QixTQUFTOytCQUNFLFdBQVcsWUFDWDs7OztZQUlBOzBFQVlILFNBQVM7c0JBRGYsS0FBSztnQkFJQyxHQUFHO3NCQURULFNBQVM7dUJBQUMsS0FBSztnQkFJVCxZQUFZO3NCQURsQixLQUFLO2dCQUlDLGFBQWE7c0JBRG5CLEtBQUs7Z0JBSUMsbUJBQW1CO3NCQUR6QixLQUFLO2dCQUlDLGVBQWU7c0JBRHJCLEtBQUs7Z0JBS0MsV0FBVztzQkFEakIsTUFBTTtnQkFJQSxZQUFZO3NCQURsQixNQUFNO2dCQUlBLFdBQVc7c0JBRGpCLE1BQU07Z0JBSUEsU0FBUztzQkFEZixNQUFNO2dCQUlBLFFBQVE7c0JBRGQsTUFBTTtnQkFJQSxPQUFPO3NCQURiLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25DaGFuZ2VzLCBPbkluaXQsIE91dHB1dCwgU2ltcGxlQ2hhbmdlcywgVmlld0NoaWxkfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuY29uc3QgYmFyV2lkdGggPSA2O1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdzcGxpdC1iYXInLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxkaXYgY2xhc3M9XCJzcGxpdC1iYXJcIiAjYmFyXG4gICAgICAgICAobW91c2VlbnRlcik9XCJtb3VzZUVudGVyKClcIlxuICAgICAgICAgKG1vdXNlbGVhdmUpPVwibW91c2VMZWF2ZSgpXCJcbiAgICA+PC9kaXY+YCxcbiAgc3R5bGVzOiBbXG4gICAgYC5zcGxpdC1iYXIge1xuICAgICAgd2lkdGg6ICR7YmFyV2lkdGh9cHg7XG4gICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoOTBkZWcsIHJnYigyMDAsIDIwMCwgMjAwKSAwJSwgcmdiKDI1NSwgMjU1LCAyNTUpIDM1JSwgcmdiKDIwMCwgMjAwLCAyMDApIDEwMCUpO1xuICAgICAgY3Vyc29yOiBjb2wtcmVzaXplO1xuICAgIH1gLFxuICBdLFxufSlcbmV4cG9ydCBjbGFzcyBTcGxpdEJhckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBBZnRlclZpZXdJbml0IHtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgY29udGFpbmVyOiBIVE1MRWxlbWVudDtcblxuICBAVmlld0NoaWxkKCdiYXInKVxuICBwdWJsaWMgYmFyOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PjtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgcG9zaXRpb25MZWZ0OiBudW1iZXI7XG5cbiAgQElucHV0KClcbiAgcHVibGljIHBvc2l0aW9uUmlnaHQ6IG51bWJlcjtcblxuICBASW5wdXQoKVxuICBwdWJsaWMgb3V0c2lkZUludGVydmFsVGltZTogbnVtYmVyID0gMjAwO1xuXG4gIEBJbnB1dCgpXG4gIHB1YmxpYyBzdGlja1Zpc2liaWxpdHk6IGJvb2xlYW4gPSBmYWxzZTtcblxuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgbmV3UG9zaXRpb24gPSBuZXcgRXZlbnRFbWl0dGVyPHsgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyIH0+KCk7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBvdXRzaWRlUmlnaHQgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgQE91dHB1dCgpXG4gIHB1YmxpYyBvdXRzaWRlTGVmdCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICBAT3V0cHV0KClcbiAgcHVibGljIGV4aXRSaWdodCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICBAT3V0cHV0KClcbiAgcHVibGljIGV4aXRMZWZ0ID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gIEBPdXRwdXQoKVxuICBwdWJsaWMgbW92ZUVuZCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICB9XG5cbiAgcHVibGljIG5nT25Jbml0KCk6IHZvaWQge1xuICB9XG5cbiAgcHVibGljIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLmluaXRDb250YWluZXIoKTtcbiAgICB0aGlzLmluaXRCYXJEcmFnKCk7XG4gIH1cblxuICBwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChjaGFuZ2VzLmNvbnRhaW5lcikge1xuICAgICAgdGhpcy5pbml0Q29udGFpbmVyKCk7XG4gICAgfVxuICAgIGlmIChjaGFuZ2VzLnBvc2l0aW9uTGVmdCB8fCBjaGFuZ2VzLnBvc2l0aW9uUmlnaHQpIHtcbiAgICAgIHRoaXMuY2hlY2tQb3NpdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaW5pdENvbnRhaW5lcigpIHtcbiAgICBpZiAodGhpcy5jb250YWluZXIgJiYgdGhpcy5iYXI/Lm5hdGl2ZUVsZW1lbnQpIHtcbiAgICAgIGlmICghWydyZWxhdGl2ZScsICdhYnNvbHV0ZScsICdmaXhlZCddLmluY2x1ZGVzKHRoaXMuY29udGFpbmVyLnN0eWxlLnBvc2l0aW9uKSkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYmFyLm5hdGl2ZUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgdGhpcy5iYXIubmF0aXZlRWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ2luaXRpYWwnO1xuICAgICAgdGhpcy5iYXIubmF0aXZlRWxlbWVudC5zdHlsZS50b3AgPSAnMCc7XG4gICAgICB0aGlzLmJhci5uYXRpdmVFbGVtZW50LnN0eWxlLmJvdHRvbSA9ICcwJztcblxuICAgICAgdGhpcy5iYXIubmF0aXZlRWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gdGhpcy5zdGlja1Zpc2liaWxpdHkgPyAnMScgOiAnMCc7XG4gICAgICB0aGlzLmNoZWNrUG9zaXRpb24oKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNoZWNrUG9zaXRpb24oKSB7XG4gICAgaWYgKHRoaXMuY29udGFpbmVyICYmIHRoaXMuYmFyPy5uYXRpdmVFbGVtZW50KSB7XG4gICAgICB0aGlzLmJhci5uYXRpdmVFbGVtZW50LnN0eWxlLmxlZnQgPSAnJztcbiAgICAgIHRoaXMuYmFyLm5hdGl2ZUVsZW1lbnQuc3R5bGUucmlnaHQgPSAnJztcbiAgICAgIHRoaXMuYmFyLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wb3NpdGlvbkxlZnQgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHRoaXMuYmFyLm5hdGl2ZUVsZW1lbnQuc3R5bGUubGVmdCA9ICh0aGlzLnBvc2l0aW9uTGVmdCAtIGJhcldpZHRoIC8gMykgKyAncHgnO1xuICAgICAgICB0aGlzLmJhci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wb3NpdGlvblJpZ2h0ID09PSAnbnVtYmVyJykge1xuICAgICAgICB0aGlzLmJhci5uYXRpdmVFbGVtZW50LnN0eWxlLnJpZ2h0ID0gKHRoaXMucG9zaXRpb25SaWdodCAtIGJhcldpZHRoIC8gMykgKyAncHgnO1xuICAgICAgICB0aGlzLmJhci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgbW91c2VFbnRlcigpIHtcbiAgICB0aGlzLmJhci5uYXRpdmVFbGVtZW50LnN0eWxlLm9wYWNpdHkgPSB0aGlzLnN0aWNrVmlzaWJpbGl0eSA/ICcxJyA6ICcxJztcbiAgfVxuXG4gIHB1YmxpYyBtb3VzZUxlYXZlKCkge1xuICAgIHRoaXMuYmFyLm5hdGl2ZUVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IHRoaXMuc3RpY2tWaXNpYmlsaXR5ID8gJzEnIDogJzAnO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0QmFyRHJhZygpIHtcbiAgICBjb25zdCBiYXIgPSB0aGlzLmJhci5uYXRpdmVFbGVtZW50O1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyO1xuXG4gICAgbGV0IHN0YXJ0UG9zaXRpb246IFtudW1iZXIsIG51bWJlcl07XG4gICAgbGV0IHBvc2l0aW9uOiBudW1iZXI7XG5cbiAgICBsZXQgb3V0c2lkZVJpZ2h0SW50ZXJ2YWw6IGFueTtcbiAgICBsZXQgb3V0c2lkZUxlZnRJbnRlcnZhbDogYW55O1xuXG4gICAgYmFyLmRyYWdnYWJsZSA9IHRydWU7XG4gICAgYmFyLm9uZHJhZ3N0YXJ0ID0gKGV2ZW50KSA9PiB7XG4gICAgICBzdGFydFBvc2l0aW9uID0gW2V2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFldO1xuXG4gICAgICBpZiAodHlwZW9mIHRoaXMucG9zaXRpb25MZWZ0ID09PSAnbnVtYmVyJykge1xuICAgICAgICBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb25MZWZ0O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLnBvc2l0aW9uUmlnaHQgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHBvc2l0aW9uID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoIC0gdGhpcy5wb3NpdGlvblJpZ2h0O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjcnQgPSBiYXIuY2xvbmVOb2RlKGZhbHNlKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgIGNydC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgZXZlbnQuZGF0YVRyYW5zZmVyLnNldERyYWdJbWFnZShjcnQsIDAsIDApO1xuICAgIH07XG4gICAgYmFyLm9uZHJhZyA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBwb3NpdGlvbiAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgYWN0dWFsUG9zaXRpb24gPSBbZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WV07XG4gICAgICBpZiAoZXZlbnQuY2xpZW50WCAmJiBldmVudC5jbGllbnRZKSB7XG4gICAgICAgIGNvbnN0IGRyYWdPZmZzZXQgPSBhY3R1YWxQb3NpdGlvblswXSAtIHN0YXJ0UG9zaXRpb25bMF07XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lcldpZHRoID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xuICAgICAgICBjb25zdCByaWdodCA9IChjb250YWluZXJXaWR0aCAtIHBvc2l0aW9uKSAtIGRyYWdPZmZzZXQ7XG4gICAgICAgIGNvbnN0IGxlZnQgPSBwb3NpdGlvbiArIGRyYWdPZmZzZXQ7XG5cbiAgICAgICAgaWYgKHJpZ2h0ID49IDAgJiYgbGVmdCA+PSAwKSB7XG4gICAgICAgICAgdGhpcy5uZXdQb3NpdGlvbi5lbWl0KHtsZWZ0LCByaWdodH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxlZnQgPiAwKSB7XG4gICAgICAgICAgaWYgKCFvdXRzaWRlUmlnaHRJbnRlcnZhbCkge1xuICAgICAgICAgICAgdGhpcy5leGl0UmlnaHQuZW1pdCgpO1xuICAgICAgICAgICAgb3V0c2lkZVJpZ2h0SW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLm91dHNpZGVSaWdodC5lbWl0KCksIHRoaXMub3V0c2lkZUludGVydmFsVGltZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwob3V0c2lkZVJpZ2h0SW50ZXJ2YWwpO1xuICAgICAgICAgIG91dHNpZGVSaWdodEludGVydmFsID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVmdCA8IDApIHtcbiAgICAgICAgICBpZiAoIW91dHNpZGVMZWZ0SW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIHRoaXMuZXhpdExlZnQuZW1pdCgpO1xuICAgICAgICAgICAgb3V0c2lkZUxlZnRJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHRoaXMub3V0c2lkZUxlZnQuZW1pdCgpLCB0aGlzLm91dHNpZGVJbnRlcnZhbFRpbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjbGVhckludGVydmFsKG91dHNpZGVMZWZ0SW50ZXJ2YWwpO1xuICAgICAgICAgIG91dHNpZGVMZWZ0SW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICBiYXIub25kcmFnZW5kID0gKGV2ZW50KSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKG91dHNpZGVSaWdodEludGVydmFsKTtcbiAgICAgIGNsZWFySW50ZXJ2YWwob3V0c2lkZUxlZnRJbnRlcnZhbCk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICB0aGlzLmNoZWNrUG9zaXRpb24oKTtcbiAgICAgIHRoaXMubW92ZUVuZC5lbWl0KCk7XG4gICAgfTtcbiAgfVxufVxuIl19