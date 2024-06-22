import { Vector as VectorSource } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";
import Feature from "ol/Feature.js";
import { Point } from "ol/geom.js";
import { Style, Icon } from "ol/style.js";

import geoLocation from "@/assets/location.png"; //定位图标

/**
 * 在地图上添加定位图标
 */
export class AddLocation {
  constructor(map, options) {
    this.map_ = map;
    this.options_ = options;
    this.layer_ = null;
    this.source_ = null;
    this.geometry_ = null;
    this.style_ = null;
    this.init();
  }

  init() {
    //添加定位图层
    this.source_ = new VectorSource();
    this.layer_ = new VectorLayer({
      source: this.source_,
      zIndex: 1000,
      properties: {
        name: "geolocation",
      },
    });
    this.map_.addLayer(this.layer_);
    //创建定位图标样式
    this.style_ = new Style({
      image: new Icon({
        src: this.options_?.src ? this.options_.src : geoLocation,
        width: this.options_?.width ? this.options_.width : 32,
        height: this.options_?.height ? this.options_.height : 51,
        anchor: this.options_?.anchor ? this.options_.anchor : [0.5, 75 / 80],
      }),
    });
  }

  /**
   * 添加定位图标
   * @param {Array<number,number>} pos 添加的位置坐标
   * @param {boolean} animate 可选参数，是否将地图移动至添加的位置(用于回显定位)
   */
  add(pos, animate = false) {
    if (this.source_.getFeatures().length === 0) {
      this.geometry_ = new Point(pos);
      const feature = new Feature({
        geometry: this.geometry_,
      });
      feature.setStyle(this.style_);
      this.source_.addFeature(feature);
    } else {
      this.geometry_.setCoordinates(pos);
    }
    if (animate) {
      this.map_.getView().animate({
        center: pos,
        zoom: 16,
      });
    }
  }

  destroy() {
    if (this.source_.getFeatures().length > 0) {
      this.source_clear();
      this.map_.removeLayer(this.layer_);
      this.source_ = null;
      this.geometry_ = null;
      this.style_ = null;
    }
  }
}
