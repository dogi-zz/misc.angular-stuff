import {Pipe, PipeTransform} from '@angular/core';
import {JsonFormatter, NEW_LINE, WHITE_SPACE} from "../../../libs/json-parser/src/json-formatter";

@Pipe({
  name: 'prettyjson',
  pure: true,
})
export class PrettyJsonPipe implements PipeTransform {
  public transform(value: any, args?: any[]): any {
    let outputString: string;
    try {

      const formatTokens = new JsonFormatter().fetchFormatedTokens(value);
      const resultTokens = formatTokens.map(token => {
        if (token.type === NEW_LINE){
          return '<br/>';
        }
        if (token.type === WHITE_SPACE){
          return token.rawString;
        }
        return `<span class="${token.type}">${this.getHtmlEntities(token.rawString)}</span>`;
      });
      outputString = resultTokens.join('');
    } catch (e) {
      console.error(e);
      outputString = `<span class="error">${this.getHtmlEntities(value)}</span>`;
    }
    return `<span class="prettyjson">${outputString}</span>`;
  }

  private getHtmlEntities(str: string) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }


}
