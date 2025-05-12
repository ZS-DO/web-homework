<template>
  <div class="detail">
    <button @click="goBack" class="back-button">返回</button>
    
    <h2>{{ building.name }} 能耗详情</h2>
    <div class="building-info">
      <p>建筑面积: {{ building.area }}㎡</p>
      <p>楼层数: {{ building.floors }}</p>
    </div>
    
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="chart-container">
      <template v-if="hasChartData">
        <EnergyChart 
          :options="chartOptions" 
          height="450px"
        />
      </template>
      <div v-else class="empty-data">
        <p>暂无能耗数据</p>
      </div>
    </div>
    
    <div class="pie-charts" v-if="hasPieData">
      <div class="pie-chart">
        <h3>能源消耗占比</h3>
        <EnergyChart 
          :options="pieOptions" 
          height="300px"
        />
      </div>
    </div>
    
    <LoadingSpinner :loading="loading" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBuildingDetail, getEnergyData } from '@/utils/api'
import EnergyChart from '@/components/EnergyChart.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const buildingId = route.params.buildingId
const building = ref({})
const energyData = ref(null)
const activeTab = ref('monthly')
const loading = ref(false)

const tabs = [
  { label: '月度数据', value: 'monthly' },
  { label: '每日数据', value: 'daily' }
]

// 检查是否有图表数据
const hasChartData = computed(() => {
  return energyData.value?.[activeTab.value]?.length > 0
})

// 检查是否有饼图数据
const hasPieData = computed(() => {
  const data = energyData.value?.[activeTab.value] || []
  return data.some(item => item.electricity > 0 || item.water > 0)
})

const chartOptions = computed(() => {
  const data = energyData.value?.[activeTab.value] || []
  const xAxisData = data.map(item => item[activeTab.value === 'monthly' ? 'month' : 'day'])
  const electricityData = data.map(item => item.electricity)
  const waterData = data.map(item => item.water)
  
  return {
    title: { 
      text: `${building.value.name} ${activeTab.value === 'monthly' ? '月度' : '每日'}能耗趋势`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['用电量(kWh)', '用水量(吨)'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        interval: 0,
        rotate: activeTab.value === 'monthly' ? 0 : 30
      }
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
        barWidth: '60%',
        data: electricityData,
        itemStyle: {
          color: '#5470C6'
        }
      },
      {
        name: '用水量(吨)',
        type: 'line',
        yAxisIndex: 1,
        data: waterData,
        itemStyle: {
          color: '#91CC75'
        }
      }
    ]
  }
})

const pieOptions = computed(() => {
  const data = energyData.value?.[activeTab.value] || []
  const totalElectricity = data.reduce((sum, item) => sum + (item.electricity || 0), 0)
  const totalWater = data.reduce((sum, item) => sum + (item.water || 0), 0)
  
  return {
    title: { 
      text: '能源消耗占比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['用电量', '用水量']
    },
    series: [
      {
        name: '能源消耗',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: totalElectricity, name: '用电量', itemStyle: { color: '#5470C6' } },
          { value: totalWater, name: '用水量', itemStyle: { color: '#91CC75' } }
        ]
      }
    ]
  }
})

onMounted(async () => {
  loading.value = true
  try {
    // 获取建筑详情
    building.value = await getBuildingDetail(buildingId)
    
    // 获取能耗数据
    const allEnergyData = await getEnergyData(buildingId)
    console.log('API返回的能耗数据:', allEnergyData)
    
    // 查找当前建筑或汇总数据
    energyData.value = allEnergyData.find(item => item.buildingId == buildingId) || 
                      allEnergyData.find(item => item.buildingId === 'all')
    console.log('使用的能耗数据:', energyData.value)
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
})

watch(activeTab, async (newTab) => {
  if (!energyData.value?.[newTab]) {
    loading.value = true
    try {
      const allEnergyData = await getEnergyData(buildingId, newTab)
      energyData.value = allEnergyData.find(item => item.buildingId == buildingId) || 
                        allEnergyData.find(item => item.buildingId === 'all')
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      loading.value = false
    }
  }
})

function goBack() {
  router.go(-1)
}
</script>

<style scoped>
.detail {
  padding: 20px;
  position: relative;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 5px 10px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.back-button:hover {
  background: #3aa876;
}

.building-info {
  margin: 40px 0 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tabs button {
  padding: 8px 16px;
  margin-right: 10px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.tabs button.active {
  border-bottom-color: #42b983;
  color: #42b983;
  font-weight: bold;
}

.tabs button:hover {
  color: #42b983;
}

.chart-container {
  margin: 30px 0;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-data {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
}

.pie-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.pie-chart {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pie-chart h3 {
  margin-top: 0;
  text-align: center;
  color: #333;
}
</style>