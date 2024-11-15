import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'bar-and-panel-showcase',
  template: `
    <h1>Split Bar</h1>

    <div #vertical
         class="bar-and-panel-panel"
         style="width: 500px; height: 100px; position: relative">

      <div style="position: absolute; display: block; top: 30px; height: 50px; background: #ced4da"
           [ngStyle]="{left: left+'px', width: width+'px'}"></div>

      <split-bar
        [container]="vertical" [positionLeft]="left + width"
        [outsideIntervalTime]="250"
        (newPosition)="onDragRight($event)"
        (outsideRight)="onOutsideRight()"
        (exitRight)="onExitRight()"
        (moveEnd)="onMoveEnd()"
      ></split-bar>

      <split-bar
        [container]="vertical" [positionLeft]="left"
        [outsideIntervalTime]="250"
        (newPosition)="onDragLeft($event)"
        (outsideLeft)="onOutsideLeft()"
        (exitLeft)="onExitLeft()"
        (moveEnd)="onMoveEnd()"
      ></split-bar>

      <div>
        left: {{ left }} width: {{ width }} {{ textOutside }}
      </div>

    </div>


    <div #infoPanelContainer1
         class="bar-and-panel-panel"
         style="width: 100%; height: 400px; position: relative">

      <info-panel [container]="infoPanelContainer1" [margin]="0">
        <div class="displayFlex contentCenter"
             style="width: 300px; height: 100px;  background: #ced4da">
          Here is the info content
        </div>
      </info-panel>

      <div>
        Info Panel
      </div>

    </div>


    <div #infoPanelContainer2
         class="bar-and-panel-panel"
         style="width: 100%; height: 400px;position: relative">

      <info-panel [container]="infoPanelContainer2" [margin]="20" [animate]="1000" [anchor]="'bottom'">
        <div class="displayFlex contentCenter"
             style="width: 300px; height: 100px; background: #ced4da">
          This content likes to be at the bottom
        </div>
      </info-panel>

      <info-panel [container]="infoPanelContainer2" [margin]="0" [animate]="500" [direction]="'horizontal'">
        <div class="displayFlex contentCenter"
             style="width: 100px; height: 200px; background: #ced4da">
          left and right
        </div>
      </info-panel>

      <div>
        Info Panel with aninmation
      </div>

    </div>


    <div #infoPanelContainer3
         class="bar-and-panel-panel"
         style="width: 100%;  height: 400px;position: relative"
         (click)="showSticky($event)">

      <info-panel [container]="infoPanelContainer3" [margin]="20" [animate]="500" [direction]="'horizontal'" [sticky]="true"
                  [stickyVisible]="stickyPanelVisible">
        <div
          (click)="hideSticky($event)" class="displayFlex contentCenter"
          style="width: 85px; height: 200px; padding: 10px; background: #ced4da">
          this is sticky, click to hide
        </div>
      </info-panel>

      <div>
        Info Panel that is sticky
      </div>

    </div>

  `,
  styleUrls: [
    './bar-and-panel-showcase.component.less',
  ],
})
export class BarAndPanelShowcaseComponent implements OnInit {

  public width = 120;
  public left = 20;
  public textOutside: string;

  public stickyPanelVisible = true;

  public constructor() {
  }

  public ngOnInit(): void {
  }

  public onDragRight(newPosition: { left: number, right: number }) {
    const newWidth = newPosition.left - this.left;
    if (newWidth > 10 && (newWidth + this.left) < 490) {
      this.width = newWidth;
    }
    this.textOutside = null;
  }

  public onDragLeft(newPosition: { left: number, right: number }) {
    const newLeft = newPosition.left;
    if (newLeft > 10 && (newLeft + this.width) < 490) {
      this.left = newLeft;
    }
    this.textOutside = null;
  }

  public onOutsideRight() {
    console.info("onOutsideRight")
    if (this.left < 480) {
      this.left += 10;
      this.width -= 10;
    }
  }

  public onOutsideLeft() {
    if (this.width > 20) {
      this.width -= 10;
    }
  }

  public onExitRight() {
    this.textOutside = '(outside right)';
  }

  public onExitLeft() {
    this.textOutside = '(outside left)';
  }

  public onMoveEnd() {
    this.textOutside = null;
  }

  public hideSticky($event: MouseEvent) {
    $event.stopImmediatePropagation();
    this.stickyPanelVisible = false;
  }

  public showSticky($event: MouseEvent) {
    this.stickyPanelVisible = true;
  }

}
