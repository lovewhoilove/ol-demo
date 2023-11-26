<template>
  <div class="map" ref="map"></div>
</template>

<script>
import MVT from 'ol/format/MVT.js';
import Map from 'ol/Map.js';
import TileGrid from 'ol/tilegrid/TileGrid.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import View from 'ol/View.js';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style.js';
import { get as getProjection, fromLonLat } from 'ol/proj.js';

export default {
  name: 'MapboxMap',
  mounted() {
    this.createMap();
  },
  methods: {
    createMap() {
      const resolutions = []
      for (let i = 0; i <= 8; ++i) {
        resolutions.push(156543.03392804097 / Math.pow(2, i * 2));
      }
      const map = new Map({
        layers: [
          new VectorTileLayer({
            source: new VectorTileSource({
              attributions:
                '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
                '© <a href="https://www.openstreetmap.org/copyright">' +
                'OpenStreetMap contributors</a>',
              format: new MVT(),
              tileGrid: new TileGrid({
                extent: getProjection('EPSG:3857').getExtent(),
                resolutions,
                tileSize: 512,
              }),
              tileUrlFunction: this.tileUrlFunction,
            }),
            style: window.createMapboxStreetsV6Style(Style, Fill, Stroke, Icon, Text),
          }),
        ],
        target: this.$refs.map,
        view: new View({
          center: fromLonLat([113.64, 34.72]),
          zoom: 10,
        }),
      });
    },
    tileUrlFunction(tileCoord) {
      const key =
        'pk.eyJ1IjoibG92ZXdob2lsb3ZlIiwiYSI6ImNscGV2bjhkZTFmamQya282Yzd0Zm1wazEifQ._J3OPz8jxEimR-uLcLpuug';
      return (
        'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
        '{z}/{x}/{y}.vector.pbf?access_token=' +
        key
      )
        .replace('{z}', String(tileCoord[0] * 2 - 1))
        .replace('{x}', String(tileCoord[1]))
        .replace('{y}', String(tileCoord[2]))
        .replace(
          '{a-d}',
          'abcd'.substr(((tileCoord[1] << tileCoord[0]) + tileCoord[2]) % 4, 1)
        );
    },
  },
}
</script>

<style lang="scss">
.map {
  height: 100%;
}
</style>