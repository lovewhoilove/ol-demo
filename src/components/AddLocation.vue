<template>
  <div></div>
</template>

<script>
import { unByKey } from "ol/Observable";
import { AddLocation } from "./location.js";

export default {
  name: "AddLocation",
  inject: ["getMap"],
  computed: {
    map() {
      return this.getMap();
    },
  },
  data() {
    this.addLocation = null;
    this.mapClickEvtKey = null;
    return {};
  },
  mounted() {
    this.addLocation = new AddLocation(this.map);
    this.map.on("singleclick", (evt) => {
      const { coordinate } = evt;
      this.addLocation.add(coordinate);
    });
  },
  beforeDestroy() {
    if (this.mapClickEvtKey) {
      unByKey(this.mapClickEvtKey);
    }
    this.addLocation.destroy();
  },
};
</script>
