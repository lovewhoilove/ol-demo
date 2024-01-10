import Style from 'ol/style/Style';
import { Coordinate } from 'ol/coordinate';
import { LineString } from 'ol/geom';
import { asArray } from 'ol/color';


/**
 * 将线段分成一定数量等长的多个线段
 * @param {Array<Coordinate>} geom 
 * @param {*} num  等分的数量
 */
function splitNEqualParts(geom, num) {
  const line = new LineString(geom);
  const arr = [];
  for (let i = 1; i < num; i++) {
    arr.push(line.getCoordinateAt(i / num));
  }
  arr.unshift(line.getFirstCoordinate());
  arr.push(line.getLastCoordinate());
  return arr;
}

/**
 * 获取某一比例处的颜色值
 * @param {*} c1 起始颜色
 * @param {*} c2 终止颜色
 * @param {*} fraction 0到1之间的数字，其中0是线串的开始，1是结束。
 * @return {String} 颜色字符串
 */
function getFractionColor(c1, c2, fraction) {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * fraction);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * fraction);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * fraction);
  const a = c1[3] + (c2[3] - c1[3]) * fraction;
  return `rgba(${r},${g},${b},${a})`;
}

class GradientLineStyle extends Style {
  constructor(options) {
    options = options || {};
    super();
    this._width = options.width;
    this._color = asArray(options.color);
    this._color2 = asArray(options.color2);
    this.setRenderer(this._render.bind(this));
  }

  _render(pixelCoordinates, state) {
    const { context: ctx, pixelRatio } = state;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const geoms = splitNEqualParts(pixelCoordinates, 256);
    geoms.forEach((g, idx, arr) => {
      const fraction = idx / arr.length;
      ctx.strokeStyle = getFractionColor(this._color, this._color2, fraction);
      ctx.lineWidth = this._width * pixelRatio;
      if (idx < (arr.length - 1)) {
        ctx.beginPath();
        ctx.moveTo(...g);
        ctx.lineTo(...arr[idx + 1]);
        ctx.stroke();
      }
    });
    ctx.restore();
  }
}

export default GradientLineStyle;