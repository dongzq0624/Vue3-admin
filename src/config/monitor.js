/**
 * 前端监控配置
 */
import { initOptions } from 'encode-monitor-core'
import { MonitorVue } from 'encode-monitor-vue'

// 监控配置
const monitorConfig = {
  // 数据上报地址
  dsn: '/api/error-report',

  // 项目唯一标识
  apikey: 'vue3-admin-monitor',

  // 是否开启调试模式
  debug: process.env.NODE_ENV === 'development',

  // 开启traceId跟踪
  enableTraceId: true,

  // 需要添加traceId的请求URL正则
  includeHttpUrlTraceIdRegExp: /.*/,

  // traceId字段名
  traceIdFieldName: 'X-Trace-Id',

  // 节流延迟时间（毫秒）
  throttleDelayTime: 0,

  // 最大重复错误数量
  maxDuplicateCount: 2
}

/**
 * 初始化前端监控SDK
 */
export function initMonitor(app) {
  try {
    // 初始化监控配置
    initOptions(monitorConfig)

    // 安装Vue监控插件
    if (app && MonitorVue) {
      app.use(MonitorVue)
    }

    console.log('[Monitor] Frontend monitoring initialized successfully')
  } catch (error) {
    console.error('[Monitor] Failed to initialize monitoring:', error)
  }
}

export default monitorConfig
