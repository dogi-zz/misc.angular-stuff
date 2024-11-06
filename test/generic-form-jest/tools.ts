import * as _ from 'lodash';
import {FormUiItemArray, FormUiItemObject} from '../../libs/generic-form/generic-form-instance';

const fromUiItemsArray = (items: FormUiItemArray) => {
  if (items === null){
    return null;
  }
  return items.map((item) => {
    if (item.type === 'input') {
      return {...item, path: item.path.items.join('.'), inputType: item.def.type, def: undefined};
    }
    if (item.type === 'object') {
      return {...item, path: item.path.items.join('.'), children: fromUiItemsObject(item.children)};
    }
    if (item.type === 'array') {
      return {...item, path: item.path.items.join('.'), children: fromUiItemsArray(item.children)};
    }
    return undefined;
  });
};
const fromUiItemsObject = (items: FormUiItemObject) => {
  return _.fromPairs(Object.entries(items).map(([key, item]) => {
    if (item.type === 'input') {
      return [key, {...item, path: item.path.items.join('.'), inputType: item.def.type, def: undefined}];
    }
    if (item.type === 'object') {
      return [key, {...item, path: item.path.items.join('.'), children: fromUiItemsObject(item.children)}];
    }
    if (item.type === 'array') {
      return [key, {...item, path: item.path.items.join('.'), children: fromUiItemsArray(item.children)}];
    }
    return [key, undefined];
  }));
};
export const fromUiItems = (items: FormUiItemObject) => {
  return fromUiItemsObject(items);
};
