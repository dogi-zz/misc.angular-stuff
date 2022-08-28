import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';

declare const ResizeObserver : any;

@Component({
  selector: 'info-panel',
  template: `
    <div class="info-panel" #panel><ng-content></ng-content></div>`,
  styles: [
    `.info-panel {
        box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
    }`,
  ],
})
export class InfoPanelComponent implements OnInit, OnChanges, AfterViewInit {

  @Input()
  public container: HTMLElement;

  @ViewChild('panel')
  public panel: ElementRef<HTMLElement>;

  @Input()
  public margin: number = 0;


  constructor() {
  }

  public ngOnInit(): void {
  }

  public ngAfterViewInit() {
    this.initContainer();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.container) {
      this.initContainer();
    }
  }

  private initContainer() {
    if (this.container && this.panel?.nativeElement) {
      this.container.style.position = 'relative';

      this.panel.nativeElement.style.position = 'absolute';
      this.panel.nativeElement.style.top = '';
      this.panel.nativeElement.style.bottom = `${this.margin}px`;
      this.panel.nativeElement.style.left = '';
      this.panel.nativeElement.style.right = '';

      this.panel.nativeElement.style.display = 'inline-block';


      this.container.addEventListener('mousemove', (event)=>{
        const gapPoint = this.container.getBoundingClientRect().bottom  - this.panel.nativeElement.getBoundingClientRect().height - this.margin * 2;
        this.panel.nativeElement.style.top = '';
        this.panel.nativeElement.style.bottom = '';
        if ( event.clientY < gapPoint ){
          this.panel.nativeElement.style.bottom = `${this.margin}px`;
        }
        if ( event.clientY > gapPoint ){
          this.panel.nativeElement.style.top = `${this.margin}px`;
        }
      });

      const resize = new ResizeObserver(()=>{
        this.checkWidth();
      });
      resize.observe(this.container);
      resize.observe(this.panel.nativeElement);

      this.checkWidth();
    }
  }

  private checkWidth() {
    this.panel.nativeElement.style.left = `${(this.container.getBoundingClientRect().width - this.panel.nativeElement.getBoundingClientRect().width) / 2}px`;

  }


}
