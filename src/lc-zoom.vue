<template>
  <div class="lc-zoom-bar-wrapper" :class="'lc-zoom-' + size" @mousewheel.prevent="onMouseWheel">
    <i class="icon-btn lc-apptrace-plus" @click="onIncrease"/>
    <i class="icon-btn lc-apptrace-minus" @click="onReduce"/>
    <el-slider
      class="zoom-slider"
      v-model="zoom"
      :min="min"
      :max="max"
      :step="step"
      :show-tooltip="false"
      @change="onSliderChange">
    </el-slider>
  </div>
</template>

<script>
export default {
name: "topo-zoom",

emits: ['zoom'],

props: {
  size: {
    type: [String, undefined],
    default: ''
  },

  max: {
    type: Number,
    default: 1.5,

  },

  min: {
    type: Number,
    default: 0.5,

  }
},

data() {
  return {
    zoom: 1,
    step: 0.003,
  };
},

watch:{
  zoom(){
    this.$emit('zoom', this.zoom);
  },
},

methods: {
  setZoom(zoom){
    this.zoom = zoom;
    this.zoom > 1.5 && (this.zoom = 1.5);
    this.zoom < 0.5 && (this.zoom = 0.5);
  },

  onMouseWheel(e) {
    // e.preventDefault();
    let delta = e.deltaY / 3000;
    this.setZoom(this.zoom - delta);
  },

  onIncrease() {
    this.zoom += this.step;
    this.zoom > 1.5 && (this.zoom = 1.5);
  },

  onReduce() {
    this.zoom -= this.step;
    this.zoom < 0.5 && (this.zoom = 0.5);
  },

  onSliderChange(val) {
    // this.$emit("zoom", this.zoom);
  },
},
};
</script>

<style lang="scss">
.lc-zoom-bar-wrapper {
width: 230px;
height: 50px;
position: relative;

.icon-btn {
  position: absolute;
  cursor: pointer;
}

.lc-apptrace-plus {
  top: 0px;
  right: 0px;
}

.lc-apptrace-minus {
  top: 0px;
  left: 0px;
}
.el-slider__button-wrapper {
  top: -14.5px;
  .el-slider__button {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    position: relative;
    background: #B2B2B2;
    border:none;
    &::after {
      content: "";
      display: block;
      width: 6px;
      height: 9px;
      top: 50%;
      left: 50%;
      transform:translate(-50%,-50%);
      border-left:2px solid #fff;
      border-right:2px solid #fff;
      position: absolute;
      box-sizing: border-box;
    }
  }
}

.el-slider__runway {
  height: 12px;
  background: #0099FF;
  border: 2px solid #FFFFFF;
  box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.15), 0px 0px 2px 0px rgba(0, 0, 0, 0.3);
  border-radius: 100px;
}
.el-slider__bar {
  background: #DDDDDD;
  height: 100%;
}

&.lc-zoom-mini {
  width: 200px;

  .icon-btn {
    transform: scale(0.8);
  }

  .el-slider__button-wrapper {
    top: -15.5px;
    .el-slider__button {
      width: 15px;
      height: 15px;
      &::after {
        width: 5px;
        height: 8px;
      }
    }
  }

  .el-slider__runway {
    height: 8px;
    border: 1px solid #FFFFFF;
  }
}
}
</style>