import {Component, OnChanges, OnInit} from '@angular/core';

@Component({
  selector: 'bar-and-panel-showcase',
  templateUrl: './bar-and-panel-showcase.component.html',
})
export class BarAndPanelShowcaseComponent implements OnInit {

  public width = 120;
  public left = 20;
  public textOutside: string;

  public stickyPanelVisible = true;

  constructor() {
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
