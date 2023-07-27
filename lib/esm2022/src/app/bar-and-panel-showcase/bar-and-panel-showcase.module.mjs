import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InfoPanelModule } from '../info-panel/info-panel.module';
import { SplitBarModule } from '../split-bar/split-bar.module';
import { BarAndPanelShowcaseComponent } from './bar-and-panel-showcase.component';
import * as i0 from "@angular/core";
export class BarAndPanelShowcaseModule {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseModule, declarations: [BarAndPanelShowcaseComponent], imports: [CommonModule,
            SplitBarModule,
            InfoPanelModule], exports: [BarAndPanelShowcaseComponent] });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseModule, imports: [CommonModule,
            SplitBarModule,
            InfoPanelModule] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.7", ngImport: i0, type: BarAndPanelShowcaseModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        SplitBarModule,
                        InfoPanelModule,
                    ],
                    declarations: [BarAndPanelShowcaseComponent],
                    exports: [BarAndPanelShowcaseComponent],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyLWFuZC1wYW5lbC1zaG93Y2FzZS5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvYXBwL2Jhci1hbmQtcGFuZWwtc2hvd2Nhc2UvYmFyLWFuZC1wYW5lbC1zaG93Y2FzZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ2hFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUM3RCxPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQzs7QUFZaEYsTUFBTSxPQUFPLHlCQUF5Qjt1R0FBekIseUJBQXlCO3dHQUF6Qix5QkFBeUIsaUJBSHJCLDRCQUE0QixhQUx6QyxZQUFZO1lBRVosY0FBYztZQUNkLGVBQWUsYUFHUCw0QkFBNEI7d0dBRTNCLHlCQUF5QixZQVJsQyxZQUFZO1lBRVosY0FBYztZQUNkLGVBQWU7OzJGQUtOLHlCQUF5QjtrQkFWckMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsWUFBWTt3QkFFWixjQUFjO3dCQUNkLGVBQWU7cUJBQ2hCO29CQUNELFlBQVksRUFBRSxDQUFDLDRCQUE0QixDQUFDO29CQUM1QyxPQUFPLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQztpQkFDeEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtJbmZvUGFuZWxNb2R1bGV9IGZyb20gJy4uL2luZm8tcGFuZWwvaW5mby1wYW5lbC5tb2R1bGUnO1xuaW1wb3J0IHtTcGxpdEJhck1vZHVsZX0gZnJvbSAnLi4vc3BsaXQtYmFyL3NwbGl0LWJhci5tb2R1bGUnO1xuaW1wb3J0IHtCYXJBbmRQYW5lbFNob3djYXNlQ29tcG9uZW50fSBmcm9tICcuL2Jhci1hbmQtcGFuZWwtc2hvd2Nhc2UuY29tcG9uZW50JztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcblxuICAgIFNwbGl0QmFyTW9kdWxlLFxuICAgIEluZm9QYW5lbE1vZHVsZSxcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbQmFyQW5kUGFuZWxTaG93Y2FzZUNvbXBvbmVudF0sXG4gIGV4cG9ydHM6IFtCYXJBbmRQYW5lbFNob3djYXNlQ29tcG9uZW50XSxcbn0pXG5leHBvcnQgY2xhc3MgQmFyQW5kUGFuZWxTaG93Y2FzZU1vZHVsZSB7XG59XG4iXX0=