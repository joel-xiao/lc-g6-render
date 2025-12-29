<template>
  <div
    class="lc-g6-custom-tooltip"
    ref="tooltipRef"
    @mouseenter.stop="onEnter"
    @mouseleave.stop="onLeave"
  >
    <div v-show="!!defaultTooltip" class="lc-g6-custom-tooltip-default-container" ref="defaultTooltipRef"></div>
    <template v-if="!defaultTooltip">
      <slot ref="tooltipSlot" name="tooltip" :model="enterModel" :item="enterItem"></slot>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue';
import { getContent } from './compossible/plugins-tooltip.js'

const { proxy } = getCurrentInstance();
const emit = defineEmits(['enter', 'leave', 'hide']);

const props = defineProps({
  style: {
    type: Object,
    default: () => ({})
  },

  options: {
    type: Object,
    default: () => ({})
  },

  elId: {
    type: String,
    default: ''
  },
});
const tooltipHover = ref(false);
const eventLeaveTimeout = ref();
const enterModel = ref();
const enterItem = ref();
function setModel(model, item, event_type) {
  enterModel.value = model;
  enterItem.value = item;
  enterModel.value.eventType = event_type;
  if (event_type?.startsWith('edge:')) {
    enterModel.value.targetExternal = !!item?.getTarget()?.external;
  }
}

const defaultTooltip = ref();
const tooltipRef = ref();
const defaultTooltipRef = ref();
const tooltipSlot = ref();
const showNum = ref(0);

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
  if (!props?.options?.show) return;
  clearTooltip();
  clearTimeout(eventLeaveTimeout.value);
  tooltipRef.value.style.left = data.x + "px";
  tooltipRef.value.style.top = data.y + "px";
  tooltipRef.value.style.opacity = 1;
  await tooltipFormatter();
  tooltipReset(tooltipRef.value);
}

function hide() {
  eventLeaveTimeout.value = setTimeout(() => {
    close();
    emit('hide');
  },  tooltipHover.value ? 0 : 300);
}

function close() {
  // tooltipRef.value && (tooltipRef.value.style.display = "none");
  tooltipRef.value && (tooltipRef.value.style.opacity = "0");
  tooltipHover.value = false;

  if (enterModel.value) {
    delete enterModel.value.eventType;
    delete enterModel.value.targetExternal
  };
  clearTooltip();
}

async function clearTooltip() {
  while(defaultTooltipRef.value?.firstChild) {
    defaultTooltipRef.value.removeChild(defaultTooltipRef.value.firstChild);
  }
  showNum.value = 0;
  defaultTooltip.value = undefined;
}

function closeDefaultTooltip() {
  clearTooltip();
}

async function refresh(id) {
  clearTooltip();
  await tooltipFormatter(true, id);
}

defineExpose({
  setModel,
  show,
  hide,
  close,
  closeDefaultTooltip,
  refresh
});

onMounted(() => {
  onResize('load', tooltipRef.value);
});

onBeforeUnmount(() => {
  onResize('stop', tooltipRef.value);
})

const resizeObserver = ref();
function onResize(type, el) {
  let drawer = el;
  if (type === "load") {
    resizeObserver.value = new ResizeObserver(() => {
      tooltipReset(el);
    });
    resizeObserver.value.observe(drawer);
  } else {
    resizeObserver.value && resizeObserver.value.unobserve(drawer);
  }
}

function tooltipReset(el) {
  nextTick(() => {
    const containerRect = document.body.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const offset = 20;
    let x = rect.x;
    let y = rect.y;
    if (rect.x + rect.width >= containerRect.width) {
      x = containerRect.width - rect.width - (containerRect.width - rect.x) - (enterModel.value.size || 0) - offset;
    }

    if (rect.y + rect.height >= containerRect.height - 20) {
      y = containerRect.height - rect.height - 20;
    }

    if (y < 40) y = 40;
    
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  })
}

async function tooltipFormatter(refresh = false, id = '') {
  !id && (id = enterModel.value.target);
  const tooltip = await getContent(enterModel.value, props.options, enterItem.value, refresh, id);
  if (tooltip && showNum.value === 0) {
    showNum.value++;
    defaultTooltip.value = tooltip;
    defaultTooltipRef.value.appendChild(tooltip);
  }
  
}
</script>

<style lang="scss">
  .lc-g6-custom-tooltip {
    position: fixed;
    // display: none;
    opacity: 0;
    z-index: 10;

    .lc-g6-custom-tooltip-default {
      min-width: 130px;
      border-style: solid; 
      border-radius: 4px; 
      overflow: hidden;
      color: rgb(255, 255, 255); 
      white-space: normal; 
      pointer-events: none; 
      user-select: none; 
      font-size: 12px;
    }
  }
</style>
