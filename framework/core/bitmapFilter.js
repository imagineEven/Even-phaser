import Phaser from 'phaser';
class SpriteNew extends Phaser.Sprite {

  constructor(game, x, y, key, frame) {
    super(game, x, y, key, frame);
    this.defaultKey = key;
    this.filterCache = {};
  }

  loadTexture(key, isFilter) {
    super.loadTexture(key);
    if (!isFilter) {
      this.defaultKey = key;
      this.resetFilters();
    }
  }

  addChild(child) {
    super.addChild(child);
    if (child.resetFilters) {
      child.resetFilters();
    }
  }

  removeChild(child) {
    super.removeChild(child);
    if (child.resetFilters) {
      child.resetFilters();
    }
  }

  //重置滤镜
  resetFilters() {
    if (this.destroyPhase) {
      return;
    }
    let nowFilters = this.parent ? this.parent.myfilters : undefined;
    if (this.myfilters) {
      nowFilters = this.myfilters;
    }
    if (nowFilters === undefined) {
      this.loadTexture(this.defaultKey, true);
    } else {
      let cacheKey = this.defaultKey;
      nowFilters.forEach((filterItem) => {
        if (filterItem) {
          cacheKey += filterItem.filterType;
        }
      });
      if (this.filterCache[cacheKey]) {
        this.loadTexture(this.filterCache[cacheKey], true);
      } else {
        let bmd = this.game.make.bitmapData();
        bmd.load(this.defaultKey);
        nowFilters.forEach((filterItem) => {
          if (filterItem && filterItem.forEachPixel) {
            bmd.processPixelRGB(filterItem.forEachPixel, filterItem);
          }
        });
        this.filterCache[cacheKey] = bmd;
        this.loadTexture(bmd, true);
      }
    }

    this.children.forEach((child) => {
      if (child.resetFilters) {
        child.resetFilters();
      }
    });
  }

  get filters() {
    return this.myfilters;
  }


  set filters(val) {
    this.myfilters = val;
    if (this.destroyPhase) {
      return;
    }
    this.resetFilters();
  }


}


class TileSpriteNew extends Phaser.TileSprite {

  constructor(game, x, y, width, height, key, frame) {
    super(game, x, y, width, height, key, frame);
    this.defaultKey = key;
    this.filterCache = {};
  }

  loadTexture(key, isFilter) {
    super.loadTexture(key);
    if (!isFilter && this.game) {
      this.defaultKey = key;
      this.resetFilters();
    }
  }

  addChild(child) {
    super.addChild(child);
    if (child.resetFilters && child.game) {
      child.resetFilters();
    }
  }

  removeChild(child) {
    super.removeChild(child);
    if (child.resetFilters && child.game) {
      child.resetFilters();
    }
  }

  //重置滤镜
  resetFilters() {
    if (this.destroyPhase) {
      return;
    }
    let nowFilters = this.parent ? this.parent.myfilters : undefined;
    if (this.myfilters) {
      nowFilters = this.myfilters;
    }
    if (nowFilters === undefined) {
      this.loadTexture(this.defaultKey, true);
    } else {
      let cacheKey = this.defaultKey;
      nowFilters.forEach((filterItem) => {
        if (filterItem) {
          cacheKey += filterItem.filterType;
        }
      });
      if (this.filterCache[cacheKey]) {
        this.loadTexture(this.filterCache[cacheKey], true);
      } else {
        let bmd = this.game.make.bitmapData();
        bmd.load(this.defaultKey);
        nowFilters.forEach((filterItem) => {
          if (filterItem && filterItem.forEachPixel) {
            bmd.processPixelRGB(filterItem.forEachPixel, filterItem);
          }
        });
        this.filterCache[cacheKey] = bmd;
        this.loadTexture(bmd, true);
      }
    }

    this.children.forEach((child) => {
      if (child.resetFilters) {
        child.resetFilters();
      }
    });
  }

  get filters() {
    return this.myfilters;
  }


  set filters(val) {
    this.myfilters = val;
    if (this.destroyPhase) {
      return;
    }
    this.resetFilters();
  }

}



