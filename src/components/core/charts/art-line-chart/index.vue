<!-- 折线图，支持多组数据，支持阶梯式动画效果 -->
<template>
  <div
    ref="chartRef"
    class="relative w-[calc(100%+10px)]"
    :style="{ height: props.height }"
    v-loading="props.loading"
  >
  </div>
</template>

<script setup>
  import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
  import { graphic } from '@/plugins/echarts'
  import { getCssVar, hexToRgba } from '@/utils/ui'
  import { useChartOps, useChartComponent } from '@/hooks/core/useChart'

  defineOptions({ name: 'ArtLineChart' })

  const props = defineProps({
    // 基础配置
    height: {
      type: String,
      default: useChartOps().chartHeight
    },
    loading: {
      type: Boolean,
      default: false
    },
    isEmpty: {
      type: Boolean,
      default: false
    },
    colors: {
      type: Array,
      default: () => useChartOps().colors
    },

    // 数据配置
    data: {
      type: Array,
      default: () => [0, 0, 0, 0, 0, 0, 0]
    },
    xAxisData: {
      type: Array,
      default: () => []
    },
    lineWidth: {
      type: Number,
      default: 2.5
    },
    showAreaColor: {
      type: Boolean,
      default: false
    },
    smooth: {
      type: Boolean,
      default: true
    },
    symbol: {
      type: String,
      default: 'none'
    },
    symbolSize: {
      type: Number,
      default: 6
    },
    animationDelay: {
      type: Number,
      default: 200
    },

    // 轴线显示配置
    showAxisLabel: {
      type: Boolean,
      default: true
    },
    showAxisLine: {
      type: Boolean,
      default: true
    },
    showSplitLine: {
      type: Boolean,
      default: true
    },

    // 交互配置
    showTooltip: {
      type: Boolean,
      default: true
    },
    showLegend: {
      type: Boolean,
      default: false
    },
    legendPosition: {
      type: String,
      default: 'bottom'
    }
  })

  // 动画状态管理
  const isAnimating = ref(false)
  const animationTimers = ref([])
  const animatedData = ref([])

  // 清理所有定时器
  const clearAnimationTimers = () => {
    animationTimers.value.forEach((timer) => clearTimeout(timer))
    animationTimers.value = []
  }

  // 判断是否为多数据
  const isMultipleData = computed(() => {
    return (
      Array.isArray(props.data) &&
      props.data.length > 0 &&
      typeof props.data[0] === 'object' &&
      'name' in props.data[0]
    )
  })

  // 缓存计算的最大值，避免重复计算
  const maxValue = computed(() => {
    if (isMultipleData.value) {
      const multiData = props.data
      return multiData.reduce((max, item) => {
        if (item.data?.length) {
          const itemMax = Math.max(...item.data)
          return Math.max(max, itemMax)
        }
        return max
      }, 0)
    } else {
      const singleData = props.data
      return singleData?.length ? Math.max(...singleData) : 0
    }
  })

  // 初始化动画数据
  const initAnimationData = () => {
    if (isMultipleData.value) {
      const multiData = props.data
      return multiData.map((item) => ({
        ...item,
        data: Array(item.data.length).fill(0)
      }))
    }
    const singleData = props.data
    return Array(singleData.length).fill(0)
  }

  // 复制真实数据
  const copyRealData = () => {
    if (isMultipleData.value) {
      return props.data.map((item) => ({ ...item, data: [...item.data] }))
    }
    return [...props.data]
  }

  // 获取颜色配置
  const primaryColor = computed(() => getCssVar('--el-color-primary'))

  const getColor = (customColor, index) => {
    if (customColor) return customColor
    if (index !== undefined) return props.colors[index % props.colors.length]
    return primaryColor.value
  }

  // 生成区域样式
  const generateAreaStyle = (item, color) => {
    // 如果有 areaStyle 配置，或者显式开启了区域颜色，则显示区域样式
    if (!item.areaStyle && !item.showAreaColor && !props.showAreaColor) return undefined

    const areaConfig = item.areaStyle || {}
    if (areaConfig.custom) return areaConfig.custom

    return {
      color: new graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: hexToRgba(color, areaConfig.startOpacity || 0.2).rgba
        },
        {
          offset: 1,
          color: hexToRgba(color, areaConfig.endOpacity || 0.02).rgba
        }
      ])
    }
  }

  // 生成单数据区域样式
  const generateSingleAreaStyle = () => {
    if (!props.showAreaColor) return undefined

    const color = getColor(props.colors[0])
    return {
      color: new graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: hexToRgba(color, 0.2).rgba
        },
        {
          offset: 1,
          color: hexToRgba(color, 0.02).rgba
        }
      ])
    }
  }

  // 创建系列配置
  const createSeriesItem = (config) => {
    return {
      name: config.name,
      data: config.data,
      type: 'line',
      color: config.color,
      smooth: config.smooth ?? props.smooth,
      symbol: config.symbol ?? props.symbol,
      symbolSize: config.symbolSize ?? props.symbolSize,
      lineStyle: {
        width: config.lineWidth ?? props.lineWidth,
        color: config.color
      },
      areaStyle: config.areaStyle,
      emphasis: {
        focus: 'series',
        lineStyle: {
          width: (config.lineWidth ?? props.lineWidth) + 1
        }
      }
    }
  }

  // 生成图表配置
  const generateChartOptions = (isInitial = false) => {
    const options = {
      animation: true,
      animationDuration: isInitial ? 0 : 1300,
      animationDurationUpdate: isInitial ? 0 : 1300,
      grid: getGridWithLegend(props.showLegend && isMultipleData.value, props.legendPosition, {
        top: 15,
        right: 15,
        left: 0
      }),
      tooltip: props.showTooltip ? getTooltipStyle() : undefined,
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: props.xAxisData,
        axisTick: getAxisTickStyle(),
        axisLine: getAxisLineStyle(props.showAxisLine),
        axisLabel: getAxisLabelStyle(props.showAxisLabel)
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: maxValue.value,
        axisLabel: getAxisLabelStyle(props.showAxisLabel),
        axisLine: getAxisLineStyle(props.showAxisLine),
        splitLine: getSplitLineStyle(props.showSplitLine)
      }
    }

    // 添加图例配置
    if (props.showLegend && isMultipleData.value) {
      options.legend = getLegendStyle(props.legendPosition)
    }

    // 生成系列数据
    if (isMultipleData.value) {
      const multiData = animatedData.value
      options.series = multiData.map((item, index) => {
        const itemColor = getColor(props.colors[index], index)
        const areaStyle = generateAreaStyle(item, itemColor)

        return createSeriesItem({
          name: item.name,
          data: item.data,
          color: itemColor,
          smooth: item.smooth,
          symbol: item.symbol,
          lineWidth: item.lineWidth,
          areaStyle
        })
      })
    } else {
      // 单数据情况
      const singleData = animatedData.value
      const computedColor = getColor(props.colors[0])
      const areaStyle = generateSingleAreaStyle()

      options.series = [
        createSeriesItem({
          data: singleData,
          color: computedColor,
          areaStyle
        })
      ]
    }

    return options
  }

  // 更新图表
  const updateChartOptions = (options) => {
    initChart(options)
  }

  // 初始化动画函数
  const initChartWithAnimation = () => {
    clearAnimationTimers()
    isAnimating.value = true

    // 初始化为0值数据
    animatedData.value = initAnimationData()
    updateChartOptions(generateChartOptions(true))

    if (isMultipleData.value) {
      // 多数据阶梯式动画
      const multiData = props.data
      const currentAnimatedData = animatedData.value

      multiData.forEach((item, index) => {
        const timer = window.setTimeout(
          () => {
            currentAnimatedData[index] = { ...item, data: [...item.data] }
            animatedData.value = [...currentAnimatedData]
            updateChartOptions(generateChartOptions(false))
          },
          index * props.animationDelay + 100
        )

        animationTimers.value.push(timer)
      })

      // 标记动画完成
      const totalDelay = (multiData.length - 1) * props.animationDelay + 1500
      const finishTimer = window.setTimeout(() => {
        isAnimating.value = false
      }, totalDelay)
      animationTimers.value.push(finishTimer)
    } else {
      // 单数据简单动画 - 使用 nextTick 确保初始状态已渲染
      nextTick(() => {
        animatedData.value = copyRealData()
        updateChartOptions(generateChartOptions(false))
        isAnimating.value = false
      })
    }
  }

  // 空数据检查函数
  const checkIsEmpty = () => {
    // 检查单数据情况
    if (Array.isArray(props.data) && typeof props.data[0] === 'number') {
      const singleData = props.data
      return !singleData.length || singleData.every((val) => val === 0)
    }

    // 检查多数据情况
    if (Array.isArray(props.data) && typeof props.data[0] === 'object') {
      const multiData = props.data
      return (
        !multiData.length ||
        multiData.every((item) => !item.data?.length || item.data.every((val) => val === 0))
      )
    }

    return true
  }

  // 使用新的图表组件抽象
  const {
    chartRef,
    initChart,
    getAxisLineStyle,
    getAxisLabelStyle,
    getAxisTickStyle,
    getSplitLineStyle,
    getTooltipStyle,
    getLegendStyle,
    getGridWithLegend,
    isEmpty
  } = useChartComponent({
    props,
    checkEmpty: checkIsEmpty,
    watchSources: [() => props.data, () => props.xAxisData, () => props.colors],
    onVisible: () => {
      // 当图表变为可见时，检查是否为空数据
      if (!isEmpty.value) {
        initChartWithAnimation()
      }
    },
    generateOptions: () => generateChartOptions(false)
  })

  // 图表渲染函数
  const renderChart = () => {
    if (!isAnimating.value && !isEmpty.value) {
      initChartWithAnimation()
    }
  }

  // 数据监听
  watch([() => props.data, () => props.xAxisData, () => props.colors], renderChart, { deep: true })

  // 生命周期
  onMounted(() => {
    renderChart()
  })

  onBeforeUnmount(() => {
    clearAnimationTimers()
  })
</script>
