<template>
  <div class="error-dashboard">
    <div class="dashboard-header">
      <h1 class="dashboard-title">
        <ArtSvgIcon icon="ri:alert-line" class="title-icon" />
        错误监控大屏
        <span class="data-source-badge source-backend"> 服务端监控数据 </span>
      </h1>
      <div class="header-actions">
        <ElButton type="primary" @click="refreshData" :loading="refreshing">
          <ArtSvgIcon icon="ri:refresh-line" />
          刷新数据
        </ElButton>
        <ElButton type="info" @click="clearAllErrors">
          <ArtSvgIcon icon="ri:delete-bin-line" />
          清空日志
        </ElButton>
        <ElButton type="success" @click="exportErrors">
          <ArtSvgIcon icon="ri:download-line" />
          导出报告
        </ElButton>
        <ElButton type="warning" @click="triggerImageUpload">
          <ArtSvgIcon icon="ri:image-add-line" />
          上传错误截图
        </ElButton>
        <ElButton type="danger" @click="simulateRandomError" :loading="generatingRandomError">
          <ArtSvgIcon icon="ri:shuffle-line" />
          随机模拟错误
        </ElButton>

        <input
          ref="imageInputRef"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleImageUpload"
        />
      </div>
    </div>

    <!-- 错误统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card error-total">
        <div class="stat-icon">
          <ArtSvgIcon icon="ri:alert-line" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ errorStats.total }}</div>
          <div class="stat-label">总错误数</div>
          <div class="stat-trend" :class="{ increase: errorStats.total > 0 }">
            <ArtSvgIcon icon="ri:arrow-up-line" v-if="errorStats.total > 0" />
            {{ errorStats.total }}
          </div>
        </div>
      </div>

      <div class="stat-card vue-errors">
        <div class="stat-icon">
          <ArtSvgIcon icon="ri:vuejs-line" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ errorStats.vue }}</div>
          <div class="stat-label">Vue错误</div>
          <div class="stat-trend">
            {{ ((errorStats.vue / Math.max(errorStats.total, 1)) * 100).toFixed(1) }}%
          </div>
        </div>
      </div>

      <div class="stat-card script-errors">
        <div class="stat-icon">
          <ArtSvgIcon icon="ri:javascript-line" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ errorStats.script }}</div>
          <div class="stat-label">脚本错误</div>
          <div class="stat-trend">
            {{ ((errorStats.script / Math.max(errorStats.total, 1)) * 100).toFixed(1) }}%
          </div>
        </div>
      </div>

      <div class="stat-card promise-errors">
        <div class="stat-icon">
          <ArtSvgIcon icon="ri:heart-pulse-line" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ errorStats.promise }}</div>
          <div class="stat-label">Promise错误</div>
          <div class="stat-trend">
            {{ ((errorStats.promise / Math.max(errorStats.total, 1)) * 100).toFixed(1) }}%
          </div>
        </div>
      </div>

      <div class="stat-card resource-errors">
        <div class="stat-icon">
          <ArtSvgIcon icon="ri:image-line" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ errorStats.resource }}</div>
          <div class="stat-label">资源错误</div>
          <div class="stat-trend">
            {{ ((errorStats.resource / Math.max(errorStats.total, 1)) * 100).toFixed(1) }}%
          </div>
        </div>
      </div>

      <div class="stat-card network-errors">
        <div class="stat-icon">
          <ArtSvgIcon icon="ri:wifi-line" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ errorStats.network }}</div>
          <div class="stat-label">网络错误</div>
          <div class="stat-trend">
            {{ ((errorStats.network / Math.max(errorStats.total, 1)) * 100).toFixed(1) }}%
          </div>
        </div>
      </div>

      <div class="stat-card image-errors">
        <div class="stat-icon">
          <ArtSvgIcon icon="ri:image-add-line" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ errorStats.image }}</div>
          <div class="stat-label">图片截图</div>
          <div class="stat-trend">
            {{ ((errorStats.image / Math.max(errorStats.total, 1)) * 100).toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 错误趋势图表 -->
    <div class="chart-section">
      <div class="chart-container">
        <h3 class="chart-title">错误趋势 (最近24小时)</h3>
        <div ref="trendChartRef" class="chart-content"></div>
      </div>

      <div class="chart-container">
        <h3 class="chart-title">错误类型分布</h3>
        <div ref="distributionChartRef" class="chart-content"></div>
      </div>
    </div>

    <!-- 错误列表 -->
    <div class="error-list-section">
      <div class="section-header">
        <h3 class="section-title">错误详情列表</h3>
        <div class="filters">
          <ElSelect v-model="filterType" placeholder="错误类型" clearable style="width: 120px">
            <ElOption label="全部" value="" />
            <ElOption label="Vue错误" value="vue_error" />
            <ElOption label="脚本错误" value="javascript_error" />
            <ElOption label="Promise错误" value="promise_error" />
            <ElOption label="资源错误" value="resource_error" />
            <ElOption label="网络错误" value="network_error" />
          </ElSelect>
          <ElInput
            v-model="searchKeyword"
            placeholder="搜索错误信息"
            style="width: 200px"
            clearable
          >
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" />
            </template>
          </ElInput>
        </div>
      </div>

      <div class="table-container">
        <ElTable :data="filteredErrors" row-key="id" height="500px" stripe style="width: 100%">
          <ElTableColumn prop="index" label="序号" width="80" align="center">
            <template #default="{ row }">
              {{ row.index }}
            </template>
          </ElTableColumn>

          <ElTableColumn prop="type" label="类型" width="100" align="center">
            <template #default="{ row }">
              <ElTag :type="getTagType(row.type)">{{ getTypeLabel(row.type) }}</ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="message" label="错误信息" min-width="300">
            <template #default="{ row }">
              <div class="error-message">
                <div class="message-text">
                  {{ row.message }}
                  <ArtSvgIcon
                    v-if="row.type === 'image'"
                    icon="ri:image-line"
                    style="margin-left: 8px; color: #06b6d4"
                  />
                </div>
                <div class="message-meta" v-if="row.source">
                  <span v-if="row.type !== 'image'">
                    来源: {{ row.source }}
                    <span v-if="row.lineno">行:{{ row.lineno }}</span>
                    <span v-if="row.colno">列:{{ row.colno }}</span>
                  </span>
                  <span v-else>
                    文件: {{ row.imageName }} ({{ formatFileSize(row.imageSize) }})
                  </span>
                </div>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="source" label="来源" min-width="200" />

          <ElTableColumn prop="time" label="时间" width="160">
            <template #default="{ row }">
              <div class="error-time">
                <div>{{ formatTime(row.time) }}</div>
                <div class="time-ago">{{ formatTimeAgo(row.time) }}</div>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <ElButton size="small" type="text" @click="viewErrorDetail(row)"> 查看详情 </ElButton>
              <ElButton size="small" type="text" @click="copyErrorInfo(row)"> 复制 </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>

    <!-- 错误详情弹窗 -->
    <ElDialog
      v-model="detailDialogVisible"
      title="错误详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedError" class="error-detail">
        <div class="detail-row">
          <label>错误类型:</label>
          <ElTag :type="getTagType(selectedError.type)">{{
            getTypeLabel(selectedError.type)
          }}</ElTag>
        </div>

        <div class="detail-row">
          <label>错误信息:</label>
          <div class="error-message-full">{{ selectedError.message }}</div>
        </div>

        <div class="detail-row" v-if="selectedError.imageData">
          <label>错误截图:</label>
          <div class="error-image-container">
            <img
              :src="selectedError.imageData"
              alt="错误截图"
              class="error-image"
              @click="previewImage(selectedError.imageData)"
            />
            <div class="image-info">
              <span>文件名: {{ selectedError.imageName }}</span>
              <span>大小: {{ formatFileSize(selectedError.imageSize) }}</span>
              <span>类型: {{ selectedError.imageType }}</span>
            </div>
          </div>
        </div>

        <div class="detail-row" v-if="selectedError.source">
          <label>来源文件:</label>
          <code>{{ selectedError.source }}</code>
        </div>

        <div class="detail-row" v-if="selectedError.lineno || selectedError.colno">
          <label>位置信息:</label>
          <span v-if="selectedError.lineno">第 {{ selectedError.lineno }} 行</span>
          <span v-if="selectedError.colno">第 {{ selectedError.colno }} 列</span>
        </div>

        <div class="detail-row">
          <label>发生时间:</label>
          {{ formatTime(selectedError.time) }} ({{ formatTimeAgo(selectedError.time) }})
        </div>

        <div class="detail-row" v-if="selectedError.stack">
          <label>错误堆栈:</label>
          <pre class="error-stack">{{ selectedError.stack }}</pre>
        </div>

        <div class="detail-row" v-if="selectedError.userAgent">
          <label>用户代理:</label>
          <code>{{ selectedError.userAgent }}</code>
        </div>

        <div class="detail-row" v-if="selectedError.url">
          <label>页面URL:</label>
          <code>{{ selectedError.url }}</code>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
  import { format, formatDistanceToNow, subHours, eachHourOfInterval } from 'date-fns'
  import { zhCN } from 'date-fns/locale'
  import {
    ElMessage,
    ElMessageBox,
    ElTag,
    ElSelect,
    ElInput,
    ElDialog,
    ElButton,
    ElTable,
    ElTableColumn,
    ElLoading
  } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import * as echarts from 'echarts'
  import { getErrorStats, getErrorLogs } from '@/api/error-report'
  import { log } from 'encode-monitor-core'

  // 响应式数据
  const refreshing = ref(false)
  const detailDialogVisible = ref(false)
  const selectedError = ref(null)
  const filterType = ref('')
  const searchKeyword = ref('')
  const errorList = ref([])
  const dataSource = ref('backend') // 'backend' 数据源
  const loadingServerData = ref(false)
  const generatingRandomError = ref(false)

  // 图表相关
  const trendChartRef = ref(null)
  const distributionChartRef = ref(null)
  let trendChart = null
  let distributionChart = null

  // 文件上传相关
  const imageInputRef = ref(null)

  // 错误统计
  const errorStats = computed(() => {
    const stats = {
      total: errorList.value.length,
      vue: 0,
      script: 0,
      promise: 0,
      resource: 0,
      network: 0,
      image: 0,
      // 添加数据源标识
      dataSource: dataSource.value
    }

    errorList.value.forEach((error) => {
      switch (error.type) {
        case 'vue':
        case 'vue_error':
          stats.vue++
          break
        case 'script':
        case 'javascript_error':
          stats.script++
          break
        case 'promise':
        case 'promise_error':
          stats.promise++
          break
        case 'resource':
        case 'resource_error':
          stats.resource++
          break
        case 'network':
        case 'network_error':
          stats.network++
          break
        case 'image':
          stats.image++
          break
      }
    })

    return stats
  })

  // 过滤后的错误列表
  const filteredErrors = computed(() => {
    let filtered = errorList.value

    // 类型过滤
    if (filterType.value) {
      filtered = filtered.filter((error) => error.type === filterType.value)
    }

    // 关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      filtered = filtered.filter(
        (error) =>
          error.message?.toLowerCase().includes(keyword) ||
          error.source?.toLowerCase().includes(keyword)
      )
    }

    // 添加序号
    return filtered.map((item, index) => ({
      ...item,
      index: index + 1
    }))
  })

  // 错误趋势图表数据
  const trendChartData = computed(() => {
    const now = new Date()
    const hours = eachHourOfInterval({
      start: subHours(now, 23),
      end: now
    })

    const data = hours.map((hour) => {
      const hourStart = new Date(hour)
      const hourEnd = new Date(hour.getTime() + 60 * 60 * 1000)

      const count = errorList.value.filter((error) => {
        const errorTime = new Date(error.time)
        return errorTime >= hourStart && errorTime < hourEnd
      }).length

      return {
        time: format(hour, 'HH:mm'),
        count: count
      }
    })

    return data
  })

  // 错误类型分布数据
  const distributionChartData = computed(() => {
    const data = [
      { name: 'Vue错误', value: errorStats.value.vue, itemStyle: { color: '#10b981' } },
      { name: '脚本错误', value: errorStats.value.script, itemStyle: { color: '#f59e0b' } },
      { name: 'Promise错误', value: errorStats.value.promise, itemStyle: { color: '#3b82f6' } },
      { name: '资源错误', value: errorStats.value.resource, itemStyle: { color: '#8b5cf6' } },
      { name: '网络错误', value: errorStats.value.network, itemStyle: { color: '#ec4899' } },
      { name: '图片截图', value: errorStats.value.image, itemStyle: { color: '#06b6d4' } }
    ].filter((item) => item.value > 0)

    return data
  })

  // 表格列配置

  // 获取错误类型标签
  const getTypeLabel = (type) => {
    const labels = {
      vue: 'Vue错误',
      vue_error: 'Vue错误',
      script: '脚本错误',
      javascript_error: '脚本错误',
      promise: 'Promise错误',
      promise_error: 'Promise错误',
      resource: '资源错误',
      resource_error: '资源错误',
      network: '网络错误',
      network_error: '网络错误',
      image: '图片截图'
    }
    return labels[type] || '未知错误'
  }

  // 获取错误类型对应的Element Plus标签类型
  const getTagType = (type) => {
    const types = {
      vue: 'danger',
      vue_error: 'danger',
      script: 'warning',
      javascript_error: 'warning',
      promise: 'info',
      promise_error: 'info',
      resource: 'success',
      resource_error: 'success',
      network: 'primary',
      network_error: 'primary',
      image: 'primary'
    }
    return types[type] || 'default'
  }

  // 格式化时间
  const formatTime = (time) => {
    return format(time, 'yyyy-MM-dd HH:mm:ss')
  }

  // 格式化相对时间
  const formatTimeAgo = (time) => {
    return formatDistanceToNow(time, { addSuffix: true, locale: zhCN })
  }

  // 从服务端加载数据
  const loadServerData = async () => {
    try {
      loadingServerData.value = true

      // 获取服务端统计数据
      const statsResponse = await getErrorStats()

      if (statsResponse.code === 200) {
        // 获取最新的错误日志
        const logsResponse = await getErrorLogs({
          page: 1,
          pageSize: 1000, // 获取最近1000条记录
          type: filterType.value || undefined
        })

        if (logsResponse.code === 200) {
          // 将服务端数据转换为前端格式
          const serverErrors = logsResponse.data.logs.map((log) => ({
            id: log.id,
            type: log.type,
            message: log.message,
            source: log.source,
            lineno: log.lineno,
            colno: log.colno,
            stack: log.stack,
            time: new Date(log.timestamp),
            userAgent: log.userAgent,
            url: log.url,
            sessionId: log.sessionId,
            userId: log.userId,
            deviceInfo: log.deviceInfo,
            // 图片相关字段
            ...(log.imageData && {
              imageData: log.imageData,
              imageName: log.imageName,
              imageSize: log.imageSize,
              imageType: log.imageType
            })
          }))

          // 更新错误列表
          errorList.value = serverErrors
        }
      }

      // 更新图表
      updateCharts()
    } catch (error) {
      console.error('加载服务端数据失败:', error)
      ElMessage.error('加载服务端数据失败')
      throw error
    } finally {
      loadingServerData.value = false
    }
  }

  // 刷新数据
  const refreshData = async () => {
    refreshing.value = true

    try {
      await loadServerData()
      ElMessage.success('数据已刷新')
    } catch (error) {
      console.error('数据刷新失败:', error)
      ElMessage.error('数据刷新失败')
    } finally {
      refreshing.value = false
    }
  }

  // 清空所有错误
  const clearAllErrors = () => {
    ElMessageBox.confirm('确定要清空所有错误日志吗？此操作不可恢复。', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      errorList.value = []

      // 更新图表
      updateCharts()

      ElMessage.success('错误日志已清空')
    })
  }

  // 导出错误报告
  const exportErrors = () => {
    const data = errorList.value.map((error) => ({
      类型: getTypeLabel(error.type),
      错误信息: error.message,
      来源: error.source || '',
      行号: error.lineno || '',
      列号: error.colno || '',
      时间: formatTime(error.time),
      用户代理: error.userAgent || '',
      页面URL: error.url || ''
    }))

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `error-report-${format(new Date(), 'yyyyMMddHHmmss')}.csv`
    link.click()

    ElMessage.success('错误报告已导出')
  }

  // 查看错误详情
  const viewErrorDetail = (error) => {
    selectedError.value = error
    detailDialogVisible.value = true
  }

  // 复制错误信息
  const copyErrorInfo = (error) => {
    const info = `
错误类型: ${getTypeLabel(error.type)}
错误信息: ${error.message}
来源: ${error.source || '未知'}
位置: ${error.lineno ? `第${error.lineno}行` : ''} ${error.colno ? `第${error.colno}列` : ''}
时间: ${formatTime(error.time)}
页面URL: ${error.url || window.location.href}
用户代理: ${error.userAgent || navigator.userAgent}
  `.trim()

    navigator.clipboard
      .writeText(info)
      .then(() => {
        ElMessage.success('错误信息已复制到剪贴板')
      })
      .catch(() => {
        ElMessage.error('复制失败')
      })
  }

  // 模拟随机错误
  const simulateRandomError = () => {
    generatingRandomError.value = true

    // 随机错误类型和消息
    const errorTypes = [
      // JavaScript运行时错误
      {
        type: 'javascript_error',
        generator: () => {
          const errors = [
            "Cannot read property 'map' of undefined",
            "Cannot read property 'length' of null",
            'TypeError: undefined is not a function',
            'ReferenceError: variable is not defined',
            'SyntaxError: Unexpected token in JSON',
            'RangeError: Invalid array length',
            'URIError: malformed URI sequence'
          ]
          const randomError = errors[Math.floor(Math.random() * errors.length)]
          return new Error(`${randomError} [Random ID: ${Date.now()}]`)
        }
      },
      // Promise rejection错误
      {
        type: 'promise_error',
        generator: () => {
          const errors = [
            'Network request failed: Connection timeout',
            'API request rejected: Invalid authentication',
            'Database query failed: Connection lost',
            'File upload failed: Insufficient permissions',
            'Async operation cancelled by user',
            'Service unavailable: Server maintenance',
            'Rate limit exceeded: Too many requests'
          ]
          const randomError = errors[Math.floor(Math.random() * errors.length)]
          return new Error(`${randomError} [Random ID: ${Date.now()}]`)
        }
      },
      // 自定义业务错误
      {
        type: 'custom_error',
        generator: () => {
          const errors = [
            'Business logic error: Invalid user input',
            'Validation failed: Required field missing',
            'Permission denied: Insufficient access rights',
            'Resource not found: Item does not exist',
            'Operation timeout: Process took too long',
            'Data corruption: Invalid data format',
            'Configuration error: Missing environment variable'
          ]
          const randomError = errors[Math.floor(Math.random() * errors.length)]
          const customError = new Error(`${randomError} [Random ID: ${Date.now()}]`)
          customError.name = 'CustomError'
          return customError
        }
      },
      // DOM操作错误
      {
        type: 'dom_error',
        generator: () => {
          const errors = [
            'Cannot set property of null',
            'Cannot read property of null (DOM element)',
            'Element not found in document',
            'Invalid DOM operation: Node not found',
            'Event listener error: Handler not found',
            'DOM manipulation failed: Invalid selector',
            'Canvas rendering error: Context lost'
          ]
          const randomError = errors[Math.floor(Math.random() * errors.length)]
          return new Error(`${randomError} [Random ID: ${Date.now()}]`)
        }
      },
      // 数学计算错误
      {
        type: 'math_error',
        generator: () => {
          const errors = [
            'Division by zero error',
            'Invalid mathematical operation',
            'Number overflow: Value too large',
            'Precision loss in calculation',
            'Invalid logarithm argument',
            'Square root of negative number',
            'Invalid trigonometric function input'
          ]
          const randomError = errors[Math.floor(Math.random() * errors.length)]
          return new Error(`${randomError} [Random ID: ${Date.now()}]`)
        }
      }
    ]

    // 随机选择错误类型
    const randomType = errorTypes[Math.floor(Math.random() * errorTypes.length)]

    // 显示消息提示
    ElMessage.info('随机错误已生成，请等待几秒钟查看错误监控结果')

    // 立即重置加载状态，避免UI卡住
    generatingRandomError.value = false

    // 使用Promise.resolve().then()确保在微任务中执行
    Promise.resolve().then(() => {
      // 生成随机错误
      const error = randomType.generator()
      console.log(`[Random Error] 生成类型: ${randomType.type}, 错误: ${error.message}`)

      // 方式1: 手动使用SDK上报（确保上报成功）
      log({
        message: error.message,
        level: 'error',
        tag: `random_${randomType.type}`
      })

      // 方式2: 同时抛出错误，让SDK的window.onerror也捕获
      throw error
    })
  }

  // 触发图片上传
  const triggerImageUpload = () => {
    if (imageInputRef.value) {
      imageInputRef.value.click()
    }
  }

  // 处理图片上传
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请选择图片文件')
      return
    }

    // 检查文件大小 (限制为5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      ElMessage.error('图片大小不能超过5MB')
      return
    }

    try {
      // 显示加载状态
      const loading = ElLoading.service({
        lock: true,
        text: '正在上传图片...',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      // 将图片转换为base64
      const base64Data = await fileToBase64(file)

      // 创建图片错误记录
      const imageError = {
        id: Date.now() + Math.random(),
        type: 'image',
        message: `用户上传的错误截图: ${file.name}`,
        source: file.name,
        lineno: 0,
        colno: 0,
        time: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        imageData: base64Data,
        imageName: file.name,
        imageSize: file.size,
        imageType: file.type
      }

      // 添加到错误列表
      errorList.value.unshift(imageError)

      // 更新图表
      nextTick(() => {
        updateCharts()
      })

      loading.close()
      ElMessage.success(`错误截图 "${file.name}" 已上传成功`)

      // 清空文件输入
      if (imageInputRef.value) {
        imageInputRef.value.value = ''
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      ElMessage.error('图片上传失败，请重试')
    }
  }

  // 将文件转换为base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // 预览图片
  const previewImage = (imageData) => {
    // 创建图片预览弹窗
    const imageWindow = window.open('', '_blank')
    imageWindow.document.write(`
      <html>
        <head>
          <title>错误截图预览</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 90vw;
              max-height: 90vh;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <img src="${imageData}" alt="错误截图" />
        </body>
      </html>
    `)
  }

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 初始化趋势图表
  const initTrendChart = () => {
    if (!trendChartRef.value) return

    trendChart = echarts.init(trendChartRef.value)

    const option = {
      title: {
        show: false
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const param = params[0]
          return `${param.name}<br/>错误数量: ${param.value}`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: trendChartData.value.map((item) => item.time),
        axisLabel: {
          color: '#6b7280'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#6b7280'
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: '错误数量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#ef4444',
            width: 2
          },
          itemStyle: {
            color: '#ef4444'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(239, 68, 68, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(239, 68, 68, 0.05)'
                }
              ]
            }
          },
          data: trendChartData.value.map((item) => item.count)
        }
      ]
    }

    trendChart.setOption(option)
  }

  // 初始化分布饼图
  const initDistributionChart = () => {
    if (!distributionChartRef.value) return

    distributionChart = echarts.init(distributionChartRef.value)

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'right',
        textStyle: {
          color: '#6b7280'
        }
      },
      series: [
        {
          name: '错误类型',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          data: distributionChartData.value
        }
      ]
    }

    distributionChart.setOption(option)
  }

  // 更新图表
  const updateCharts = () => {
    if (trendChart) {
      const option = trendChart.getOption()
      option.xAxis[0].data = trendChartData.value.map((item) => item.time)
      option.series[0].data = trendChartData.value.map((item) => item.count)
      trendChart.setOption(option)
    }

    if (distributionChart) {
      const option = distributionChart.getOption()
      option.series[0].data = distributionChartData.value
      distributionChart.setOption(option)
    }
  }

  // 窗口大小改变时重新调整图表大小
  const handleResize = () => {
    if (trendChart) {
      trendChart.resize()
    }
    if (distributionChart) {
      distributionChart.resize()
    }
  }

  // 生命周期
  onMounted(() => {
    // 等待DOM更新后初始化图表
    nextTick(() => {
      initTrendChart()
      initDistributionChart()
    })

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)

    // 初始加载数据
    refreshData()
  })

  onUnmounted(() => {
    // 清理图表实例
    if (trendChart) {
      trendChart.dispose()
    }
    if (distributionChart) {
      distributionChart.dispose()
    }

    // 移除事件监听器
    window.removeEventListener('resize', handleResize)
  })
