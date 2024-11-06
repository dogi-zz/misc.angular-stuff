import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {JsonParser} from "../../../libs/json-parser/src/json-parser";
import {measureSync} from "../tools/time-tools";

/* eslint-disable-next-line */
declare const ace: any;


class JsonCodeChecker extends JsonParser {

  public error: { message: string, line: number };

  protected override onJsonLexerError(message: string, position: number, line: number, column: number) {
    this.error = {message, line};
  }
}

@Component({
  selector: 'json-editor',
  template: `
    <div class="codeWrapper" #codeWrapper>
      <div class="gutter"></div>
      <div #edit></div>
    </div>
  `,
  styles: [
    `
      @import (reference) "../../styles/includes";

      .codeWrapper {
        border: 1px solid @active-color;
        background: white;
        padding: 10px 0;
        position: relative;
        border-radius: 3px;

        .gutter {
          position: absolute;
          background: rgb(240, 240, 240);
          top: 0;
          left: 0;
          width: 45px;
          height: 100%;
          border-radius: 3px;
        }
      }

      .ace_active-line-red {
        position: absolute;
        background-color: rgba(255, 0, 0, 0.3); /* Leicht transparentes Rot */
        z-index: 20; /* Damit es über anderen Elementen liegt */
      }

    `,
  ],
})
export class JsonEditorComponent implements AfterViewInit, OnChanges {

  @ViewChild('codeWrapper') private codeWrapper: ElementRef<HTMLDivElement>;
  @ViewChild('edit') private edit: ElementRef<HTMLDivElement>;

  @Input()
  public name: string;


  @Input()
  public jsonString: string;

  @Output()
  public jsonStringChange = new EventEmitter<string>();

  @Output()
  public jsonParseError  = new EventEmitter<string>();

  private editor: any;

  public constructor(
    private el: ElementRef<HTMLElement>,
  ) {
    console.info(this);
  }

  public ngOnChanges(changes: SimpleChanges) {
    console.info({changes});
    if (this.editor) {
      this.editor.setValue(this.jsonString, -1);
    }
  }

  public ngAfterViewInit() {
    this.editor = ace.edit(this.edit.nativeElement, {
      //selectionStyle: 'text',
      autoScrollEditorIntoView: true,
      maxLines: 100,
      minLines: 2,
      rulers: [],
    });
    this.editor.setTheme('ace/theme/textmate');
    this.editor.session.setMode('ace/mode/json');
    this.editor.session.setUseWorker(false);
    this.editor.setShowPrintMargin(false);
    this.editor.setValue(this.jsonString, -1);
    // setTimeout(() => {
    //   console.info(this.editor);
    //   this.editor.setValue(this.jsonString, -1);
    // });

    this.editor.getSession().on('change', () => {
      this.checkValue(this.editor.getValue());
    });

    (this.el.nativeElement as any).__component__ = this;
  }


  private checkValue(value: string) {
    const prevMarkers = this.editor.session.getMarkers();
    if (prevMarkers) {
      const prevMarkersArr = Object.keys(prevMarkers);
      for (const item of prevMarkersArr) {
        this.editor.session.removeMarker(prevMarkers[item].id);
      }
    }

    const checker = new JsonCodeChecker();
    const [parseTime] = measureSync(() => checker.parse(value));
    if (parseTime > 5) {
      console.info(`parse time was ${parseTime} ms`);
    }
    if (checker.error) {
      this.editor.session.addMarker(new ace.Range(checker.error.line, 0, checker.error.line, 1), 'ace_active-line-red', 'fullLine');
      this.jsonParseError.emit(`Parse Error in line ${checker.error.line}: "${checker.error.message}"`);
    } else {
      this.jsonString = value;
      this.jsonStringChange.emit(this.jsonString);
    }
  }

}
