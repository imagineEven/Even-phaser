let Device = class {
  constructor() {
    this.deviceType = {
      ios: Symbol.for('ios'),
      android: Symbol.for('android'),
      win: Symbol.for('win'),
      mac: Symbol.for('mac'),
      wechat: Symbol.for('wechat'),
      unknow: Symbol.for('unknow'),
    };
  }

  checkPlatform(userNavigator = navigator) {
    if (/(iPhone|iPad|iPod|iOS)/i.test(userNavigator.userAgent)) {
      return this.deviceType.ios;
    }
    if (/(Android)/i.test(userNavigator.userAgent)) {
      return this.deviceType.android;
    }
    if ((userNavigator.platform === 'Mac68K') || (userNavigator.platform ===
        'MacPPC') || (userNavigator.platform === 'Macintosh') || (userNavigator.platform ===
        'MacIntel')) {
      return this.deviceType.mac;
    }
    if ((userNavigator.platform === 'Win32') || (userNavigator.platform ===
        'Windows')) {
      return this.deviceType.win;
    }
    return this.deviceType.unknow;
  }

  checkWechat(userNavigator = navigator) {
    return userNavigator.userAgent.toLowerCase().match(
      /MicroMessenger/i) === 'micromessenger';
  }
};

export {
  Device
};