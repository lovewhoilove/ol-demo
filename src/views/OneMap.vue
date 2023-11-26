<template>
  <div class="one-map">
    <!-- <MapView /> -->
    <MapboxMap />
  </div>
</template>

<script>
// import MapView from '@/components/MapView.vue';
import MapboxMap from '@/components/MapboxMap';

export default {
  name: "OneMap",
  components: {
    // MapView,
    MapboxMap,
  },
}
</script>

<style lang="scss" scoped>
.one-map {
  height: 100%;
}
</style>
