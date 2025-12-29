<template>
  <div
    class="lc-g6-custom-text-tooltip"
    :class="isWindows() ? 'lc-g6-custom-text-tooltip-windows' : ''"
    ref="tooltipRef"
    @mouseenter.stop="onEnter"
    @mouseleave.stop="onLeave"
  >
  {{ text }}
  </div>
</template>

<script setup>
import { ref, computed, nextTick, getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance();
const emit = defineEmits(['enter', 'leave', 'hide']);

const props = defineProps({
  style: {
    type: Object,
    default: () => ({})
  },
});

const tooltipHover = ref(false);
const eventLeaveTimeout = ref();
const text = ref();
function setModel(string_text, event_type) {
  text.value = string_text;
}

const tooltipRef = ref();

function onEnter() {
  clearTimeout(eventLeaveTimeout.value);
  tooltipHover.value = true;
  emit('enter');
}

function onLeave() {
  hide();
  emit('leave');
}

async function show(data) {
  if (!text.value) return;

  clearTimeout(eventLeaveTimeout.value);
  tooltipHover.value = false;
  tooltipRef.value.style.left = data.x + "px";
  tooltipRef.value.style.top = data.y + "px";
  tooltipRef.value.style.display = 'block';
}

function hide() {
  eventLeaveTimeout.value = setTimeout(() => {
    close();
    emit('hide');
  },  tooltipHover.value ? 0 : 300);
}

function close() {
  tooltipRef.value && (tooltipRef.value.style.display = "none");
}

function isWindows() {
  return window.navigator.platform.indexOf('Win') !== -1;
}

defineExpose({
  setModel,
  show,
  hide,
  close,
});


</script>

<style lang="scss">
  .lc-g6-custom-text-tooltip {
    position: fixed;
    opacity: 1;
    z-index: 10;
    color: rgb(255, 255, 255); 
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 1px;
    border: 1px solid #fff;
    padding: 2px 4px;
    font-size: 12px;
    line-height: 12px;
    display: none;
  
    &.lc-g6-custom-text-tooltip-windows {
      background-color: #fff;
      border: 1px solid #333;
      color: #333;
    }
  }
</style>
