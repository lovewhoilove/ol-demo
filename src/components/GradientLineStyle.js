import Style from 'ol/style/Style';
import { Coordinate } from 'ol/coordinate';
import { LineString } from 'ol/geom';
import { asArray } from 'ol/color';

class GradientLineStyle extends Style {
  constructor(options) {
    options = options || {};
    super();
    this._width = options.width;
    this._color = asArray(options.color);
    this._color2 = asArray(options.color2);

    //https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html#setRenderer
    //https://openlayers.org/en/latest/apidoc/module-ol_style_Style.html#~RenderFunction
    //Custom renderer function. Takes two arguments:
    //  1.The pixel coordinates of the geometry in GeoJSON notation.GeoJSON格式的几何要素的像素坐标。
    //  2.The State of the layer renderer.图层渲染器的状态。
    //上述第2点中的State则包含以下参数： https://openlayers.org/en/latest/apidoc/module-ol_render.html#~State
    // context（CanvasRenderingContext2D）、feature、geometry、pixelRatio、resolution、rotation
    // pixelRatio：可以获取到设备的像素密度和字体缩放比。 https://reactnative.cn/docs/pixelratio、https://developer.mozilla.org/zh-CN/docs/Web/API/Window/devicePixelRatio
    // resolution：https://openlayers.org/en/latest/apidoc/module-ol_source_Raster.RasterSourceEvent.html#resolution
    //  The pixel resolution (map units per pixel).  
    this.setRenderer(this._render.bind(this));
  }

  _render(pixelCoordinates, rendererState) {
    const { context: ctx, pixelRatio } = rendererState;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const sectionCount = coordinates2Distance(...pixelCoordinates) / 2;
    console.log(parseInt(sectionCount));
    const geoms = splitInto(pixelCoordinates, parseInt(sectionCount));
    geoms.forEach((g, idx, arr) => {
      const step = idx / arr.length;
      ctx.strokeStyle = this.getColor(step);
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

  getColor(step) {
    var color = this._color;
    var color2 = this._color2;
    return 'rgba(' +
      +Math.round(color[0] + (color2[0] - color[0]) * step) + ','
      + Math.round(color[1] + (color2[1] - color[1]) * step) + ','
      + Math.round(color[2] + (color2[2] - color[2]) * step) + ','
      + (color[3] + (color2[3] - color[3]) * step)
      + ')';
  }
}

/**
 * 将线段分成一定数量等长的多个线段
 * @param {Array<Coordinate>} geom 
 * @param {*} num  等分的数量
 */
function splitInto(geom, num) {
  const line = new LineString(geom);
  const arr = [];
  for (let i = 1; ; i++) {
    if (i > num) break;
    arr.push(line.getCoordinateAt(i / num));
  }
  arr.unshift(line.getFirstCoordinate());
  arr.push(line.getLastCoordinate());
  return arr;
}

/**
 * 计算两点之间的距离
 * @param {Coordinate} p1 一个点坐标
 * @param {Coordinate} p2 另一个点坐标
 * @return {number} distance 距离
 */
function coordinates2Distance(p1, p2) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

export default GradientLineStyle;