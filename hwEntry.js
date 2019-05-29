import { Hwtpl601 } from './hw/hwtpl601/hwtpl601'; 
import { Hwtpl605 } from './hw/hwtpl605/hwtpl605'; 
import { Hwtpl606 } from './hw/hwtpl606/hwtpl606'; 
import { Hwtpl607 } from './hw/hwtpl607/hwtpl607'; 

class HwEntry{
  constructor(code, data){
    switch(code.toLocaleLowerCase()){
      case 'hwtpl601':
        new Hwtpl601(data);
        break;
      case 'hwtpl605':
        new Hwtpl605(data);
        break;
      case 'hwtpl606':
        new Hwtpl606(data);
        break;
      case 'hwtpl607':
        new Hwtpl607(data);
        break;

      default:
        break;
    }
  }
}
export{HwEntry};
    