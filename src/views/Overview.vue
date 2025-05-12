<template>
  <div class="overview">
    <h2>能耗总览</h2>
    
    <div v-if="loading" class="loading-state">
      <LoadingSpinner :loading="true"/>
    </div>
    
    <div v-else>
      <div class="building-list">
        <div 
          v-for="building in buildings" 
          :key="building.id"
          class="building-card"
          @click="goToDetail(building.id)"
        >
          <h3>{{ building.name }}</h3>
          <p>建筑面积: {{ building.area }}㎡</p>
          <p>楼层数: {{ building.floors }}</p>
        </div>
      </div>
      
      <div class="chart-container">
        <template v-if="hasEnergyData">
          <EnergyChart 
            :options="energyOptions" 
            height="500px"
          />
        </template>
        <div v-else class="empty-data">
          <p>暂无能耗数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getBuildings, getEnergyData } from '@/utils/api'
import EnergyChart from '@/components/EnergyChart.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const buildings = ref([])
const loading = ref(false)

// 初始化带默认值的图表配置
const energyOptions = ref({
  title: { text: '全校月度能耗趋势' },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  legend: {
    data: ['用电量(kWh)', '用水量(吨)']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: [
    {
      type: 'value',
      name: '用电量(kWh)',
      axisLabel: { formatter: '{value}' }
    },
    {
      type: 'value',
      name: '用水量(吨)',
      axisLabel: { formatter: '{value}' }
    }
  ],
  series: [
    {
      name: '用电量(kWh)',
      type: 'bar',
      data: []
    },
    {
      name: '用水量(吨)',
      type: 'line',
      yAxisIndex: 1,
      data: []
    }
  ]
})

// 计算属性：检查是否有数据
const hasEnergyData = computed(() => {
  return energyOptions.value.xAxis.data.length > 0 && 
         energyOptions.value.series.some(s => s.data.length > 0)
})

onMounted(async () => {
  loading.value = true
  try {
    // 获取建筑数据
    const buildingsResponse = await getBuildings()
    console.log('建筑数据:', buildingsResponse)
    buildings.value = buildingsResponse || []
    
    // 获取能耗数据
    const energyResponse = await getEnergyData('all')
    console.log('能耗数据:', energyResponse) 
    processEnergyData(energyResponse)
  } catch (error) {
    console.error('获取数据失败:', error)
    // 重置图表数据
    resetChartData()
  } finally {
    loading.value = false
  }
})

// 处理能耗数据
function processEnergyData(data) {
  // 从数组第一项中获取monthly数据
  const monthlyData = data?.[0]?.monthly || []
  console.log('处理后monthly数据:', monthlyData)
  
  energyOptions.value = {
    ...energyOptions.value,
    xAxis: {
      ...energyOptions.value.xAxis,
      data: monthlyData.map(item => item?.month || '')
    },
    series: [
      {
        ...energyOptions.value.series[0],
        data: monthlyData.map(item => item?.electricity || 0)
      },
      {
        ...energyOptions.value.series[1],
        data: monthlyData.map(item => item?.water || 0)
      }
    ]
  }
}

// 重置图表数据
function resetChartData() {
  energyOptions.value.xAxis.data = []
  energyOptions.value.series.forEach(s => {
    s.data = []
  })
}

function goToDetail(buildingId) {
  router.push({ name: 'Detail', params: { buildingId } })
}
</script>

<style scoped>
.overview {
  padding: 20px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.building-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.building-card {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.building-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.chart-container {
  margin-top: 40px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 500px;
}

.empty-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #999;
  font-size: 18px;
}
</style>