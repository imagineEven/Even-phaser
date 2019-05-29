import { Options } from './../core/Options';
import $ from 'jquery';

let IlabUtil = {};

IlabUtil.createQuestionBtn = (detail) => {
  let img = document.createElement('img');
  img.src = Options.baseUrl + Options.pathImage + '/icon_problem.png';
  $(img).css({
    'position': 'fixed',
    'top': '10px',
    'left': '10px',
    'z-index': 20
  });
  document.body.appendChild(img);
  img.onclick = function(e) {
    if (e.target.textDiv) {
      $(e.target.textDiv).remove();
      e.target.textDiv = null;
    } else {
      let div = document.createElement('div');
      div.classList = 'questionDiv questionInfo';
      div.innerHTML = unescape(detail);
      document.body.appendChild(div);
      e.target.textDiv = div;
      div.onclick = function() {
        $(e.target.textDiv).remove();
        e.target.textDiv = null;
      };
    }
  };
};

export {
  IlabUtil
};