class TextNew extends Phaser.Text {

  constructor(game, x, y, text, style) {
    super(game, x, y, text, style);
    if (style && style.fill) {
      this.defaultFill = style.fill;
    }
  }

  get fill() {
    return this._fill;
  }

  set fill(val) {
    this._fill = val;
    this.defaultFill = val;
    this.style.fill = this._fill;
    this.setStyle(this.style);
  }

  hexToRgb(hex) {
    return { r: parseInt('0x' + hex.slice(1, 3)), g: parseInt('0x' + hex.slice(3, 5)), b: parseInt('0x' + hex.slice(5, 7)) };
  }

  //重置滤镜
  resetFilters() {
    if (this.destroyPhase) {
      return;
    }
    let nowFilters = this.parent ? this.parent.myfilters : undefined;
    if (this.myfilters) {
      nowFilters = this.myfilters;
    }
    if (nowFilters === undefined) {

      this._fill = this.defaultFill;
      this.style.fill = this._fill;
      this.setStyle(this.style);
    } else {

      let nowColor = this.defaultFill;
      if (nowColor === undefined) {
        nowColor = '#000000';
      }
      if (nowColor.startsWith('#')) {
        nowColor = this.hexToRgb(nowColor);
      }
      nowFilters.forEach((filterItem) => {
        if (filterItem && filterItem.forEachPixel) {
          nowColor = filterItem.forEachPixel(nowColor);
        }
      });
      this._fill = nowColor;
      this.style.fill = this._fill;
      this.setStyle(this.style);
    }

    this.children.forEach((child) => {
      if (child.resetFilters) {
        child.resetFilters();
      }
    });
  }

  get filters() {
    return this.myfilters;
  }


  set filters(val) {
    this.myfilters = val;
    if (this.destroyPhase) {
      return;
    }
    this.resetFilters();
  }

  addChild(child) {
    super.addChild(child);
    if (child.resetFilters) {
      child.resetFilters();
    }
  }

  removeChild(child) {
    super.removeChild(child);
    if (child.resetFilters) {
      child.resetFilters();
    }
  }

}

class GroupNew extends Phaser.Group {
  constructor(game, parent, name, addToStage, enableBody, physicsBodyType) {
    super(game, parent, name, addToStage, enableBody, physicsBodyType);
  }

  addChild(child) {
    super.addChild(child);
    if (child.resetFilters) {
      child.resetFilters();
    }
  }

  removeChild(child) {
    super.removeChild(child);
    if (child.resetFilters) {
      child.resetFilters();
    }
  }

  get filters() {
    return this.myfilters;
  }


  set filters(val) {
    this.myfilters = val;
    if (this.destroyPhase) {
      return;
    }
    this.resetFilters();
  }

  //重置滤镜
  resetFilters() {
    if (this.destroyPhase) {
      return;
    }
    this.children.forEach((child) => {
      if (child.resetFilters) {
        child.resetFilters();
      }
    });
  }

}

Phaser.SpriteNew = SpriteNew;
Phaser.GameObjectFactory.prototype.sprite = function(x, y, key, frame, group) {
  if (group === undefined) {
    group = this.world; 
  }
  return this.world.add(new Phaser.SpriteNew(this.game, x, y, key, frame));
};

Phaser.TextNew = TextNew;
Phaser.GameObjectFactory.prototype.text = function(x, y, text, style, group) {
  if (group === undefined) {
    group = this.world; 
  }
  return this.world.add(new Phaser.TextNew(this.game, x, y, text, style));
};

Phaser.GroupNew = GroupNew;

Phaser.GameObjectFactory.prototype.group = function(parent, name, addToStage, enableBody, physicsBodyType) {
  return new Phaser.GroupNew(this.game, parent, name, addToStage, enableBody, physicsBodyType);
};

Phaser.TileSpriteNew = TileSpriteNew;

Phaser.GameObjectFactory.prototype.tileSprite = function(x, y, width, height, key, frame, group) {
  if (group === undefined) {
    group = this.world; 
  }
  return this.world.add(new Phaser.TileSpriteNew(this.game, x, y, width, height, key, frame));
};
