<template>
  <div class="demo-wrapper">
    <div class="nav-bar">
      <div class="nav-title">
        <h1>LcG6 拓扑图组件演示</h1>
      </div>
      <div class="nav-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.id"
          class="nav-item" 
          :class="{ active: currentTab === tab.id }"
          @click="currentTab = tab.id"
        >
          <span class="nav-icon" v-if="tab.icon">{{ tab.icon }}</span>
          <span class="nav-label">{{ tab.label }}</span>
          <span class="nav-desc" v-if="tab.desc">{{ tab.desc }}</span>
        </div>
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
import DemoApp from './src/examples/demo-app-topo.vue'
import DemoFeatures from './src/examples/demo-features.vue'

const currentTab = ref('features')

const tabs = [
  { 
    id: 'features', 
    label: '功能展示', 
    desc: 'Features',
    icon: '🎨',
    description: '展示 G6 组件的各种功能特性：节点类型、状态、图标、组合、布局等'
  },
  { 
    id: 'original', 
    label: '系统拓扑', 
    desc: 'System Topology',
    icon: '🌐',
    description: '系统级别的拓扑图演示，展示系统间的调用关系和展开下一层功能'
  },
  { 
    id: 'app', 
    label: '应用拓扑', 
    desc: 'Application Topology',
    icon: '📱',
    description: '应用级别的拓扑图演示，包含组（Combo）功能、节点点击交互和动态边创建'
  }
]

const currentComponent = computed(() => {
  switch (currentTab.value) {
    case 'features': return DemoFeatures
    case 'original': return DemoOriginal
    case 'app': return DemoApp
    default: return DemoFeatures
  }
})
</script>

<style scoped>
.demo-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.nav-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.nav-title {
  padding: 12px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-title h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.nav-tabs {
  display: flex;
  padding: 0 20px;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  position: relative;
  white-space: nowrap;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  border-bottom-color: #fff;
  font-weight: 600;
}

.nav-icon {
  font-size: 18px;
  line-height: 1;
}

.nav-label {
  font-size: 15px;
}

.nav-desc {
  font-size: 12px;
  opacity: 0.7;
  font-weight: normal;
}

.nav-item.active .nav-desc {
  opacity: 0.9;
}

.demo-view {
  flex: 1;
  overflow: hidden;
  background: #f5f5f5;
}
</style>
