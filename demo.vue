<template>
  <div class="demo-wrapper">
    <div class="nav-bar">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        class="nav-item" 
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        {{ tab.label }}
      </div>
    </div>
    
    <div class="demo-view">
      <component :is="currentComponent"></component>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DemoOriginal from './src/examples/demo-original.vue'
import DemoSystem from './src/examples/demo-system-topo.vue'
import DemoApp from './src/examples/demo-app-topo.vue'
import DemoBusiness from './src/examples/demo-business-topo.vue'

import DemoFeatures from './src/examples/demo-features.vue'

const currentTab = ref('features')

const tabs = [
  { id: 'features', label: '功能展示 (Features)', new: true },
  { id: 'original', label: 'Original Demo (System)' },
  { id: 'system', label: 'System Topo' },
  { id: 'app', label: 'Application Topo' },
  { id: 'business', label: 'Business Topo' }
]

const currentComponent = computed(() => {
  switch (currentTab.value) {
    case 'features': return DemoFeatures
    case 'original': return DemoOriginal
    case 'system': return DemoSystem
    case 'app': return DemoApp
    case 'business': return DemoBusiness
    default: return DemoOriginal
  }
})
</script>

<style scoped>
.demo-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  background: #333;
  padding: 0 20px;
}

.nav-item {
  padding: 15px 20px;
  color: #aaa;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.nav-item:hover {
  color: #fff;
}

.nav-item.active {
  color: #fff;
  background: #1890ff;
}

.demo-view {
  flex: 1;
  overflow: hidden;
}
</style>
