import { Courseware } from '../../framework/core/Courseware';

class FontTest extends Courseware {
  constructor() {
    let preload = () => {
            
    };

    super({}, preload, () => {
      let text = this.add.text(100, 100, 'My name is Brian, you can call me Brian . aaaaaaa',
        { fontSize: '28px', fill: '#fff', font:'Century Gothic', fontWeight:'normal'});
    });
  }
}

export {
  FontTest
};