</script>

<style scoped>
  .error-dashboard {
    min-height: 100vh;
    padding: 20px;
    background: #f5f5f5;
  }

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    margin-bottom: 24px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  }

  .dashboard-title {
    display: flex;
    align-items: center;
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
  }

  .title-icon {
    margin-right: 12px;
    font-size: 28px;
    color: #ef4444;
  }

  .data-source-badge {
    padding: 4px 12px;
    margin-left: 16px;
    font-size: 12px;
    font-weight: 500;
    color: #166534;
    text-transform: uppercase;
    background: #dcfce7;
    border-radius: 12px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .data-source-switch {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-left: 16px;
    margin-left: 16px;
    border-left: 1px solid #e5e7eb;
  }

  .switch-label {
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    transition: transform 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-card.error-total {
    background: linear-gradient(135deg, #fef2f2, #fee2e2);
    border-left: 4px solid #ef4444;
  }

  .stat-card.vue-errors {
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    border-left: 4px solid #10b981;
  }

  .stat-card.script-errors {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-left: 4px solid #f59e0b;
  }

  .stat-card.promise-errors {
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border-left: 4px solid #3b82f6;
  }

  .stat-card.resource-errors {
    background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
    border-left: 4px solid #8b5cf6;
  }

  .stat-card.network-errors {
    background: linear-gradient(135deg, #fdf2f8, #fce7f3);
    border-left: 4px solid #ec4899;
  }

  .stat-icon {
    margin-right: 16px;
    font-size: 32px;
    opacity: 0.8;
  }

  .stat-card.error-total .stat-icon {
    color: #ef4444;
  }

  .stat-card.vue-errors .stat-icon {
    color: #10b981;
  }

  .stat-card.script-errors .stat-icon {
    color: #f59e0b;
  }

  .stat-card.promise-errors .stat-icon {
    color: #3b82f6;
  }

  .stat-card.resource-errors .stat-icon {
    color: #8b5cf6;
  }

  .stat-card.network-errors .stat-icon {
    color: #ec4899;
  }

  .stat-card.image-errors {
    background: linear-gradient(135deg, #ecfeff, #cffafe);
    border-left: 4px solid #06b6d4;
  }

  .stat-card.image-errors .stat-icon {
    color: #06b6d4;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    margin-bottom: 4px;
    font-size: 28px;
    font-weight: 700;
  }

  .stat-label {
    margin-bottom: 4px;
    font-size: 14px;
    color: #6b7280;
  }

  .stat-trend {
    display: flex;
    gap: 2px;
    align-items: center;
    font-size: 12px;
    color: #9ca3af;
  }

  .stat-trend.increase {
    color: #ef4444;
  }

  .chart-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .chart-container {
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  }

  .chart-title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .chart-content {
    width: 100%;
    height: 300px;
  }

  .error-list-section {
    overflow: hidden;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  .section-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
  }

  .filters {
    display: flex;
    gap: 12px;
  }

  .error-message {
    max-width: 400px;
  }

  .message-text {
    margin-bottom: 4px;
    overflow: hidden;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .message-meta {
    font-size: 12px;
    color: #9ca3af;
  }

  .error-time {
    text-align: center;
  }

  .time-ago {
    margin-top: 2px;
    font-size: 12px;
    color: #9ca3af;
  }

  .table-container {
    padding: 20px;
  }

  .error-detail {
    max-height: 60vh;
    overflow-y: auto;
  }

  .detail-row {
    margin-bottom: 16px;
  }

  .detail-row label {
    display: block;
    margin-bottom: 4px;
    font-weight: 600;
    color: #374151;
  }

  .error-message-full {
    padding: 12px;
    font-family: Monaco, Menlo, 'Ubuntu Mono', monospace;
    font-size: 14px;
    word-break: break-all;
    background: #f9fafb;
    border-radius: 4px;
  }

  .error-stack {
    max-height: 200px;
    padding: 12px;
    overflow-y: auto;
    font-family: Monaco, Menlo, 'Ubuntu Mono', monospace;
    font-size: 12px;
    word-break: break-all;
    white-space: pre-wrap;
    background: #f9fafb;
    border-radius: 4px;
  }

  .error-image-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .error-image {
    max-width: 100%;
    max-height: 300px;
    cursor: pointer;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    transition: transform 0.2s;
  }

  .error-image:hover {
    transform: scale(1.02);
  }

  .image-info {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 14px;
    color: #6b7280;
  }

  .image-info span {
    padding: 4px 8px;
    background: #f3f4f6;
    border-radius: 4px;
  }

  .detail-row code {
    padding: 2px 6px;
    font-family: Monaco, Menlo, 'Ubuntu Mono', monospace;
    font-size: 13px;
    color: #374151;
    background: #f9fafb;
    border-radius: 3px;
  }

  /* 响应式设计 */
  @media (width <= 768px) {
    .dashboard-header {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .chart-section {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .filters {
      flex-direction: column;
    }
  }
</style>
