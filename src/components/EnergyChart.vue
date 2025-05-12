<template>
  <div ref="chartEl" :style="{ width, height }"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  options: {
    type: Object,
    required: true
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '400px'
  }
})

const chartEl = ref(null)
let chartInstance = null

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  if (chartInstance) {
    chartInstance.dispose()
  }
})

watch(() => props.options, (newOptions) => {
  if (chartInstance) {
    chartInstance.setOption(newOptions)
  }
}, { deep: true })

function initChart() {
  if (!chartEl.value) return
  chartInstance = echarts.init(chartEl.value)
  chartInstance.setOption(props.options)
}

function resizeChart() {
  if (chartInstance) {
    chartInstance.resize()
  }
}
</script>