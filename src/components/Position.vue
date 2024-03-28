<template>
  <div class="position">
    <span class="menu-item" @click="handlePosition">
      <i :class="watchId && heading !== null ?
      ['cwGis', 'cwGis-zhaoxiang'] : ['cwGis', 'cwGis-position']"></i>
    </span>
  </div>
</template>

<script>
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { circular } from 'ol/geom/Polygon';
import kompas from 'kompas';
import { Fill, Icon, Style } from 'ol/style';

export default {
  name: 'Position',
  inject: ["getMap"],
  data() {
    this.positionSource = null;
    this.style = null;
    return {
      watchId: null,
      heading: null,
    };
  },
  computed: {
    map() {
      return this.getMap();
    },
  },
  mounted() {
    this.init();

  },
  methods: {
    init() {
      this.positionSource = new VectorSource();
      this.style = new Style({
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.2)',
        }),
        image: new Icon({
          src: require('@/assets/location-heading.svg'),
          imgSize: [27, 55],
          rotateWithView: true,
        }),
      });
      const positionLayer = new VectorLayer({
        source: this.positionSource,
        style: this.style
      });
      this.map.addLayer(positionLayer);
    },
    handlePosition() {
      if (this.watchId) {
        this.$message.info('取消定位！')
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
        this.heading = null;
        this.positionSource.clear(true);
        return false;
      } else {
        this.$emit('handleLoading', true);
        let coords = [];
        this.watchId = navigator.geolocation.watchPosition(
          pos => {
            this.$emit('handleLoading', false);
            if (!coords.length) this.$message.success('定位成功!');
            coords = [pos.coords.longitude, pos.coords.latitude];
            const accuracy = circular(coords, pos.coords.accuracy);
            this.positionSource.clear(true);
            if (coords.length || accuracy) {
              this.positionSource.addFeatures([
                new Feature(accuracy),
                new Feature(new Point(coords)),
              ]);
            }
            if (!this.positionSource.isEmpty()) {
              this.map.getView().fit(this.positionSource.getExtent(), {
                maxZoom: 18,
                duration: 500,
                callback: () => {
                  if (
                    window.DeviceOrientationEvent &&
                    typeof window.DeviceOrientationEvent.requestPermission === 'function'
                  ) {
                    window.DeviceOrientationEvent.requestPermission()
                      .then(() => {
                        this.startCompass(coords);
                      })
                      .catch(error => {
                        this.$message.error(`ERROR: ${error.message}`);
                      });
                  } else if ('ondeviceorientationabsolute' in window) {
                    this.startCompass(coords);
                  } else {
                    this.$message.error('当前设备没有提供设备方向！');
                  }
                }
              });
            }
          },
          error => {
            this.$emit('handleLoading', false);
            this.$message.error(`定位失败，ERROR: ${error.message}`);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,//超时
            maximumAge: 0,//缓存时长，为0时表示设备不能使用缓存位置，该选项默认值就是0
          }
        );
      }
    },
    startCompass() {
      kompas()
        .watch()
        .on('heading', heading => {
          this.heading = heading;
          this.style.getImage().setRotation((Math.PI / 180) * heading);
        });
    },
  },
}
</script>

<style lang="scss" scoped>
.position {
  position: absolute;
  bottom: 50px;
  right: 10px;
  z-index: 9;

  span.menu-item {
    position: relative;
    display: inline-block;
    width: 42px;
    height: 42px;
    border-radius: 4px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);

    i {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 30px;
    }
  }
}
</style>
