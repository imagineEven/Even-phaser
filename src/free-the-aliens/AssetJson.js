import ReadJsonAsset from '../../framework/plugins/ReadJsonAsset';

let AssetJson = (function () {
  let _base = {
    imageLabel: ['spaceShipA', 'spaceShipB', 'spaceShipC', 'spaceShipD', 'spaceShipE'],
    caps: [[], [0, 11], [4, 6, 9], [1, 2, 5], [3, 7, 8, 10] ],
    sound: {
      free: 'f182d42308477eafb29548dae9f05abe',
      start:'acb39ca5a589f2c9bc175353f75b2610',
      clickLetsGo: 'd343e887c9cc3e1cfd7a2847e8071426',
      wrong: '1a3e15d3eeebe52d22ae0f212e343066',
      thereIsNoMuchTime: '2cf20bcc584ccf2ba142fcb89a1745fd',
      terrific: '3f9dc8b778201d193a2adc3ac2ed1650',
      warning: '9d28943b748c595b9d234591518a93da',
      dropDownOne: '3f8b633dcb76869695082ea832cd255e',
      dropDownTwo: 'd0709237014bcaf781db4d7f2c332d9d',
      correctLetter:'639e76bdd9fb5873f9957e6dd3e65f23',
      dropDownThree: '50f160b2d57463c6d43c45532ba30170',
      justClick: '73bcd2437359c088d8072d9a492399f0',
      flyIn: '21328d3f9c197970c6b1ca789d716f7e',
      clock: '64eb49c9726649d05a42d953100ab565',
      hurryBeforeTimerStop: '1066034b4c349106ff8b71b8bc9b145e',
      freeTheAlien: 'f182d42308477eafb29548dae9f05abe',
      background: '0acee01692fe06c6e2d5bb8d0d537ea3',
      timeOver: '34e4440ae3b46e22811db31d431cdd38',
      reStart:'f89ce652cb30c473128dc48f494c27ba'
    },
    video: {},
    image: {
      bg: '33d7b897eb96da56ebdf557715af2f2c.jpg',
      spaceShipA: '1d3ea8baeae4233a465382d6ea159f49',
      spaceShipB: '840dd04785237a8678f1628c4117a7d5',
      spaceShipC: '0b482036d46b7b70495a51fff8ea7718',
      spaceShipD: '98c79008d23ef70aaca10e1e2c46c664',
      spaceShipE: '933cc68809709eca379b6f3bc0c66ced',
      allClose: '3eee7d1b9fcb833e1edbd697ae260596',
      ui: '9d56254ca507a64d63fbc04120e78941',
      light: '84f76d9fe3207845223aae41619a524e',
      black: 'd087b0c287563e7bd77d20dabc2538b9',
      star: 'd087b0c287563e7bd77d20dabc2538ba',
      timebg: 'f2286e090dec59e81351f06dfe9cfaeb',
      flashTime:'671bfcd70f080ccaa1eba774e617913b'
    },
    json: {
      countTime: 'f2286e090dec59e81351f06dfe9cfaec',
      pointer: '1315497cd6f6f98f367cbca2aef7f734',
      lightBottom:'92cbbd5c4019f2d67874f25b3f961817',
      lightTop:'cc0044171e4af148191cbe762457a8f8'
    },
    sprite:[
      '96343e6ca9d11b2d737de637de7ef22e',
      '2a6748ec8b7a0ce975af8698e712a10f',
      '4e9dc149ec2efc3a734ecaf30d1804d3',
      '5fb4ec11b6709313ea25026a6a208495',
      '32a85a5047da0ae138cda5094ab26804',
      '41ea2c09f61d98345eed617b4bbb3e66',
      '301d6419895dc674a30a2029d65f99ca',
      '348c67db371e90a8c64ebf495e5ac4a3',
      'a9d32f19020b95529d4838273c9d512a',
      'a404baef8708140927f73bd89dcb868e',
      'c73e4409573d8d8b34ed437ab8ec2042',
      'ce806073bcad0b9f299df35090f96893'
    ]
  };
  let alienArr = [{
    board: '2239558e49a90afdff1b19e3c43afb65',
    alien: '2239558e49a90afdff1b19e3c43afb66',
    width:106,
    height:96,
    y:126
  }, {
    board: '28eebf2313c50bc175a86c7b82989737',
    alien: '28eebf2313c50bc175a86c7b82989738',
    width:95,
    height:103,
    y:86
  }, {
    board: '72c26bdee5072b53a647897a5d217b6c',
    alien: '72c26bdee5072b53a647897a5d217b6d',
    width:101,
    height:105,
    y:198.7
  }, {
    board: '84f0f234e72333e6b527a400cf09a77d',
    alien: '84f0f234e72333e6b527a400cf09a77e',
    width:96,
    height:104,
    y:166
  }, {
    board: '639e76bdd9fb5873f9957e6dd3e65f23',
    alien: '639e76bdd9fb5873f9957e6dd3e65f24',
    width:114,
    height:99,
    y:82
  }, {
    board: '7602340f6d5b412193768a85ccc7f2b6',
    alien: '7602340f6d5b412193768a85ccc7f2b7',
    width:112,
    height:103,
    y:197
  }, {
    board: '70273847dff22f3f599fa59d39692069',
    alien: '70273847dff22f3f599fa59d3969206a',
    width:96,
    height:96,
    y:126
  }, {
    board: 'c36b0a6eda40b568f2e87e48650e3585',
    alien: 'c36b0a6eda40b568f2e87e48650e3586',
    width:118,
    height:107,
    y:166
  }, {
    board: 'd343e887c9cc3e1cfd7a2847e8071426',
    alien: 'd343e887c9cc3e1cfd7a2847e8071427',
    width:101,
    height:105,
    y:93
  }, {
    board: 'd2162819c824710c480fa5bebb3f452a',
    alien: 'd2162819c824710c480fa5bebb3f452b',
    width:106,
    height:106,
    y:134
  }, {
    board: 'e0d8b8da08ad1467cdadcf52ec50e8e4',
    alien: 'e0d8b8da08ad1467cdadcf52ec50e8e5',
    width:132,
    height:103,
    y:72
  }, {
    board: 'ebff8a378b7e0e4ea5182286bcd43f29',
    alien: 'ebff8a378b7e0e4ea5182286bcd43f2a',
    width:116,
    height:101,
    y:86
  }];
  let _caps = [{
    image: '3d769b405cca77ee7e97afb0126ab5e6',
    openJson: '2d9e2076619788bb76fe3c146818c252',
    closeJson: 'b350783848b076d062caa1720790606d',
    x: 0.39,
    y: 0.561,
    c: 2
  }, {
    image: '3dcacffeac23ef1ebd7c80cf1d62411f',
    openJson: 'a77878d6c5b42c9885c810bc0a0d1d74',
    closeJson: '926a30f7608a444af5d4f0d0cf18ed4d',
    x: 0.18,
    y: 0.298,
    c: 4
  }, {
    image: '250a8c0241efe28354ec9ea7279c6401',
    openJson: '02a07e7ffc096c5792527b672f045fa2',
    closeJson: 'd49eea23204e9152f652d38989e7baaa',
    x: 0.342,
    y: 0.346,
    c: 4
  }, {
    image: '303e3cfa19e4e05c6b5e86aeb058ad6b',
    openJson: 'db0591924b6e8dd326eea79ffa2b024f',
    closeJson: 'ec20ae770bf265e448bbe68c3070b127',
    x: 0.626,
    y: 0.185,
    c: 5
  }, {
    image: '2909e284dcaa048a623a488e4fa93065',
    openJson: '5f1fd187fda9bb51677452b61559bf63',
    closeJson: 'ce7c8f8b4ac50741b7a9ecc32dd734ee',
    x: 0.523,
    y: 0.479,
    c: '3加载未成功'
  }, {
    image: 'c2e43541ce1d1299ec9a7ebacba7a47c',
    openJson: 'c5b1e633e781d67f8ea3782eb2df5cd0',
    closeJson: 'ebb5aa19382c1185565504cc52ad8f04',
    x: 0.671,
    y: 0.331,
    c: 4
  }, {
    image: 'c637abeb4c3edf58738ce6e58400b830',
    openJson: 'ff4cbc44dbb201d5357f5acaa1e2036d',
    closeJson: '5c52fd9aff776daff66d6fe2b1b3aaa2',
    x: 0.79,
    y: 0.467,
    c: 3
  }, {
    image: 'ce8c9a82361f9ddf3b08aa00ccefce5d',
    openJson: '6df2184f1f398b19adaa9418205d0eca',
    closeJson: '822f64c884d9ab07ba328bf6d60547df',
    x: 0.795,
    y: 0.227,
    c: 5
  }, {
    image: 'e6981df2ba1ce615d58e49801f08c411',
    openJson: 'a6588362bd9c96bc4842aa1a078d5791',
    closeJson: '18daa6b50d52c4f46540ac45e4c4d1ae',
    x: 0.243,
    y: 0.074,
    c: 5
  }, {
    image: 'e31044edb67f14f1ffcc4afecd2b3ae4',
    openJson: '316e51f90a520ee130c2521cb03851e8',
    closeJson: 'dee06f730dcf035846b734d8351bb880',
    x: 0.207,
    y: 0.446,
    c: 3
  }, {
    image: 'f2d4f456be58c5ec44b0a8d7c5590a1e',
    openJson: '6427dfb0e633143ec9c182b8fe49fdce',
    closeJson: '3b5817fbe1b2008f449e50a79c9a58c5',
    x: 0.439,
    y: 0.101,
    c: 5
  }, {
    image: 'f0800dc5c6ef0c0159924b1c873149aa',
    openJson: 'dee0f8417a7c20558c11731249284f2d',
    closeJson: '9e95601ab0eec1b2da853ed3a0a64cb8',
    x: 0.723,
    y: 0.566,
    c: 2
  }];
  let _symbol = {
    _private: Symbol(),
    _base: Symbol(),
    _alien: Symbol(),
    _caps: Symbol()
  };
  let _image = [];
  let _sound = [];
  let _video = [];
  let _json = [];
  let _jsonFile = [];
  let openJson = [];
  let closeJson = [];
  let spriteImage = [];
  let countImage = function () {
    _image = _image.concat(ReadJsonAsset.concatObject(_base.image));
    _image = _image.concat(ReadJsonAsset.readKeyAssetPushArray(alienArr, ['board', 'alien']));
  };
  let countVideo = function () {
    _video = _video.concat(ReadJsonAsset.concatObject(_base.video));
  };
  let countSound = function () {
    _sound = _sound.concat(ReadJsonAsset.concatObject(_base.sound));
  };
  let countJson = function () {
    _jsonFile = _jsonFile.concat(ReadJsonAsset.readKeyAssetPushArray(_caps, ['closeJson', 'openJson']));
    closeJson = closeJson.concat(ReadJsonAsset.readKeyAssetPushArray(_caps, 'closeJson'));
    openJson = openJson.concat(ReadJsonAsset.readKeyAssetPushArray(_caps, 'openJson'));
    spriteImage = spriteImage.concat(ReadJsonAsset.readKeyAssetPushArray(_caps, 'image'));
    for (let i = 0; i < closeJson.length; i++) {
      let closeObj = {};
      let openObj = {};
      closeObj.name = closeJson[i];
      closeObj.json = closeJson[i] + '.json';
      openObj.image = closeObj.image = spriteImage[i] + '.png';
      openObj.json = openJson[i] + '.json';
      openObj.name = openJson[i];
      _json.push(closeObj);
      _json.push(openObj);
    }
  };

  class AssetJson {
    static get jsonFile() {
      return _jsonFile;
    }

    static get image() {
      return _image;
    }

    static get sound() {
      return _sound;
    }

    static get video() {
      return _video;
    }

    static get json() {
      return _json;
    }

    static get caps() {
      return AssetJson[_symbol._caps];
    }

    static get capsNew() {
      return AssetJson[_symbol._caps];
    }

    static get privateData() {
      return AssetJson[_symbol._private];
    }

    static set privateData(_value) {
      AssetJson[_symbol._private] = _value;
      _sound = _sound.concat(ReadJsonAsset.readKeyAssetPushArray(AssetJson[_symbol._private], 'sound'));
    }

    static get base() {
      return AssetJson[_symbol._base];
    }

    static get alien() {
      return AssetJson[_symbol._alien];
    }
  }

  AssetJson[_symbol._private] = {};
  AssetJson[_symbol._base] = _base;
  AssetJson[_symbol._alien] = alienArr;
  AssetJson[_symbol._caps] = _caps;
  countImage();
  countVideo();
  countSound();
  countJson();
  return AssetJson;
})();
export default AssetJson;