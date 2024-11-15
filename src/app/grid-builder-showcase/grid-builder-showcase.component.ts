import {AfterViewInit, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {GridBuilderDefinition, PanelBuilderButton, PanelBuilderWidgetBase, PanelBuilderWidgetType} from "../../../libs/grid-builder/grid-builder.definition";

const materialIcons: { [button in PanelBuilderButton]: string } = {
  'add': 'add',
  'delete': 'delete',
  'rows': 'table_rows',
  'columns': 'view_column',
  'cell': 'question_mark',
  'align-left': 'align_horizontal_left',
  'align-right': 'align_horizontal_right',
  'align-center': 'align_horizontal_center',
  'align-top': 'align_vertical_top',
  'align-middle': 'align_vertical_center',
  'align-bottom': 'align_vertical_bottom',
  'columns-full': 'swap_horiz',
  'rows-full': 'swap_vert',
};


@Component({
  selector: 'grid-builder-showcase',
  template: `
    <h1>Grid Builder</h1>

    <div class="layout-builder">
      <grid-builder-panel [editMode]="true" [widgetTypes]="widgetTypes" [rowStyles]="rowStyles" [(definition)]="panelBuilderDefinition" [data]="someData" [resolveButtonContent]="resolveButtonContent"></grid-builder-panel>
    </div>

    <h1>Result</h1>

    <div class="layout-preview">
      <grid-builder-panel [editMode]="false" [widgetTypes]="widgetTypes" [rowStyles]="rowStyles" [definition]="panelBuilderDefinition" [data]="someData"></grid-builder-panel>
    </div>

    <h1>Configuration</h1>

    <div class="layout-config">
      <pre [innerHTML]="panelBuilderDefinition|json|prettyjson"></pre>
    </div>

    <ng-template #helloWidget let-config="config" let-edit="edit" let-data="data" let-configChange="configChange">
      <hello-world-widget [config]="config" [data]="data" [edit]="edit" (configChange)="configChange($event)"></hello-world-widget>
    </ng-template>

    <ng-template #listWidget let-config="config" let-edit="edit" let-data="data" let-configChange="configChange">
      <list-widget [config]="config" [data]="data" [edit]="edit" (configChange)="configChange($event)"></list-widget>
    </ng-template>

  `,
  styleUrls: [
    './grid-builder-showcase.component.less',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class GridBuilderShowcaseComponent implements OnInit, AfterViewInit {

  @ViewChild('helloWidget') private helloWidget: TemplateRef<any>;
  @ViewChild('listWidget') private listWidget: TemplateRef<any>;

  public panelBuilderDefinition: GridBuilderDefinition = {
    type: 'rows',
    rows: [
      {type: 'cell', cellType: 'hello_world', config: {name: 'User'}},
      {
        type: 'columns',
        columns: [
          {type: 'cell', cellType: 'hello_world', config: {name: 'left'}},
          {type: 'cell', cellType: 'list', config: {}},
          {type: 'cell', cellType: 'hello_world', config: {name: 'right'}},
          {
            type: 'rows',
            fullSize: true,
            rows: [
              {type: 'cell', cellType: 'hello_world', config: {name: 'top'}},
              {type: 'cell', cellType: 'hello_world', config: {name: 'bottom'}},
            ],
          },
          // {
          //   type: 'rows',
          //   extraStyle: "panel",
          //   rows: [
          //     {type: 'cell', cellType: 'label', config: {text: 1}},
          //     {type: 'cell', cellType: 'hello_world', config: {name: 'Panel'}},
          //   ],
          // },
          // {type: 'cell', cellType: 'list', config: {}},
          // {type: 'cell', cellType: 'list', config: {}},
        ],
      },
      {
        type: 'columns',
        align: 'middle',
        fullSize: true,
        columns: [
          {type: 'cell', cellType: 'hello_world', config: {name: 'left'}},
          {type: 'cell', cellType: 'list', config: {}},
          {type: 'cell', cellType: 'hello_world', config: {name: 'right'}},
          {
            type: 'rows',
            //fullSize: true,
            extraStyle: "panel",
            rows: [
              {type: 'cell', cellType: 'hello_world', config: {name: 'top'}},
              {type: 'cell', cellType: 'hello_world', config: {name: 'bottom'}},
            ],
          },
        ],
      },
    ],
  };

  public someData = {
    text1: 'This is Text 1',
    text2: 'This is Text 2',
    someListData: [
      'item 1',
      'item 2',
      'item 3',
      'item 4',
    ],
  };


  public widgetTypes: { [type: string]: PanelBuilderWidgetType };
  public rowStyles: { icon: string, style: string }[];

  public resolveButtonContent: (button: PanelBuilderButton) => string = (button) => {
    return `<span class="material-symbols-outlined">${materialIcons[button]}</span>`;
  };

  public constructor() {
  }

  public ngOnInit(): void {

  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.rowStyles = [
        {icon: `<span class="material-symbols-outlined">web_asset</span>`, style: 'panel'},
      ];

      this.widgetTypes = {
        hello_world: {
          icon: `<span class="material-symbols-outlined">front_hand</span>`, template: this.helloWidget,
          createConfig: () => ({name: null}),
        },
        list: {
          icon: `<span class="material-symbols-outlined">format_list_bulleted</span>`, template: this.listWidget,
          createConfig: () => ({}),
        },
      };

    });
  }

}


@Component({
  selector: 'hello-world-widget',
  template: `
    <ng-container *ngIf="edit">
      <div class="hello-world-widget">
        <div class="widget-config">
          Hello-World Widget:
          <div class="widget-config-line">
            <label>Name</label>
            <input *ngIf="config" type="text" placeholder="Name" [(ngModel)]="config.name" (ngModelChange)="configChange.emit(config)"/>
          </div>
        </div>
      </div>
    </ng-container>
    <ng-container *ngIf="!edit">
      <div class="hello-world-widget">
        Hello {{ config?.name }}!
      </div>
    </ng-container>
  `,
})
export class HelloWorldWidgetComponent extends PanelBuilderWidgetBase<{ name: string }> {


  public constructor() {
    super();
    console.info(this);
  }

}


@Component({
  selector: 'list-widget',
  template: `
    <div class="list-widget">
      <ul>
        <li *ngFor="let item of data.someListData">{{ item }}</li>
        <li style="cursor: pointer" (click)="data.someListData.push('new item ' + (data.someListData.length +1))">add...</li>
      </ul>
    </div>
  `,
})
export class ListWidgetComponent extends PanelBuilderWidgetBase<{}> {


  public constructor() {
    super();
    console.info(this);
  }

}

