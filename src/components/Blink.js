import { Vector as VectorSource } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";
import Feature from "ol/Feature.js";
import { Point, LineString } from "ol/geom.js";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style.js";
import { boundingExtent } from "ol/extent";

/**
 * 闪烁动画
 */
export class BlinkAnimation {
  constructor(map, options) {
    this.map_ = map;
    this.options_ = options;
    this.source_ = null;
    this.style_ = null;
    this.interval_ = null;
    this.init();
  }

  init() {
    this.source_ = new VectorSource();
    this.map_.addLayer(
      new VectorLayer({
        source: this.source_,
        zIndex: 999,
        properties: {
          name: "blink",
        },
      })
    );
    const color = this.options_?.color ? this.options_.color : "#009933";
    this.style_ = new Style({
      image: new CircleStyle({
        radius: 9,
        fill: new Fill({
          color,
        }),
      }),
      stroke: new Stroke({
        color,
        width: 9,
      }),
    });
  }

  add(geomType, coors, id, isZoomTo = false) {
    this.clearSource();
    let geometry = null;
    if (geomType === "point") {
      geometry = new Point(coors);
    } else {
      geometry = new LineString(coors);
    }
    if (geometry) {
      const feature = new Feature({ geometry });
      feature.setStyle(this.style_);
      feature.setId(id);
      this.source_.addFeature(feature);

      if (isZoomTo) {
        if (geomType === "point") {
          this.map_.getView().animate({ center: coors }); //animate方法duration默认为1000
        } else {
          this.map_.getView().fit(boundingExtent(coors), {
            padding: [150, 150, 340, 150],
            duration: 1000,
          });
        }
      }
    }
  }

  blink(geomType) {
    const feature = this.source_.getFeatures()[0];
    const color = this.options_?.color ? this.options_.color : "#009933";
    let flag = true;
    this.clearBlinkInterval();
    const style = feature.getStyle();
    const styleOpt =
      geomType === "point" ? style.getImage() : style.getStroke();
    this.interval_ = setInterval(() => {
      flag = !flag;
      if (flag) {
        geomType === "point"
          ? styleOpt.setOpacity(1)
          : styleOpt.setColor(color);
      } else {
        geomType === "point"
          ? styleOpt.setOpacity(0)
          : styleOpt.setColor(color + "00");
      }
      // this.source_.changed();
      feature.changed();
    }, 300);
  }

  clearSource() {
    if (this.source_.getFeatures().length > 0) {
      this.source_.clear(true);
    }
  }

  clearBlinkInterval() {
    if (this.interval_) {
      clearInterval(this.interval_);
    }
  }

  clear() {
    this.clearSource();
    this.clearBlinkInterval();
  }

  removeBlinkById(id) {
    if (!id) return;
    if (this.source_.getFeatureById(id)) {
      this.clear();
    }
  }

  destroy() {
    this.clear();
  }
}
