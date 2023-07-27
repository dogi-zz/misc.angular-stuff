import { Component } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "../split-bar/split-bar.component";
import * as i3 from "../info-panel/info-panel.component";
export class BarAndPanelShowcaseComponent {
    width = 120;
    left = 20;
    textOutside;
    stickyPanelVisible = true;
    constructor() {
    }
    ngOnInit() {
    }
    onDragRight(newPosition) {
        const newWidth = newPosition.left - this.left;
        if (newWidth > 10 && (newWidth + this.left) < 490) {
            this.width = newWidth;
        }
        this.textOutside = null;
    }
    onDragLeft(newPosition) {
        const newLeft = newPosition.left;
        if (newLeft > 10 && (newLeft + this.width) < 490) {
            this.left = newLeft;
        }
        this.textOutside = null;
    }
    onOutsideRight() {
        if (this.left < 480) {
            this.left += 10;
            this.width -= 10;
        }
    }
    onOutsideLeft() {
        if (this.width > 20) {
            this.width -= 10;
        }
    }
    onExitRight() {
        this.textOutside = '(outside right)';
    }
    onExitLeft() {
        this.textOutside = '(outside left)';
    }
    onMoveEnd() {
        this.textOutside = null;
    }
    hideSticky($event) {
        $event.stopImmediatePropagation();
        this.stickyPanelVisible = false;
    }
    showSticky($event) {
        this.stickyPanelVisible = true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.1.7", type: BarAndPanelShowcaseComponent, selector: "bar-and-panel-showcase", ngImport: i0, template: "<h1>Split Bar</h1>\n\n<h2>Vertical</h2>\n\n<div #vertical\n     style=\"margin-top: 20px; display: block; margin-left: 50px; width: 500px; height: 100px; background: #e1e1e1; position: relative\">\n\n  <div style=\"position: absolute; display: block; top: 30px; height: 50px; background: #ced4da\"\n       [ngStyle]=\"{left: left+'px', width: width+'px'}\"></div>\n\n  <split-bar\n    [container]=\"vertical\" [positionLeft]=\"left + width\"\n    [outsideIntervalTime]=\"250\"\n    (newPosition)=\"onDragRight($event)\"\n    (outsideRight)=\"onOutsideRight()\"\n    (exitRight)=\"onExitRight()\"\n    (moveEnd)=\"onMoveEnd()\"\n  ></split-bar>\n\n  <split-bar\n    [container]=\"vertical\" [positionLeft]=\"left\"\n    [outsideIntervalTime]=\"250\"\n    (newPosition)=\"onDragLeft($event)\"\n    (outsideLeft)=\"onOutsideLeft()\"\n    (exitLeft)=\"onExitLeft()\"\n    (moveEnd)=\"onMoveEnd()\"\n  ></split-bar>\n\n  <div>\n    left: {{left}} width: {{width}} {{textOutside}}\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer1\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\">\n\n  <info-panel [container]=\"infoPanelContainer1\" [margin]=\"0\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 300px; height: 100px;  background: #ced4da\">\n      Here is the info content\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer2\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\">\n\n  <info-panel [container]=\"infoPanelContainer2\" [margin]=\"20\" [animate]=\"1000\" [anchor]=\"'bottom'\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 300px; height: 100px; background: #ced4da\">\n      This content likes to be at the bottom\n    </div>\n  </info-panel>\n\n  <info-panel [container]=\"infoPanelContainer2\" [margin]=\"0\" [animate]=\"500\" [direction]=\"'horizontal'\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 100px; height: 200px; background: #ced4da\">\n      left and right\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel with aninmation\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer3\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\"\n     (click)=\"showSticky($event)\">\n\n  <info-panel [container]=\"infoPanelContainer3\" [margin]=\"20\" [animate]=\"500\" [direction]=\"'horizontal'\" [sticky]=\"true\"\n              [stickyVisible]=\"stickyPanelVisible\">\n    <div\n      (click)=\"hideSticky($event)\" class=\"displayFlex contentCenter\"\n      style=\"width: 85px; height: 200px; padding: 10px; background: #ced4da\">\n      this is sticky, click to hide\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel that is sticky\n  </div>\n\n</div>\n\n", dependencies: [{ kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "component", type: i2.SplitBarComponent, selector: "split-bar", inputs: ["container", "positionLeft", "positionRight", "outsideIntervalTime", "stickVisibility"], outputs: ["newPosition", "outsideRight", "outsideLeft", "exitRight", "exitLeft", "moveEnd"] }, { kind: "component", type: i3.InfoPanelComponent, selector: "info-panel", inputs: ["container", "margin", "animate", "anchor", "direction", "sticky", "stickyVisible", "style", "fullSize", "fullMargin"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseComponent, decorators: [{
            type: Component,
            args: [{ selector: 'bar-and-panel-showcase', template: "<h1>Split Bar</h1>\n\n<h2>Vertical</h2>\n\n<div #vertical\n     style=\"margin-top: 20px; display: block; margin-left: 50px; width: 500px; height: 100px; background: #e1e1e1; position: relative\">\n\n  <div style=\"position: absolute; display: block; top: 30px; height: 50px; background: #ced4da\"\n       [ngStyle]=\"{left: left+'px', width: width+'px'}\"></div>\n\n  <split-bar\n    [container]=\"vertical\" [positionLeft]=\"left + width\"\n    [outsideIntervalTime]=\"250\"\n    (newPosition)=\"onDragRight($event)\"\n    (outsideRight)=\"onOutsideRight()\"\n    (exitRight)=\"onExitRight()\"\n    (moveEnd)=\"onMoveEnd()\"\n  ></split-bar>\n\n  <split-bar\n    [container]=\"vertical\" [positionLeft]=\"left\"\n    [outsideIntervalTime]=\"250\"\n    (newPosition)=\"onDragLeft($event)\"\n    (outsideLeft)=\"onOutsideLeft()\"\n    (exitLeft)=\"onExitLeft()\"\n    (moveEnd)=\"onMoveEnd()\"\n  ></split-bar>\n\n  <div>\n    left: {{left}} width: {{width}} {{textOutside}}\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer1\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\">\n\n  <info-panel [container]=\"infoPanelContainer1\" [margin]=\"0\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 300px; height: 100px;  background: #ced4da\">\n      Here is the info content\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer2\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\">\n\n  <info-panel [container]=\"infoPanelContainer2\" [margin]=\"20\" [animate]=\"1000\" [anchor]=\"'bottom'\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 300px; height: 100px; background: #ced4da\">\n      This content likes to be at the bottom\n    </div>\n  </info-panel>\n\n  <info-panel [container]=\"infoPanelContainer2\" [margin]=\"0\" [animate]=\"500\" [direction]=\"'horizontal'\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 100px; height: 200px; background: #ced4da\">\n      left and right\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel with aninmation\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer3\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\"\n     (click)=\"showSticky($event)\">\n\n  <info-panel [container]=\"infoPanelContainer3\" [margin]=\"20\" [animate]=\"500\" [direction]=\"'horizontal'\" [sticky]=\"true\"\n              [stickyVisible]=\"stickyPanelVisible\">\n    <div\n      (click)=\"hideSticky($event)\" class=\"displayFlex contentCenter\"\n      style=\"width: 85px; height: 200px; padding: 10px; background: #ced4da\">\n      this is sticky, click to hide\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel that is sticky\n  </div>\n\n</div>\n\n" }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyLWFuZC1wYW5lbC1zaG93Y2FzZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvYXBwL2Jhci1hbmQtcGFuZWwtc2hvd2Nhc2UvYmFyLWFuZC1wYW5lbC1zaG93Y2FzZS5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi9zcmMvYXBwL2Jhci1hbmQtcGFuZWwtc2hvd2Nhc2UvYmFyLWFuZC1wYW5lbC1zaG93Y2FzZS5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsU0FBUyxFQUFvQixNQUFNLGVBQWUsQ0FBQzs7Ozs7QUFNM0QsTUFBTSxPQUFPLDRCQUE0QjtJQUVoQyxLQUFLLEdBQUcsR0FBRyxDQUFDO0lBQ1osSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNWLFdBQVcsQ0FBUztJQUVwQixrQkFBa0IsR0FBRyxJQUFJLENBQUM7SUFFakM7SUFDQSxDQUFDO0lBRU0sUUFBUTtJQUNmLENBQUM7SUFFTSxXQUFXLENBQUMsV0FBNEM7UUFDN0QsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzlDLElBQUksUUFBUSxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFO1lBQ2pELElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVNLFVBQVUsQ0FBQyxXQUE0QztRQUM1RCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBQ2pDLElBQUksT0FBTyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFO1lBQ2hELElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVNLGNBQWM7UUFDbkIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRTtZQUNuQixJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztTQUNsQjtJQUNILENBQUM7SUFFTSxhQUFhO1FBQ2xCLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEVBQUU7WUFDbkIsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7U0FDbEI7SUFDSCxDQUFDO0lBRU0sV0FBVztRQUNoQixJQUFJLENBQUMsV0FBVyxHQUFHLGlCQUFpQixDQUFDO0lBQ3ZDLENBQUM7SUFFTSxVQUFVO1FBQ2YsSUFBSSxDQUFDLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQztJQUN0QyxDQUFDO0lBRU0sU0FBUztRQUNkLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFTSxVQUFVLENBQUMsTUFBa0I7UUFDbEMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztJQUNsQyxDQUFDO0lBRU0sVUFBVSxDQUFDLE1BQWtCO1FBQ2xDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7SUFDakMsQ0FBQzt1R0E5RFUsNEJBQTRCOzJGQUE1Qiw0QkFBNEIsOERDTnpDLHM3RkErRkE7OzJGRHpGYSw0QkFBNEI7a0JBSnhDLFNBQVM7K0JBQ0Usd0JBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIE9uQ2hhbmdlcywgT25Jbml0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnYmFyLWFuZC1wYW5lbC1zaG93Y2FzZScsXG4gIHRlbXBsYXRlVXJsOiAnLi9iYXItYW5kLXBhbmVsLXNob3djYXNlLmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgQmFyQW5kUGFuZWxTaG93Y2FzZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG5cbiAgcHVibGljIHdpZHRoID0gMTIwO1xuICBwdWJsaWMgbGVmdCA9IDIwO1xuICBwdWJsaWMgdGV4dE91dHNpZGU6IHN0cmluZztcblxuICBwdWJsaWMgc3RpY2t5UGFuZWxWaXNpYmxlID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgfVxuXG4gIHB1YmxpYyBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgfVxuXG4gIHB1YmxpYyBvbkRyYWdSaWdodChuZXdQb3NpdGlvbjogeyBsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXIgfSkge1xuICAgIGNvbnN0IG5ld1dpZHRoID0gbmV3UG9zaXRpb24ubGVmdCAtIHRoaXMubGVmdDtcbiAgICBpZiAobmV3V2lkdGggPiAxMCAmJiAobmV3V2lkdGggKyB0aGlzLmxlZnQpIDwgNDkwKSB7XG4gICAgICB0aGlzLndpZHRoID0gbmV3V2lkdGg7XG4gICAgfVxuICAgIHRoaXMudGV4dE91dHNpZGUgPSBudWxsO1xuICB9XG5cbiAgcHVibGljIG9uRHJhZ0xlZnQobmV3UG9zaXRpb246IHsgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyIH0pIHtcbiAgICBjb25zdCBuZXdMZWZ0ID0gbmV3UG9zaXRpb24ubGVmdDtcbiAgICBpZiAobmV3TGVmdCA+IDEwICYmIChuZXdMZWZ0ICsgdGhpcy53aWR0aCkgPCA0OTApIHtcbiAgICAgIHRoaXMubGVmdCA9IG5ld0xlZnQ7XG4gICAgfVxuICAgIHRoaXMudGV4dE91dHNpZGUgPSBudWxsO1xuICB9XG5cbiAgcHVibGljIG9uT3V0c2lkZVJpZ2h0KCkge1xuICAgIGlmICh0aGlzLmxlZnQgPCA0ODApIHtcbiAgICAgIHRoaXMubGVmdCArPSAxMDtcbiAgICAgIHRoaXMud2lkdGggLT0gMTA7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG9uT3V0c2lkZUxlZnQoKSB7XG4gICAgaWYgKHRoaXMud2lkdGggPiAyMCkge1xuICAgICAgdGhpcy53aWR0aCAtPSAxMDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb25FeGl0UmlnaHQoKSB7XG4gICAgdGhpcy50ZXh0T3V0c2lkZSA9ICcob3V0c2lkZSByaWdodCknO1xuICB9XG5cbiAgcHVibGljIG9uRXhpdExlZnQoKSB7XG4gICAgdGhpcy50ZXh0T3V0c2lkZSA9ICcob3V0c2lkZSBsZWZ0KSc7XG4gIH1cblxuICBwdWJsaWMgb25Nb3ZlRW5kKCkge1xuICAgIHRoaXMudGV4dE91dHNpZGUgPSBudWxsO1xuICB9XG5cbiAgcHVibGljIGhpZGVTdGlja3koJGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgJGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgIHRoaXMuc3RpY2t5UGFuZWxWaXNpYmxlID0gZmFsc2U7XG4gIH1cblxuICBwdWJsaWMgc2hvd1N0aWNreSgkZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICB0aGlzLnN0aWNreVBhbmVsVmlzaWJsZSA9IHRydWU7XG4gIH1cblxufVxuIiwiPGgxPlNwbGl0IEJhcjwvaDE+XG5cbjxoMj5WZXJ0aWNhbDwvaDI+XG5cbjxkaXYgI3ZlcnRpY2FsXG4gICAgIHN0eWxlPVwibWFyZ2luLXRvcDogMjBweDsgZGlzcGxheTogYmxvY2s7IG1hcmdpbi1sZWZ0OiA1MHB4OyB3aWR0aDogNTAwcHg7IGhlaWdodDogMTAwcHg7IGJhY2tncm91bmQ6ICNlMWUxZTE7IHBvc2l0aW9uOiByZWxhdGl2ZVwiPlxuXG4gIDxkaXYgc3R5bGU9XCJwb3NpdGlvbjogYWJzb2x1dGU7IGRpc3BsYXk6IGJsb2NrOyB0b3A6IDMwcHg7IGhlaWdodDogNTBweDsgYmFja2dyb3VuZDogI2NlZDRkYVwiXG4gICAgICAgW25nU3R5bGVdPVwie2xlZnQ6IGxlZnQrJ3B4Jywgd2lkdGg6IHdpZHRoKydweCd9XCI+PC9kaXY+XG5cbiAgPHNwbGl0LWJhclxuICAgIFtjb250YWluZXJdPVwidmVydGljYWxcIiBbcG9zaXRpb25MZWZ0XT1cImxlZnQgKyB3aWR0aFwiXG4gICAgW291dHNpZGVJbnRlcnZhbFRpbWVdPVwiMjUwXCJcbiAgICAobmV3UG9zaXRpb24pPVwib25EcmFnUmlnaHQoJGV2ZW50KVwiXG4gICAgKG91dHNpZGVSaWdodCk9XCJvbk91dHNpZGVSaWdodCgpXCJcbiAgICAoZXhpdFJpZ2h0KT1cIm9uRXhpdFJpZ2h0KClcIlxuICAgIChtb3ZlRW5kKT1cIm9uTW92ZUVuZCgpXCJcbiAgPjwvc3BsaXQtYmFyPlxuXG4gIDxzcGxpdC1iYXJcbiAgICBbY29udGFpbmVyXT1cInZlcnRpY2FsXCIgW3Bvc2l0aW9uTGVmdF09XCJsZWZ0XCJcbiAgICBbb3V0c2lkZUludGVydmFsVGltZV09XCIyNTBcIlxuICAgIChuZXdQb3NpdGlvbik9XCJvbkRyYWdMZWZ0KCRldmVudClcIlxuICAgIChvdXRzaWRlTGVmdCk9XCJvbk91dHNpZGVMZWZ0KClcIlxuICAgIChleGl0TGVmdCk9XCJvbkV4aXRMZWZ0KClcIlxuICAgIChtb3ZlRW5kKT1cIm9uTW92ZUVuZCgpXCJcbiAgPjwvc3BsaXQtYmFyPlxuXG4gIDxkaXY+XG4gICAgbGVmdDoge3tsZWZ0fX0gd2lkdGg6IHt7d2lkdGh9fSB7e3RleHRPdXRzaWRlfX1cbiAgPC9kaXY+XG5cbjwvZGl2PlxuXG5cbjxkaXYgI2luZm9QYW5lbENvbnRhaW5lcjFcbiAgICAgc3R5bGU9XCJtYXJnaW46IDIwcHg7IGRpc3BsYXk6IGJsb2NrOyBtYXJnaW4tbGVmdDogNTBweDsgd2lkdGg6IGNhbGMoIDEwMHZ3IC0gMTAwcHggKTsgaGVpZ2h0OiA0MDBweDsgYmFja2dyb3VuZDogI2UxZTFlMTsgcG9zaXRpb246IHJlbGF0aXZlXCI+XG5cbiAgPGluZm8tcGFuZWwgW2NvbnRhaW5lcl09XCJpbmZvUGFuZWxDb250YWluZXIxXCIgW21hcmdpbl09XCIwXCI+XG4gICAgPGRpdiBjbGFzcz1cImRpc3BsYXlGbGV4IGNvbnRlbnRDZW50ZXJcIlxuICAgICAgc3R5bGU9XCJ3aWR0aDogMzAwcHg7IGhlaWdodDogMTAwcHg7ICBiYWNrZ3JvdW5kOiAjY2VkNGRhXCI+XG4gICAgICBIZXJlIGlzIHRoZSBpbmZvIGNvbnRlbnRcbiAgICA8L2Rpdj5cbiAgPC9pbmZvLXBhbmVsPlxuXG4gIDxkaXY+XG4gICAgSW5mbyBQYW5lbFxuICA8L2Rpdj5cblxuPC9kaXY+XG5cblxuPGRpdiAjaW5mb1BhbmVsQ29udGFpbmVyMlxuICAgICBzdHlsZT1cIm1hcmdpbjogMjBweDsgZGlzcGxheTogYmxvY2s7IG1hcmdpbi1sZWZ0OiA1MHB4OyB3aWR0aDogY2FsYyggMTAwdncgLSAxMDBweCApOyBoZWlnaHQ6IDQwMHB4OyBiYWNrZ3JvdW5kOiAjZTFlMWUxOyBwb3NpdGlvbjogcmVsYXRpdmVcIj5cblxuICA8aW5mby1wYW5lbCBbY29udGFpbmVyXT1cImluZm9QYW5lbENvbnRhaW5lcjJcIiBbbWFyZ2luXT1cIjIwXCIgW2FuaW1hdGVdPVwiMTAwMFwiIFthbmNob3JdPVwiJ2JvdHRvbSdcIj5cbiAgICA8ZGl2IGNsYXNzPVwiZGlzcGxheUZsZXggY29udGVudENlbnRlclwiXG4gICAgICBzdHlsZT1cIndpZHRoOiAzMDBweDsgaGVpZ2h0OiAxMDBweDsgYmFja2dyb3VuZDogI2NlZDRkYVwiPlxuICAgICAgVGhpcyBjb250ZW50IGxpa2VzIHRvIGJlIGF0IHRoZSBib3R0b21cbiAgICA8L2Rpdj5cbiAgPC9pbmZvLXBhbmVsPlxuXG4gIDxpbmZvLXBhbmVsIFtjb250YWluZXJdPVwiaW5mb1BhbmVsQ29udGFpbmVyMlwiIFttYXJnaW5dPVwiMFwiIFthbmltYXRlXT1cIjUwMFwiIFtkaXJlY3Rpb25dPVwiJ2hvcml6b250YWwnXCI+XG4gICAgPGRpdiBjbGFzcz1cImRpc3BsYXlGbGV4IGNvbnRlbnRDZW50ZXJcIlxuICAgICAgc3R5bGU9XCJ3aWR0aDogMTAwcHg7IGhlaWdodDogMjAwcHg7IGJhY2tncm91bmQ6ICNjZWQ0ZGFcIj5cbiAgICAgIGxlZnQgYW5kIHJpZ2h0XG4gICAgPC9kaXY+XG4gIDwvaW5mby1wYW5lbD5cblxuICA8ZGl2PlxuICAgIEluZm8gUGFuZWwgd2l0aCBhbmlubWF0aW9uXG4gIDwvZGl2PlxuXG48L2Rpdj5cblxuXG48ZGl2ICNpbmZvUGFuZWxDb250YWluZXIzXG4gICAgIHN0eWxlPVwibWFyZ2luOiAyMHB4OyBkaXNwbGF5OiBibG9jazsgbWFyZ2luLWxlZnQ6IDUwcHg7IHdpZHRoOiBjYWxjKCAxMDB2dyAtIDEwMHB4ICk7IGhlaWdodDogNDAwcHg7IGJhY2tncm91bmQ6ICNlMWUxZTE7IHBvc2l0aW9uOiByZWxhdGl2ZVwiXG4gICAgIChjbGljayk9XCJzaG93U3RpY2t5KCRldmVudClcIj5cblxuICA8aW5mby1wYW5lbCBbY29udGFpbmVyXT1cImluZm9QYW5lbENvbnRhaW5lcjNcIiBbbWFyZ2luXT1cIjIwXCIgW2FuaW1hdGVdPVwiNTAwXCIgW2RpcmVjdGlvbl09XCInaG9yaXpvbnRhbCdcIiBbc3RpY2t5XT1cInRydWVcIlxuICAgICAgICAgICAgICBbc3RpY2t5VmlzaWJsZV09XCJzdGlja3lQYW5lbFZpc2libGVcIj5cbiAgICA8ZGl2XG4gICAgICAoY2xpY2spPVwiaGlkZVN0aWNreSgkZXZlbnQpXCIgY2xhc3M9XCJkaXNwbGF5RmxleCBjb250ZW50Q2VudGVyXCJcbiAgICAgIHN0eWxlPVwid2lkdGg6IDg1cHg7IGhlaWdodDogMjAwcHg7IHBhZGRpbmc6IDEwcHg7IGJhY2tncm91bmQ6ICNjZWQ0ZGFcIj5cbiAgICAgIHRoaXMgaXMgc3RpY2t5LCBjbGljayB0byBoaWRlXG4gICAgPC9kaXY+XG4gIDwvaW5mby1wYW5lbD5cblxuICA8ZGl2PlxuICAgIEluZm8gUGFuZWwgdGhhdCBpcyBzdGlja3lcbiAgPC9kaXY+XG5cbjwvZGl2PlxuXG4iXX0=