import { AfterViewInit, ElementRef, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as i0 from "@angular/core";
export declare class SplitBarComponent implements OnInit, OnChanges, AfterViewInit {
    container: HTMLElement;
    bar: ElementRef<HTMLElement>;
    positionLeft: number;
    positionRight: number;
    outsideIntervalTime: number;
    stickVisibility: boolean;
    newPosition: EventEmitter<{
        left: number;
        right: number;
    }>;
    outsideRight: EventEmitter<void>;
    outsideLeft: EventEmitter<void>;
    exitRight: EventEmitter<void>;
    exitLeft: EventEmitter<void>;
    moveEnd: EventEmitter<void>;
    constructor();
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    private initContainer;
    private checkPosition;
    mouseEnter(): void;
    mouseLeave(): void;
    private initBarDrag;
    static ɵfac: i0.ɵɵFactoryDeclaration<SplitBarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SplitBarComponent, "split-bar", never, { "container": { "alias": "container"; "required": false; }; "positionLeft": { "alias": "positionLeft"; "required": false; }; "positionRight": { "alias": "positionRight"; "required": false; }; "outsideIntervalTime": { "alias": "outsideIntervalTime"; "required": false; }; "stickVisibility": { "alias": "stickVisibility"; "required": false; }; }, { "newPosition": "newPosition"; "outsideRight": "outsideRight"; "outsideLeft": "outsideLeft"; "exitRight": "exitRight"; "exitLeft": "exitLeft"; "moveEnd": "moveEnd"; }, never, never, false, never>;
}
