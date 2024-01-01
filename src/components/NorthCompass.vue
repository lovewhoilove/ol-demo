<template>
  <div class="wrap">
    <div ref="compass" class="compass"></div>
  </div>
</template>

<script>
import { Rotate } from 'ol/control';

export default {
  name: 'NorthCompass',
  inject: ["getMap"],
  computed: {
    map() {
      return this.getMap();
    },
  },
  data() {
    return {};
  },
  mounted() {
    const rotateControl = new Rotate({
      label: this.createCompassSymbol(),
      tipLabel: '指北针',
      autoHide: false,
      target: this.$refs.compass
    });
    this.map.addControl(rotateControl);
  },
  methods: {
    createCompassSymbol(width, color) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext("2d");
      let s = canvas.width = canvas.height = width || 72;
      let r = s / 2;

      ctx.translate(r, r);
      ctx.fillStyle = color || '#333';
      ctx.lineWidth = 4;
      ctx.lineJoin = ctx.lineCap = 'round';

      ctx.font = 'bold ' + (r * 0.4) + 'px sans-serif';
      ctx.textBaseline = 'bottom';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#fff';
      ctx.globalAlpha = .75;
      ctx.strokeText('N', 0, -r / 2 - 2);
      ctx.globalAlpha = 1;
      ctx.fillText('N', 0, -r / 2 - 2);
      ctx.beginPath();
      ctx.moveTo(0, r / 4);
      ctx.lineTo(r / 3, r / 2);
      ctx.lineTo(0, -r / 2);
      ctx.lineTo(-r / 3, r / 2);
      ctx.lineTo(0, r / 4);
      ctx.lineWidth = 8;
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = .75;
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = ctx.strokeStyle = color || '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, r / 4);
      ctx.lineTo(0, -r / 2);
      ctx.lineTo(r / 3, r / 2);
      ctx.lineTo(0, r / 4);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, r / 4);
      ctx.lineTo(0, -r / 2);
      ctx.lineTo(-r / 3, r / 2);
      ctx.lineTo(0, r / 4);
      ctx.stroke();

      return canvas;
    },
  }
}
</script>

<style lang="scss" scoped>
.compass {
  position: absolute;
  left: 8px;
  top: 8px;
}

::v-deep .ol-control {
  position: static;
  background-color: transparent;
  border: none;

  button {
    display: block;
    margin: 0px;
    padding: 0;
    font-weight: normal;
    text-decoration: none;
    font-size: inherit;
    text-align: center;
    height: none;
    width: auto;
    background-color: transparent;
    border: none;
    cursor: pointer;

    &::-moz-focus-inner {
      border: none;
      padding: 0;
    }

    &:hover,
    &:focus {
      text-decoration: none;
      outline: none;
    }

  }
}
</style>
