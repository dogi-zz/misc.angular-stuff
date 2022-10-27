import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({selector: 'ng-template[typedTemplate]'})
export class TypedTemplateDirective<TypeToken> {

  @Input('typedTemplate')
  public typeToken: TypeToken;

  constructor(private contentTemplate: TemplateRef<TypeToken>) {
  }

  public static ngTemplateContextGuard<TypeToken>(dir: TypedTemplateDirective<TypeToken>, ctx: unknown): ctx is TypeToken{ return true; }
}
