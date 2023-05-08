

export const genericFormGetJsonPart = (name: string, value: any)=>{
  const jsonString = JSON.stringify({[name] : value}, null, 2);
  const jsonStringLines = jsonString.split('\n');
  return jsonStringLines.slice(1, jsonStringLines.length -1).join('\n');
};
