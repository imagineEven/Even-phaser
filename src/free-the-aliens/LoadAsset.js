import AssetJson from './AssetJson';
import CurrentWorld from '../../framework/data/CurrentWorld';

function loadSprite(key) {
  CurrentWorld.game.loadSil(key);
}

export default class LoadAsset {

  static loadJsonArray(_list) {
    _list.forEach(LoadAsset.loadJson);
  }

  static loadJson(_element) {
    CurrentWorld.game.loadAtlasJSONHash(_element.name, _element.image, _element.json);
  }

  static loading() {
    CurrentWorld.game.loadImageArr(AssetJson.image);
    CurrentWorld.game.loadAudioArr(AssetJson.sound);
    LoadAsset.loadJsonArray(AssetJson.json);
    for (let i in AssetJson.base.json) {
      if (AssetJson.base.json.hasOwnProperty(i))
        CurrentWorld.game.loadSil(AssetJson.base.json[i]);
    }
    AssetJson.base.sprite.forEach(loadSprite, this);
  }
}