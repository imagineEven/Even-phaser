
class BaseSprite extends Phaser.Sprite {
  constructor(game, x, y, key, frame, group) {
    super(game, x, y, key, frame, group);
    this.$layoutStyle = {
      $root: this,
      _marginLeft: 0,
      _marginRight: 0,
      _marginTop: 0,
      _marginBottom: 0,
      get marginLeft() {
        return this._marginLeft;
      },
      set marginLeft(val) {
        this._marginLeft = val;
        this.$root.parentReDraw();
      },
      get marginRight() {
        return this._marginRight;
      },
      set marginRight(val) {
        this._marginRight = val;
        this.$root.parentReDraw();
      },
      get marginTop() {
        return this._marginTop;
      },
      set marginTop(val) {
        this._marginTop = val;
        this.$root.parentReDraw();
      },
      get marginBottom() {
        return this._marginBottom;
      },
      set marginBottom(val) {
        this._marginBottom = val;
        this.$root.parentReDraw();
      },
      set(top, right, bottom, left) {
        this._marginLeft = left;
        this._marginRight = right;
        this._marginTop = top;
        this._marginBottom = bottom;
        this.$root.parentReDraw();
      }
    };
  }

  parentReDraw() {
    if (this.parent && this.parent.objType === 'layoutblock' && this.parent.redraw) {
      this.parent.redraw();
    }
  }

  get layoutStyle() {
    return this.$layoutStyle;
  }

  set layoutStyle(val) {
    this.$layoutStyle = val;
  }


}
export default BaseSprite;