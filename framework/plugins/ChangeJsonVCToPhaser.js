let _symbol = {
  _key: Symbol(),
  baseFrameName: Symbol(),
  frames: Symbol()
};

function ObjectToArray(_obj, key, _baseFrameName) {
  let array = [];
  for (let i in _obj) {
    let obj = JSON.parse(JSON.stringify(_obj[i + '']));
    let oldName = i + '';
    let index = oldName.substring(key.length, oldName.length);
    obj.framename = _baseFrameName + index;
    array[Number(index)] = obj;
  }
  return array;
}

function ChangeFrame(_element) {
  ObjectToArray(_element, this.nodeKey, this.baseFrameName);
}

class ChangeJsonVCToPhaser {
  static spriteJson(_json, _key, _name) {
    ChangeJsonVCToPhaser.nodeKey = _key;
    ChangeJsonVCToPhaser.baseFrameName = _name;
    _json.frames.forEach(ChangeFrame, ChangeJsonVCToPhaser);
  }

  static get nodeKey() {
    return ChangeJsonVCToPhaser[_symbol._key];
  }

  static set nodeKey(_key) {
    ChangeJsonVCToPhaser[_symbol._key] = _key;
  }

  static set baseFrameName(_name) {
    ChangeJsonVCToPhaser[_symbol.baseFrameName] = _name;
  }

  static get baseFrameName() {
    return ChangeJsonVCToPhaser[_symbol.baseFrameName];
  }

  static get frames() {
    return ChangeJsonVCToPhaser[_symbol.baseFrameName];
  }
}
ChangeJsonVCToPhaser[_symbol._key] = '';
ChangeJsonVCToPhaser[_symbol.baseFrameName] = '';
ChangeJsonVCToPhaser[_symbol.baseFrameName].frames = [];
export default ChangeJsonVCToPhaser;