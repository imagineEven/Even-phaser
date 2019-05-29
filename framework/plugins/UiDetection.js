class UiDetection {


  static isCoordinateInPoly(x, y, poly) {
    let polyArr = UiDetection.numArrToXYArr(poly);
    let polyX = polyArr[0];
    let polyY = polyArr[1];
    let j = polyX.length - 1;
    let oddNodes = false;
    for (let i = 0; i < polyX.length; i++) {
      if ((polyY[i] < y && polyY[j] >= y ||
          polyY[j] < y && polyY[i] >= y) &&
        (polyX[i] <= x || polyX[j] <= x)) {
        oddNodes ^= (polyX[i] + (y - polyY[i]) / (polyY[j] - polyY[i]) * (polyX[j] - polyX[i]) < x);
      }
      j = i;
    }
    return oddNodes;
  }

  static numArrToXYArr(arr) {
    let xArr = [];
    let yArr = [];
    for (let i = 0; i < arr.length; i += 2) {
      let x = arr[i];
      let y = arr[i + 1];
      xArr.push(x);
      yArr.push(y);
    }
    return [xArr, yArr];
  }
}

export {
  UiDetection
};