import { OnInit } from '@angular/core';
import * as i0 from "@angular/core";
export declare class BarAndPanelShowcaseComponent implements OnInit {
    width: number;
    left: number;
    textOutside: string;
    stickyPanelVisible: boolean;
    constructor();
    ngOnInit(): void;
    onDragRight(newPosition: {
        left: number;
        right: number;
    }): void;
    onDragLeft(newPosition: {
        left: number;
        right: number;
    }): void;
    onOutsideRight(): void;
    onOutsideLeft(): void;
    onExitRight(): void;
    onExitLeft(): void;
    onMoveEnd(): void;
    hideSticky($event: MouseEvent): void;
    showSticky($event: MouseEvent): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BarAndPanelShowcaseComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BarAndPanelShowcaseComponent, "bar-and-panel-showcase", never, {}, {}, never, never, false, never>;
}
