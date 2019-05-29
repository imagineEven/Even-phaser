class CurrentWorld {
  static set game(_value) {
    CurrentWorld._game = _value;
  }

  static get game() {
    return CurrentWorld._game;
  }
}

export default CurrentWorld;