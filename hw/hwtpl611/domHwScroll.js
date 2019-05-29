
import $ from 'jquery';
class DomHwScroll{
  constructor(id, style){
    this.id = id;
    this.style = style;
    this.timer = null;
    this.box = this.createDom(id);
    this.initEvents();
    this.addScrollStyle();
  }

  createDom(id){
    return $(`<div id=${id}></div>`).css(this.style).appendTo($('body'));
  }

  initEvents(){
    this.box.on('scroll', ()=>{
      this.addRules(0.2);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.addRules(0.1);
      }, 300);
    });
  }

  addRules(alpha){
    let allSheet = document.styleSheets;
    let len = allSheet[allSheet.length - 1].cssRules.length;
    if(!this.id) return;
    if(alpha === 0.2){
      if(!this.scrollShow){
        allSheet[allSheet.length - 1].insertRule('#' + this.id + '::-webkit-scrollbar-thumb { width: 6px; border-radius: 4px; background-color: rgba(0,0,0, ' + alpha + '); }', len);
        this.scrollShow = true;
      }
    }else{
      allSheet[allSheet.length - 1].deleteRule(len-1);
      this.scrollShow = false;
    }
  }

  addScrollStyle() {
    if(!document.styleSheets.length){
      let head = document.head || document.getElementsByTagName('head')[0];
      let style = document.createElement('style');
      style.type = 'text/css';
      head.appendChild(style);
    }
    let allSheet = document.styleSheets;
    allSheet[allSheet.length - 1].insertRule('::-webkit-scrollbar { width: 6px; height: 16px; background-color: #F4EBE5); }', 1);
    allSheet[allSheet.length - 1].insertRule('::-webkit-scrollbar-track { margin: 20px 0; width: 6px; border-radius: 4px; background-color: rgba(224,224,224, 0); }', 2);
    allSheet[allSheet.length - 1].insertRule('::-webkit-scrollbar-thumb { width: 6px; border-radius: 4px; background-color: rgba(0,0,0, 0.1); }', 3);
  }
}

export {
  DomHwScroll
};