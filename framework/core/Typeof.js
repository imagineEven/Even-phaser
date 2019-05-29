let Typeof = function (_target) {
  let str = Object.prototype.toString.call(_target).toLocaleLowerCase();
  return str.substr(8, str.length - 9);
};
export default Typeof;