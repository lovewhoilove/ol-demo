<template>
  <div class="one-map">
    <MapView />
  </div>
</template>

<script>
import MapView from '@/components/MapView.vue';

export default {
  name: "OneMap",
  components: {
    MapView,
  },
}
</script>

<style lang="scss" scoped>
.one-map {
  height: 100%;
}
</style>
