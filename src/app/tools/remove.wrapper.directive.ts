import {Directive, ElementRef} from '@angular/core';

@Directive({
  selector: '[remove-wrapper]',
})
export class RemoveWrapperDirective {
  constructor(private el: ElementRef) {
    setTimeout(()=>{
      const parentElement: HTMLElement = el.nativeElement.parentElement;
      const element = el.nativeElement;
      for (let i = 0; i < element.children.length; i++){
        const child = element.children[i];
        parentElement.insertBefore(element.removeChild(child), element);
      }
      element.remove();
    });
  }
}
