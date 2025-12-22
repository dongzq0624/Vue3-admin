<!-- 柱状图 -->
<template>
  <div ref="chartRef" :style="{ height: props.height }" v-loading="props.loading"> </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useChartOps, useChartComponent } from '@/hooks/core/useChart'
  import { getCssVar } from '@/utils/ui'
  import { graphic } from '@/plugins/echarts'

  defineOptions({ name: 'ArtBarChart' })

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
    borderRadius: {
      type: Number,
      default: 4
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
    barWidth: {
      type: String,
      default: '40%'
    },
    stack: {
      type: Boolean,
      default: false
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

  // 判断是否为多数据
  const isMultipleData = computed(() => {
    return (
      Array.isArray(props.data) &&
      props.data.length > 0 &&
      typeof props.data[0] === 'object' &&
      'name' in props.data[0]
    )
  })

  // 获取颜色配置
  const getColor = (customColor, index) => {
    if (customColor) return customColor

    if (index !== undefined) {
      return props.colors[index % props.colors.length]
    }

    // 默认渐变色
    return new graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: getCssVar('--el-color-primary-light-4')
      },
      {
        offset: 1,
        color: getCssVar('--el-color-primary')
      }
    ])
  }

  // 创建渐变色
  const createGradientColor = (color) => {
    return new graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: color
      },
      {
        offset: 1,
        color: color
      }
    ])
  }

  // 获取基础样式配置
  const getBaseItemStyle = (color) => ({
    borderRadius: props.borderRadius,
    color: typeof color === 'string' ? createGradientColor(color) : color
  })

  // 创建系列配置
  const createSeriesItem = (config) => {
    const animationConfig = getAnimationConfig()

    return {
      name: config.name,
      data: config.data,
      type: 'bar',
      stack: config.stack,
      itemStyle: getBaseItemStyle(config.color),
      barWidth: config.barWidth || props.barWidth,
      ...animationConfig
    }
  }

  // 使用新的图表组件抽象
  const {
    chartRef,
    getAxisLineStyle,
    getAxisLabelStyle,
    getAxisTickStyle,
    getSplitLineStyle,
    getAnimationConfig,
    getTooltipStyle,
    getLegendStyle,
    getGridWithLegend
  } = useChartComponent({
    props,
    checkEmpty: () => {
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
    },
    watchSources: [() => props.data, () => props.xAxisData, () => props.colors],
    generateOptions: () => {
      const options = {
        grid: getGridWithLegend(props.showLegend && isMultipleData.value, props.legendPosition, {
          top: 15,
          right: 0,
          left: 0
        }),
        tooltip: props.showTooltip ? getTooltipStyle() : undefined,
        xAxis: {
          type: 'category',
          data: props.xAxisData,
          axisTick: getAxisTickStyle(),
          axisLine: getAxisLineStyle(props.showAxisLine),
          axisLabel: getAxisLabelStyle(props.showAxisLabel)
        },
        yAxis: {
          type: 'value',
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
        const multiData = props.data
        options.series = multiData.map((item, index) => {
          const computedColor = getColor(props.colors[index], index)

          return createSeriesItem({
            name: item.name,
            data: item.data,
            color: computedColor,
            barWidth: item.barWidth,
            stack: props.stack ? item.stack || 'total' : undefined
          })
        })
      } else {
        // 单数据情况
        const singleData = props.data
        const computedColor = getColor()

        options.series = [
          createSeriesItem({
            data: singleData,
            color: computedColor
          })
        ]
      }

      return options
    }
  })
</script>
