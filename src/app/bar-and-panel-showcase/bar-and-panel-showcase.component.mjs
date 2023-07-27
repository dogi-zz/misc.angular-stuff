import { Component } from '@angular/core';
import * as i0 from "@angular/core";
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
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.1.7", type: BarAndPanelShowcaseComponent, selector: "bar-and-panel-showcase", ngImport: i0, template: "<h1>Split Bar</h1>\n\n<h2>Vertical</h2>\n\n<div #vertical\n     style=\"margin-top: 20px; display: block; margin-left: 50px; width: 500px; height: 100px; background: #e1e1e1; position: relative\">\n\n  <div style=\"position: absolute; display: block; top: 30px; height: 50px; background: #ced4da\"\n       [ngStyle]=\"{left: left+'px', width: width+'px'}\"></div>\n\n  <split-bar\n    [container]=\"vertical\" [positionLeft]=\"left + width\"\n    [outsideIntervalTime]=\"250\"\n    (newPosition)=\"onDragRight($event)\"\n    (outsideRight)=\"onOutsideRight()\"\n    (exitRight)=\"onExitRight()\"\n    (moveEnd)=\"onMoveEnd()\"\n  ></split-bar>\n\n  <split-bar\n    [container]=\"vertical\" [positionLeft]=\"left\"\n    [outsideIntervalTime]=\"250\"\n    (newPosition)=\"onDragLeft($event)\"\n    (outsideLeft)=\"onOutsideLeft()\"\n    (exitLeft)=\"onExitLeft()\"\n    (moveEnd)=\"onMoveEnd()\"\n  ></split-bar>\n\n  <div>\n    left: {{left}} width: {{width}} {{textOutside}}\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer1\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\">\n\n  <info-panel [container]=\"infoPanelContainer1\" [margin]=\"0\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 300px; height: 100px;  background: #ced4da\">\n      Here is the info content\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer2\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\">\n\n  <info-panel [container]=\"infoPanelContainer2\" [margin]=\"20\" [animate]=\"1000\" [anchor]=\"'bottom'\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 300px; height: 100px; background: #ced4da\">\n      This content likes to be at the bottom\n    </div>\n  </info-panel>\n\n  <info-panel [container]=\"infoPanelContainer2\" [margin]=\"0\" [animate]=\"500\" [direction]=\"'horizontal'\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 100px; height: 200px; background: #ced4da\">\n      left and right\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel with aninmation\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer3\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\"\n     (click)=\"showSticky($event)\">\n\n  <info-panel [container]=\"infoPanelContainer3\" [margin]=\"20\" [animate]=\"500\" [direction]=\"'horizontal'\" [sticky]=\"true\"\n              [stickyVisible]=\"stickyPanelVisible\">\n    <div\n      (click)=\"hideSticky($event)\" class=\"displayFlex contentCenter\"\n      style=\"width: 85px; height: 200px; padding: 10px; background: #ced4da\">\n      this is sticky, click to hide\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel that is sticky\n  </div>\n\n</div>\n\n" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseComponent, decorators: [{
            type: Component,
            args: [{ selector: 'bar-and-panel-showcase', template: "<h1>Split Bar</h1>\n\n<h2>Vertical</h2>\n\n<div #vertical\n     style=\"margin-top: 20px; display: block; margin-left: 50px; width: 500px; height: 100px; background: #e1e1e1; position: relative\">\n\n  <div style=\"position: absolute; display: block; top: 30px; height: 50px; background: #ced4da\"\n       [ngStyle]=\"{left: left+'px', width: width+'px'}\"></div>\n\n  <split-bar\n    [container]=\"vertical\" [positionLeft]=\"left + width\"\n    [outsideIntervalTime]=\"250\"\n    (newPosition)=\"onDragRight($event)\"\n    (outsideRight)=\"onOutsideRight()\"\n    (exitRight)=\"onExitRight()\"\n    (moveEnd)=\"onMoveEnd()\"\n  ></split-bar>\n\n  <split-bar\n    [container]=\"vertical\" [positionLeft]=\"left\"\n    [outsideIntervalTime]=\"250\"\n    (newPosition)=\"onDragLeft($event)\"\n    (outsideLeft)=\"onOutsideLeft()\"\n    (exitLeft)=\"onExitLeft()\"\n    (moveEnd)=\"onMoveEnd()\"\n  ></split-bar>\n\n  <div>\n    left: {{left}} width: {{width}} {{textOutside}}\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer1\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\">\n\n  <info-panel [container]=\"infoPanelContainer1\" [margin]=\"0\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 300px; height: 100px;  background: #ced4da\">\n      Here is the info content\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer2\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\">\n\n  <info-panel [container]=\"infoPanelContainer2\" [margin]=\"20\" [animate]=\"1000\" [anchor]=\"'bottom'\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 300px; height: 100px; background: #ced4da\">\n      This content likes to be at the bottom\n    </div>\n  </info-panel>\n\n  <info-panel [container]=\"infoPanelContainer2\" [margin]=\"0\" [animate]=\"500\" [direction]=\"'horizontal'\">\n    <div class=\"displayFlex contentCenter\"\n      style=\"width: 100px; height: 200px; background: #ced4da\">\n      left and right\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel with aninmation\n  </div>\n\n</div>\n\n\n<div #infoPanelContainer3\n     style=\"margin: 20px; display: block; margin-left: 50px; width: calc( 100vw - 100px ); height: 400px; background: #e1e1e1; position: relative\"\n     (click)=\"showSticky($event)\">\n\n  <info-panel [container]=\"infoPanelContainer3\" [margin]=\"20\" [animate]=\"500\" [direction]=\"'horizontal'\" [sticky]=\"true\"\n              [stickyVisible]=\"stickyPanelVisible\">\n    <div\n      (click)=\"hideSticky($event)\" class=\"displayFlex contentCenter\"\n      style=\"width: 85px; height: 200px; padding: 10px; background: #ced4da\">\n      this is sticky, click to hide\n    </div>\n  </info-panel>\n\n  <div>\n    Info Panel that is sticky\n  </div>\n\n</div>\n\n" }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyLWFuZC1wYW5lbC1zaG93Y2FzZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiYXItYW5kLXBhbmVsLXNob3djYXNlLmNvbXBvbmVudC50cyIsImJhci1hbmQtcGFuZWwtc2hvd2Nhc2UuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFNBQVMsRUFBb0IsTUFBTSxlQUFlLENBQUM7O0FBTTNELE1BQU0sT0FBTyw0QkFBNEI7SUFFaEMsS0FBSyxHQUFHLEdBQUcsQ0FBQztJQUNaLElBQUksR0FBRyxFQUFFLENBQUM7SUFDVixXQUFXLENBQVM7SUFFcEIsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0lBRWpDO0lBQ0EsQ0FBQztJQUVNLFFBQVE7SUFDZixDQUFDO0lBRU0sV0FBVyxDQUFDLFdBQTRDO1FBQzdELE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUM5QyxJQUFJLFFBQVEsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRTtZQUNqRCxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztTQUN2QjtRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFTSxVQUFVLENBQUMsV0FBNEM7UUFDNUQsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztRQUNqQyxJQUFJLE9BQU8sR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRTtZQUNoRCxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztTQUNyQjtRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFTSxjQUFjO1FBQ25CLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUU7WUFDbkIsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7U0FDbEI7SUFDSCxDQUFDO0lBRU0sYUFBYTtRQUNsQixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxFQUFFO1lBQ25CLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1NBQ2xCO0lBQ0gsQ0FBQztJQUVNLFdBQVc7UUFDaEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQztJQUN2QyxDQUFDO0lBRU0sVUFBVTtRQUNmLElBQUksQ0FBQyxXQUFXLEdBQUcsZ0JBQWdCLENBQUM7SUFDdEMsQ0FBQztJQUVNLFNBQVM7UUFDZCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRU0sVUFBVSxDQUFDLE1BQWtCO1FBQ2xDLE1BQU0sQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7SUFDbEMsQ0FBQztJQUVNLFVBQVUsQ0FBQyxNQUFrQjtRQUNsQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0lBQ2pDLENBQUM7dUdBOURVLDRCQUE0QjsyRkFBNUIsNEJBQTRCLDhEQ056QyxzN0ZBK0ZBOzsyRkR6RmEsNEJBQTRCO2tCQUp4QyxTQUFTOytCQUNFLHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBPbkNoYW5nZXMsIE9uSW5pdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2Jhci1hbmQtcGFuZWwtc2hvd2Nhc2UnLFxuICB0ZW1wbGF0ZVVybDogJy4vYmFyLWFuZC1wYW5lbC1zaG93Y2FzZS5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIEJhckFuZFBhbmVsU2hvd2Nhc2VDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuXG4gIHB1YmxpYyB3aWR0aCA9IDEyMDtcbiAgcHVibGljIGxlZnQgPSAyMDtcbiAgcHVibGljIHRleHRPdXRzaWRlOiBzdHJpbmc7XG5cbiAgcHVibGljIHN0aWNreVBhbmVsVmlzaWJsZSA9IHRydWU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gIH1cblxuICBwdWJsaWMgbmdPbkluaXQoKTogdm9pZCB7XG4gIH1cblxuICBwdWJsaWMgb25EcmFnUmlnaHQobmV3UG9zaXRpb246IHsgbGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyIH0pIHtcbiAgICBjb25zdCBuZXdXaWR0aCA9IG5ld1Bvc2l0aW9uLmxlZnQgLSB0aGlzLmxlZnQ7XG4gICAgaWYgKG5ld1dpZHRoID4gMTAgJiYgKG5ld1dpZHRoICsgdGhpcy5sZWZ0KSA8IDQ5MCkge1xuICAgICAgdGhpcy53aWR0aCA9IG5ld1dpZHRoO1xuICAgIH1cbiAgICB0aGlzLnRleHRPdXRzaWRlID0gbnVsbDtcbiAgfVxuXG4gIHB1YmxpYyBvbkRyYWdMZWZ0KG5ld1Bvc2l0aW9uOiB7IGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciB9KSB7XG4gICAgY29uc3QgbmV3TGVmdCA9IG5ld1Bvc2l0aW9uLmxlZnQ7XG4gICAgaWYgKG5ld0xlZnQgPiAxMCAmJiAobmV3TGVmdCArIHRoaXMud2lkdGgpIDwgNDkwKSB7XG4gICAgICB0aGlzLmxlZnQgPSBuZXdMZWZ0O1xuICAgIH1cbiAgICB0aGlzLnRleHRPdXRzaWRlID0gbnVsbDtcbiAgfVxuXG4gIHB1YmxpYyBvbk91dHNpZGVSaWdodCgpIHtcbiAgICBpZiAodGhpcy5sZWZ0IDwgNDgwKSB7XG4gICAgICB0aGlzLmxlZnQgKz0gMTA7XG4gICAgICB0aGlzLndpZHRoIC09IDEwO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvbk91dHNpZGVMZWZ0KCkge1xuICAgIGlmICh0aGlzLndpZHRoID4gMjApIHtcbiAgICAgIHRoaXMud2lkdGggLT0gMTA7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG9uRXhpdFJpZ2h0KCkge1xuICAgIHRoaXMudGV4dE91dHNpZGUgPSAnKG91dHNpZGUgcmlnaHQpJztcbiAgfVxuXG4gIHB1YmxpYyBvbkV4aXRMZWZ0KCkge1xuICAgIHRoaXMudGV4dE91dHNpZGUgPSAnKG91dHNpZGUgbGVmdCknO1xuICB9XG5cbiAgcHVibGljIG9uTW92ZUVuZCgpIHtcbiAgICB0aGlzLnRleHRPdXRzaWRlID0gbnVsbDtcbiAgfVxuXG4gIHB1YmxpYyBoaWRlU3RpY2t5KCRldmVudDogTW91c2VFdmVudCkge1xuICAgICRldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICB0aGlzLnN0aWNreVBhbmVsVmlzaWJsZSA9IGZhbHNlO1xuICB9XG5cbiAgcHVibGljIHNob3dTdGlja3koJGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgdGhpcy5zdGlja3lQYW5lbFZpc2libGUgPSB0cnVlO1xuICB9XG5cbn1cbiIsIjxoMT5TcGxpdCBCYXI8L2gxPlxuXG48aDI+VmVydGljYWw8L2gyPlxuXG48ZGl2ICN2ZXJ0aWNhbFxuICAgICBzdHlsZT1cIm1hcmdpbi10b3A6IDIwcHg7IGRpc3BsYXk6IGJsb2NrOyBtYXJnaW4tbGVmdDogNTBweDsgd2lkdGg6IDUwMHB4OyBoZWlnaHQ6IDEwMHB4OyBiYWNrZ3JvdW5kOiAjZTFlMWUxOyBwb3NpdGlvbjogcmVsYXRpdmVcIj5cblxuICA8ZGl2IHN0eWxlPVwicG9zaXRpb246IGFic29sdXRlOyBkaXNwbGF5OiBibG9jazsgdG9wOiAzMHB4OyBoZWlnaHQ6IDUwcHg7IGJhY2tncm91bmQ6ICNjZWQ0ZGFcIlxuICAgICAgIFtuZ1N0eWxlXT1cIntsZWZ0OiBsZWZ0KydweCcsIHdpZHRoOiB3aWR0aCsncHgnfVwiPjwvZGl2PlxuXG4gIDxzcGxpdC1iYXJcbiAgICBbY29udGFpbmVyXT1cInZlcnRpY2FsXCIgW3Bvc2l0aW9uTGVmdF09XCJsZWZ0ICsgd2lkdGhcIlxuICAgIFtvdXRzaWRlSW50ZXJ2YWxUaW1lXT1cIjI1MFwiXG4gICAgKG5ld1Bvc2l0aW9uKT1cIm9uRHJhZ1JpZ2h0KCRldmVudClcIlxuICAgIChvdXRzaWRlUmlnaHQpPVwib25PdXRzaWRlUmlnaHQoKVwiXG4gICAgKGV4aXRSaWdodCk9XCJvbkV4aXRSaWdodCgpXCJcbiAgICAobW92ZUVuZCk9XCJvbk1vdmVFbmQoKVwiXG4gID48L3NwbGl0LWJhcj5cblxuICA8c3BsaXQtYmFyXG4gICAgW2NvbnRhaW5lcl09XCJ2ZXJ0aWNhbFwiIFtwb3NpdGlvbkxlZnRdPVwibGVmdFwiXG4gICAgW291dHNpZGVJbnRlcnZhbFRpbWVdPVwiMjUwXCJcbiAgICAobmV3UG9zaXRpb24pPVwib25EcmFnTGVmdCgkZXZlbnQpXCJcbiAgICAob3V0c2lkZUxlZnQpPVwib25PdXRzaWRlTGVmdCgpXCJcbiAgICAoZXhpdExlZnQpPVwib25FeGl0TGVmdCgpXCJcbiAgICAobW92ZUVuZCk9XCJvbk1vdmVFbmQoKVwiXG4gID48L3NwbGl0LWJhcj5cblxuICA8ZGl2PlxuICAgIGxlZnQ6IHt7bGVmdH19IHdpZHRoOiB7e3dpZHRofX0ge3t0ZXh0T3V0c2lkZX19XG4gIDwvZGl2PlxuXG48L2Rpdj5cblxuXG48ZGl2ICNpbmZvUGFuZWxDb250YWluZXIxXG4gICAgIHN0eWxlPVwibWFyZ2luOiAyMHB4OyBkaXNwbGF5OiBibG9jazsgbWFyZ2luLWxlZnQ6IDUwcHg7IHdpZHRoOiBjYWxjKCAxMDB2dyAtIDEwMHB4ICk7IGhlaWdodDogNDAwcHg7IGJhY2tncm91bmQ6ICNlMWUxZTE7IHBvc2l0aW9uOiByZWxhdGl2ZVwiPlxuXG4gIDxpbmZvLXBhbmVsIFtjb250YWluZXJdPVwiaW5mb1BhbmVsQ29udGFpbmVyMVwiIFttYXJnaW5dPVwiMFwiPlxuICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5RmxleCBjb250ZW50Q2VudGVyXCJcbiAgICAgIHN0eWxlPVwid2lkdGg6IDMwMHB4OyBoZWlnaHQ6IDEwMHB4OyAgYmFja2dyb3VuZDogI2NlZDRkYVwiPlxuICAgICAgSGVyZSBpcyB0aGUgaW5mbyBjb250ZW50XG4gICAgPC9kaXY+XG4gIDwvaW5mby1wYW5lbD5cblxuICA8ZGl2PlxuICAgIEluZm8gUGFuZWxcbiAgPC9kaXY+XG5cbjwvZGl2PlxuXG5cbjxkaXYgI2luZm9QYW5lbENvbnRhaW5lcjJcbiAgICAgc3R5bGU9XCJtYXJnaW46IDIwcHg7IGRpc3BsYXk6IGJsb2NrOyBtYXJnaW4tbGVmdDogNTBweDsgd2lkdGg6IGNhbGMoIDEwMHZ3IC0gMTAwcHggKTsgaGVpZ2h0OiA0MDBweDsgYmFja2dyb3VuZDogI2UxZTFlMTsgcG9zaXRpb246IHJlbGF0aXZlXCI+XG5cbiAgPGluZm8tcGFuZWwgW2NvbnRhaW5lcl09XCJpbmZvUGFuZWxDb250YWluZXIyXCIgW21hcmdpbl09XCIyMFwiIFthbmltYXRlXT1cIjEwMDBcIiBbYW5jaG9yXT1cIidib3R0b20nXCI+XG4gICAgPGRpdiBjbGFzcz1cImRpc3BsYXlGbGV4IGNvbnRlbnRDZW50ZXJcIlxuICAgICAgc3R5bGU9XCJ3aWR0aDogMzAwcHg7IGhlaWdodDogMTAwcHg7IGJhY2tncm91bmQ6ICNjZWQ0ZGFcIj5cbiAgICAgIFRoaXMgY29udGVudCBsaWtlcyB0byBiZSBhdCB0aGUgYm90dG9tXG4gICAgPC9kaXY+XG4gIDwvaW5mby1wYW5lbD5cblxuICA8aW5mby1wYW5lbCBbY29udGFpbmVyXT1cImluZm9QYW5lbENvbnRhaW5lcjJcIiBbbWFyZ2luXT1cIjBcIiBbYW5pbWF0ZV09XCI1MDBcIiBbZGlyZWN0aW9uXT1cIidob3Jpem9udGFsJ1wiPlxuICAgIDxkaXYgY2xhc3M9XCJkaXNwbGF5RmxleCBjb250ZW50Q2VudGVyXCJcbiAgICAgIHN0eWxlPVwid2lkdGg6IDEwMHB4OyBoZWlnaHQ6IDIwMHB4OyBiYWNrZ3JvdW5kOiAjY2VkNGRhXCI+XG4gICAgICBsZWZ0IGFuZCByaWdodFxuICAgIDwvZGl2PlxuICA8L2luZm8tcGFuZWw+XG5cbiAgPGRpdj5cbiAgICBJbmZvIFBhbmVsIHdpdGggYW5pbm1hdGlvblxuICA8L2Rpdj5cblxuPC9kaXY+XG5cblxuPGRpdiAjaW5mb1BhbmVsQ29udGFpbmVyM1xuICAgICBzdHlsZT1cIm1hcmdpbjogMjBweDsgZGlzcGxheTogYmxvY2s7IG1hcmdpbi1sZWZ0OiA1MHB4OyB3aWR0aDogY2FsYyggMTAwdncgLSAxMDBweCApOyBoZWlnaHQ6IDQwMHB4OyBiYWNrZ3JvdW5kOiAjZTFlMWUxOyBwb3NpdGlvbjogcmVsYXRpdmVcIlxuICAgICAoY2xpY2spPVwic2hvd1N0aWNreSgkZXZlbnQpXCI+XG5cbiAgPGluZm8tcGFuZWwgW2NvbnRhaW5lcl09XCJpbmZvUGFuZWxDb250YWluZXIzXCIgW21hcmdpbl09XCIyMFwiIFthbmltYXRlXT1cIjUwMFwiIFtkaXJlY3Rpb25dPVwiJ2hvcml6b250YWwnXCIgW3N0aWNreV09XCJ0cnVlXCJcbiAgICAgICAgICAgICAgW3N0aWNreVZpc2libGVdPVwic3RpY2t5UGFuZWxWaXNpYmxlXCI+XG4gICAgPGRpdlxuICAgICAgKGNsaWNrKT1cImhpZGVTdGlja3koJGV2ZW50KVwiIGNsYXNzPVwiZGlzcGxheUZsZXggY29udGVudENlbnRlclwiXG4gICAgICBzdHlsZT1cIndpZHRoOiA4NXB4OyBoZWlnaHQ6IDIwMHB4OyBwYWRkaW5nOiAxMHB4OyBiYWNrZ3JvdW5kOiAjY2VkNGRhXCI+XG4gICAgICB0aGlzIGlzIHN0aWNreSwgY2xpY2sgdG8gaGlkZVxuICAgIDwvZGl2PlxuICA8L2luZm8tcGFuZWw+XG5cbiAgPGRpdj5cbiAgICBJbmZvIFBhbmVsIHRoYXQgaXMgc3RpY2t5XG4gIDwvZGl2PlxuXG48L2Rpdj5cblxuIl19