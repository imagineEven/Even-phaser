import AssetManager from './asset-manager';
import CurrentWorld from './CurrentWorld';


function loadJson(_element) {
  CurrentWorld.game.loadAtlasJSONHash(_element.name, _element.image, _element.json);
}

function loadJsonArray(_list) {
  _list.forEach(loadJson);
}

let _symbol = {
  manager: Symbol(),
  asset: Symbol()
};

class AssetLoader {
  constructor(asset) {
    this[_symbol.manager] = new AssetManager();
    this[_symbol.asset] = asset;
    this[_symbol.manager].addAsset('image', asset.base.image, 'object');
    this[_symbol.manager].addAsset('sound', asset.base.sound, 'object');
    this[_symbol.manager].addJson('json', asset.base.json, asset.base.json.key.image, asset.base.json.key.json);
    this[_symbol.manager].addAsset('image', asset.private, 'json', asset.base.key.image);
    this[_symbol.manager].addAsset('sound', asset.private, 'json', asset.base.key.sound);
    this[_symbol.manager].addJson('json', asset.private, asset.base.key.json.image, asset.base.key.json.json);
  }

  loading() {
    loadJsonArray(this[_symbol.manager].json);
    CurrentWorld.game.loadImageArr(this[_symbol.manager].image);
    CurrentWorld.game.loadAudioArr(this[_symbol.manager].sound);
  }
}

export default AssetLoader;