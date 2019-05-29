import Typeof from '../core/Typeof';
import _ from 'lodash';
import { CONSTANT } from '../core/Constant';
let ReadJsonAsset = (function () {
  class ReadJsonAsset {

    static readKeyAssetPushArray(_json, _key) {
      let _list = [];
      _key = [].concat(_key);
      switch (Typeof(_json)) {
        case 'array':
          for (let i = 0; i < _json.length; i++) {
            switch (Typeof(_json[i])) {
              case 'array':
              case 'object':
                _list = _list.concat(ReadJsonAsset.readKeyAssetPushArray(_json[i], _key));
                break;
              default:
                break;
            }
          }
          break;
        case 'object':
          for (let j in _json) {
            if (_json.hasOwnProperty(j)) {
              let _keyIndex = _key.indexOf(j);
              if (_keyIndex === -1) {
                _list = _list.concat(ReadJsonAsset.readKeyAssetPushArray(_json[j], _key));
              } else {
                switch (Typeof(_json[j])) {
                  case 'array':
                    _list = _list.concat(_json[j]);
                    break;
                  case 'object':
                    _list = _list.concat(ReadJsonAsset.concatObject(_json[j]));
                    break;
                  default:
                    _list = _list.concat(_json[j]);
                    break;
                }
              }
            }
          }
          break;
        default:
          break;
      }
      return _list;
    }

    static readJsonResource(jsonData) {
      let resourceObj = { 'images': [], 'sounds': [], 'jsons': [], 'videos': [], 'xmls': [] };
      for (let i in jsonData) {
        let data = jsonData[i];
        let key = i.toLowerCase();
        if ((key === CONSTANT.SOUND || key === CONSTANT.SOUNDS) ||
          (key === CONSTANT.VIDEO || key === CONSTANT.VIDEOS) ||
          (key === CONSTANT.IMAGE || key === CONSTANT.IMAGES) ||
          (key === CONSTANT.JSON || key === CONSTANT.JSONS) ||
          (key === CONSTANT.XML || key === CONSTANT.XMLS) ||
          (key === CONSTANT.IMAGE_OBJ || key === CONSTANT.SOUND_OBJ)) {
          key = key.endsWith('s') ? key.substr(0, key.length - 1) : key;
          resourceObj = ReadJsonAsset.concatResource(resourceObj, data, key);
          continue;
        }
        if (_.isPlainObject(data) || _.isArray(data)) {
          let tempResourceObj = ReadJsonAsset.readJsonResource(data);
          resourceObj = ReadJsonAsset.concatResource(resourceObj, tempResourceObj);
        }
      }
      return resourceObj;
    }

    static concatResource(targetObj, obj, type) {
      if (!obj)
        return targetObj;
      switch (type) {
        case CONSTANT.JSON:
          targetObj.jsons = targetObj.jsons.concat(obj);
          break;
        case CONSTANT.XML:
          targetObj.xmls = targetObj.xmls.concat(obj);
          break;
        case CONSTANT.IMAGE:
          targetObj.images = targetObj.images.concat(obj);
          break;
        case CONSTANT.SOUND:
          targetObj.sounds = targetObj.sounds.concat(obj);
          break;
        case CONSTANT.VIDEO:
          targetObj.videos = targetObj.videos.concat(obj);
          break;
        case CONSTANT.IMAGE_OBJ:
          targetObj.imageObj = obj;
          break;
        case CONSTANT.SOUND_OBJ:
          targetObj.soundObj = obj;
          break;
        default:
          targetObj.xmls = targetObj.xmls.concat(obj.xmls || []);
          targetObj.jsons = targetObj.jsons.concat(obj.jsons || []);
          targetObj.images = targetObj.images.concat(obj.images || []);
          targetObj.sounds = targetObj.sounds.concat(obj.sounds || []);
          targetObj.videos = targetObj.videos.concat(obj.videos || []);
          break;
      }
      return targetObj;
    }

    static concatObject(_object) {
      let _list = [];
      for (let i in _object) {
        _list = _list.concat(_object[i + '']);
      }
      return _list;
    }
  }

  return ReadJsonAsset;
})();
export default ReadJsonAsset;