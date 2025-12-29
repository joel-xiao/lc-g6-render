<template>
  <div class="lc-g6-loading-mask" ref="maskRef">
    <div class="lc-g6-loading" ref="loadingRef">
      <LcLoadingIcon/>
    </div>
    <div class="lc-g6-no—data" ref="textRef">
      {{ text }}
    </div>
  </div>
</template>

<script setup>
import LcLoadingIcon from "./lc-loading-icon.vue";
import { ref } from 'vue';

const loadingRef = ref();
const textRef = ref();
const maskRef = ref();

function show(pos) {
  maskRef.value.style.display = 'block';
  maskRef.value.style.background = 'transparent';
  loadingRef.value.style.display = 'block';
  loadingRef.value.style.left = pos.x + 'px';
  loadingRef.value.style.top = pos.y + 'px';
  textRef.value.style.left = pos.x + 'px';
  textRef.value.style.top = pos.y + 'px';
}

function hide() {
  maskRef.value.style.display = 'none';
  loadingRef.value.style.display = 'none';
}

const text = ref();
function showText(option, cb) {
  text.value = option?.text;
  maskRef.value.style.display = 'block';
  maskRef.value.style.background = 'transparent';
  textRef.value.style.display = 'block';
  textRef.value.style.backgroundColor = '#D0EAFF';
  setTimeout(() => {
    maskRef.value.style.display = 'none';
    textRef.value.style.display = 'none';
    cb?.();
  }, option.timer || 3000);
}

defineExpose({
  show,
  showText,
  hide,
});

</script>

<style lang="scss">
@keyframes expandAnimation {
  0% {
    clip-path: circle(0% at 50% 50%);
  }
  25% {
    clip-path: circle(100% at 50% 50%);
  }

  75% {
    clip-path: circle(100% at 50% 50%);
  }
  100% {
    clip-path: circle(0% at 50% 50%);
  }
}
.lc-g6-loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: none;
  background-color: rgba(0,0,0,0.1);
  z-index: 2;

  .lc-g6-loading {
    position: absolute;
    display: none;
    transform: scale(0.5) translate(-50%, -50%);
    text-align: center;
  }

  .lc-g6-no—data {
    position: absolute;
    font-size: 12px;
    line-height: 12px;
    color: #0099FF;
    transform: translate(calc(-50% + 8px));
    clip-path: circle(0% at 50% 50%);
    // background-color: #D0EAFF;
    background-color: transparent;
    width: 64px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border-radius: 10px;
    animation: expandAnimation 3s forwards;
  }
}
</style>