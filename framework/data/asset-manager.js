import ReadJsonAsset from '../plugins/ReadJsonAsset';

let _symbol = {
  image: Symbol(),
  sound: Symbol(),
  json: Symbol(),
  tempJsonKey: Symbol(),
  tempImageKey: Symbol()
};
let readType = function (type, data, key) {
  let tempData;
  switch (type) {
    case 'object':
      tempData = ReadJsonAsset.concatObject(data);
      break;
    case 'json':
      tempData = ReadJsonAsset.readKeyAssetPushArray(data, key);
      break;
    default:
      tempData = data;
      break;
  }
  return tempData;
};

class AssetManager {
  constructor() {
    this[_symbol.image] = [];
    this[_symbol.sound] = [];
    this[_symbol.json] = [];
  }

  addAsset(assetStyle, addData, type, key) {
    this[assetStyle] = this[assetStyle].concat(readType(type, addData, key));
  }

  addJson(type, data, imageKey, jsonKey) {
    this[_symbol.tempJsonKey] = readType(type, data, jsonKey);
    this[_symbol.tempImageKey] = readType(type, data, imageKey);
    this[_symbol.tempJsonKey].forEach(this.arrangeJson, this);
  }

  arrangeJson(json, index) {
    this.json.push({
      name: json,
      image: `${this[_symbol.tempImageKey][index]}.png`,
      json: `${json}.json`
    });
  }

  get image() {
    return this[_symbol.image];
  }

  set image(value) {
    this[_symbol.image] = value;
  }

  get sound() {
    return this[_symbol.sound];
  }

  set sound(value) {
    this[_symbol.sound] = value;
  }

  get json() {
    return this[_symbol.json];
  }

  set json(value) {
    this[_symbol.json] = value;
  }
}

export default AssetManager;