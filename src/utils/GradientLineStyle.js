import Style from 'ol/style/Style';

class GradientLineStyle extends Style {
  constructor(options) {
    options = options || {};
    super();
    this._width = options.width;
    this._color = options.startColor;
    this._color2 = options.endColor;
    this.setRenderer(this._render.bind(this));
  }

  _render(pixelCoordinates, state) {
    const [[x1, y1], [x2, y2]] = pixelCoordinates;
    const { context: ctx } = state;
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, this._color);
    gradient.addColorStop(1, this._color2);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = this._width;
    ctx.lineCap = 'round'; //线的端点为圆弧，默认为butt方形
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

export default GradientLineStyle;