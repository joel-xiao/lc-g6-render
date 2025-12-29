<template>
<span class="lc-loading-icon">
  <i class="spin-dot-item"></i>
  <i class="spin-dot-item"></i>
  <i class="spin-dot-item"></i>
  <i class="spin-dot-item"></i>
</span>
</template>

<style lang="scss">
.lc-loading-icon {
  position: relative;
  display: inline-block;
  font-size: 20px;
  width: 1em;
  height: 1em;
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
  -webkit-animation: antRotate 1.2s infinite linear;
  animation: antRotate 1.2s infinite linear;
  font-size: 32px;

  .spin-dot-item {
    position: absolute;
    display: block;
    background-color: #1890ff;
    border-radius: 100%;
    -webkit-transform: scale(0.75);
    transform: scale(0.75);
    -webkit-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
    opacity: 0.3;
    -webkit-animation: antSpinMove 1s infinite linear alternate;
    animation: antSpinMove 1s infinite linear alternate;

    width: 14px;
    height: 14px;

    &:nth-child(1) {
      top: 0;
      left: 0;
    }
    &:nth-child(2) {
      top: 0;
      right: 0;
      opacity: 0.5;
      -webkit-animation-delay: 0.4s;
      animation-delay: 0.4s;
    }
    &:nth-child(3) {
      right: 0;
      bottom: 0;
      opacity: 0.7;
      -webkit-animation-delay: 0.8s;
      animation-delay: 0.8s;
    }
    &:nth-child(4) {
      bottom: 0;
      left: 0;
      opacity: 1;
      -webkit-animation-delay: 1.2s;
      animation-delay: 1.2s;
    }
  }

  @-webkit-keyframes antRotate {
  to {
    -webkit-transform: rotate(405deg);
    transform: rotate(405deg);
    }
  }

  @keyframes antRotate {
    to {
      -webkit-transform: rotate(405deg);
      transform: rotate(405deg);
    }
  }
  @-webkit-keyframes antRotateRtl {
    to {
      -webkit-transform: rotate(-405deg);
      transform: rotate(-405deg);
    }
  }
  @keyframes antRotateRtl {
    to {
      -webkit-transform: rotate(-405deg);
      transform: rotate(-405deg);
    }
  }
}
</style>