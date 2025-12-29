<template>
  <div class="lc-g6-swapper">
    <div class="label"> 展示切换</div>
    <div class="lc-g6-btns">
      <div class="btn" v-for="item in btns" :class="current?.value === item.value ? 'active' : ''" @click="onClick(item)"> {{ item.label }}</div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
const emits = defineEmits(['select']);
const btns = reactive([
  {label:'流程图', value: undefined},
  {label:'网格布局', value: 'grid'},
  {label:'random', value: 'random'}
]);

const current = ref();
onMounted(() => {
  onClick(btns[0]);
});

function onClick(item) {
  current.value = item;

  emits('select', current.value);
}

</script>

<style lang="scss">
.lc-g6-swapper {
  display: flex;
  align-items: center;
  font-size: 12px;
  width: 130px;
  height: 24px;
  position: absolute;
  right: 20px;
  bottom: 60px;

  .label {
    padding-right: 10px;
  }

  .lc-g6-btns {
    display: flex;
    align-items: center;
    border-radius: 2px;
    box-shadow: 1px 1px 5px 1px #00000030;
    overflow: hidden;
    width: 72px;
    height: 24px;

    .btn {
      width: 24px;
      height: 100%;
      background-color: #fff;
      box-sizing: border-box;
      border-right: 1px solid black;

      &:last-of-type {
        border-right: none;
      }

      &.active {
        background: #09f;
        color: #fff;
      }
    }
  }
}
</style>