import { AfterViewInit, ElementRef, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import * as i0 from "@angular/core";
export declare class InfoPanelComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    container: HTMLElement;
    panel: ElementRef<HTMLElement>;
    margin: number;
    animate: number;
    anchor: 'top' | 'bottom' | 'left' | 'right';
    direction: 'vertical' | 'horizontal';
    sticky: boolean;
    stickyVisible: boolean;
    style: any;
    fullSize: boolean;
    fullMargin: number;
    private actualPosition;
    private isInitialised;
    private animationState;
    private animationTimeout;
    constructor();
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    private initContainer;
    private checkPanelSize;
    private placeTo;
    private initAnimation;
    private continueAnimation;
    private stopAnimation;
    private drawUpdate;
    static ɵfac: i0.ɵɵFactoryDeclaration<InfoPanelComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<InfoPanelComponent, "info-panel", never, { "container": { "alias": "container"; "required": false; }; "margin": { "alias": "margin"; "required": false; }; "animate": { "alias": "animate"; "required": false; }; "anchor": { "alias": "anchor"; "required": false; }; "direction": { "alias": "direction"; "required": false; }; "sticky": { "alias": "sticky"; "required": false; }; "stickyVisible": { "alias": "stickyVisible"; "required": false; }; "style": { "alias": "style"; "required": false; }; "fullSize": { "alias": "fullSize"; "required": false; }; "fullMargin": { "alias": "fullMargin"; "required": false; }; }, {}, never, ["*"], false, never>;
}
