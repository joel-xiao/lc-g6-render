<template>
  <div class="lc-g6-legend">
    <div class="g6-legend-item" :style="{ '--prefix-fill': item.stroke }" :class="{ active: item.check }"
      @click="onItemCheck(item)" v-for="item in items">{{ item.label }}</div>
    <div v-show="disabled" class="g6-legend-disabled"></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { getHealthSetting } from './compossible/utils/health'
const emit = defineEmits(['item-check']);

const items = ref([]);
const disabled = ref(false);


onMounted(() => {
  const healthSetting = getHealthSetting('_all');
  Object.keys(healthSetting).forEach(key => {
    if (healthSetting[key].legend !== false) {
      items.value.push({
        statusType: key,
        ...healthSetting[key],
      });
    }
  });
});

function onItemCheck(item) {
  if (disabled.value) return;

  item.check = !item.check;
  emit('item-check', item);
}

function getItems() {
  return items.value;
}

function clearChecks() {
  items.value.forEach( item => {
    item.check = false;
  })
}


function setDisabled(is) {
  disabled.value = !!is;
}

defineExpose({
  getItems,
  clearChecks,
  setDisabled,
})

</script>

<style lang="scss">
.lc-g6-legend {
  display: flex;
  flex-wrap: wrap;
  position: absolute;
  right: 20px;
  bottom: 64px;
  border-radius: 3px;
  box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.10), 0px 1px 5px 0px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  padding: 6px 0px;
  width: 82px;
  box-sizing: border-box;
  font-size: 12px;
  user-select:none;
  overflow: hidden;

  .g6-legend-disabled {
    background-color: #000;
    opacity: 0.05;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    cursor: not-allowed;
  }

  .g6-legend-item {
    padding: 0px 20px 0px 36px;
    width: 100%;
    height: 32px;
    position: relative;
    line-height: 32px;
    cursor: pointer;

    &::before {
      display: block;
      content: ' ';
      width: 10px;
      height: 10px;
      border-radius: 50%;
      position: absolute;
      left: 20px;
      bottom: 50%;
      transform: translateY(50%);
      background: var(--prefix-fill);
    }

    &:hover {
      background-color: #E2F4FF;
    }

    &.active {
      color: #09f;
    }
  }

}
</style>