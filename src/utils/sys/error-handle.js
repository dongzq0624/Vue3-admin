/**
 * 全局错误处理模块
 *
 * 提供统一的错误捕获和处理机制
 *
 * ## 主要功能
 *
 * - Vue 运行时错误捕获（组件错误、生命周期错误等）
 * - 全局脚本错误捕获（语法错误、运行时错误等）
 * - Promise 未捕获错误处理（unhandledrejection）
 * - 静态资源加载错误监控（图片、脚本、样式等）
 * - 错误日志记录和上报
 * - 统一的错误处理入口
 *
 * ## 使用场景
 * - 应用启动时安装全局错误处理器
 * - 捕获和记录所有类型的错误
 * - 错误上报到监控平台
 * - 提升应用稳定性和可维护性
 * - 问题排查和调试
 *
 * ## 错误类型
 *
 * - VueError: Vue 组件相关错误
 * - ScriptError: JavaScript 脚本错误
 * - PromiseError: Promise 未捕获的 rejection
 * - ResourceError: 静态资源加载失败
 *
 * @module utils/sys/error-handle
 * @author Vue3-Admin Team
 */

// 导入事件总线
import mittBus from './mittBus'

/**
 * Vue 运行时错误处理
 */
export function vueErrorHandler(err, instance, info) {
  console.error('[VueError]', err, info, instance)

  // 构建错误信息
  const errorInfo = {
    type: 'vue',
    message: err.message || 'Vue runtime error',
    source: instance?.$?.type?.name || 'Unknown Vue Component',
    lineno: 0,
    colno: 0,
    stack: err.stack,
    info: info
  }

  // 通过事件总线发送错误信息
  reportError(errorInfo)
}

/**
 * 全局脚本错误处理
 */
export function scriptErrorHandler(message, source, lineno, colno, error) {
  console.error('[ScriptError]', { message, source, lineno, colno, error })

  // 构建错误信息
  const errorInfo = {
    type: 'script',
    message: message,
    source: source || 'unknown',
    lineno: lineno || 0,
    colno: colno || 0,
    stack: error?.stack
  }

  // 通过事件总线发送错误信息
  reportError(errorInfo)

  return true // 阻止默认控制台报错，可根据需求改
}

/**
 * Promise 未捕获错误处理
 */
export function registerPromiseErrorHandler() {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[PromiseError]', event.reason)

    // 构建错误信息
    const errorInfo = {
      type: 'promise',
      message: event.reason?.message || 'Unhandled Promise Rejection',
      source: 'Promise',
      lineno: 0,
      colno: 0,
      stack: event.reason?.stack,
      reason: event.reason
    }

    // 通过事件总线发送错误信息
    reportError(errorInfo)
  })
}

/**
 * 资源加载错误处理 (img, script, css...)
 */
export function registerResourceErrorHandler() {
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target
      if (
        target &&
        (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')
      ) {
        console.error('[ResourceError]', {
          tagName: target.tagName,
          src: target.src || target.src || target.href
        })

        // 构建错误信息
        const errorInfo = {
          type: 'resource',
          message: `Failed to load ${target.tagName.toLowerCase()}: ${target.src || target.href}`,
          source: target.src || target.href || 'unknown resource',
          lineno: 0,
          colno: 0,
          tagName: target.tagName
        }

        // 通过事件总线发送错误信息
        reportError(errorInfo)
      }
    },
    true // 捕获阶段才能监听到资源错误
  )
}

/**
 * 上报错误信息到错误监控系统
 * @param {Object} errorInfo - 错误信息
 */
export function reportError(errorInfo) {
  // 通过事件总线发送错误信息到错误监控大屏
  mittBus.emit('error-log', errorInfo)

  // 上报到服务端
  reportErrorToServer(errorInfo)
}

/**
 * 上报错误信息到服务端
 * @param {Object} errorInfo - 错误信息
 */
export async function reportErrorToServer(errorInfo) {
  try {
    // 增强错误信息，添加上报相关字段
    const enhancedError = {
      ...errorInfo,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      userId: getUserId(),
      deviceInfo: getDeviceInfo(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    }

    // 添加到上报队列
    addToReportQueue(enhancedError)

    // 触发上报（如果满足条件）
    await tryReportToServer()
  } catch (error) {
    console.error('[ErrorReport] 上报失败:', error)
    // 上报失败时存储到本地，稍后重试
    storeFailedReport(errorInfo)
  }
}

/**
 * 获取会话ID
 */
function getSessionId() {
  let sessionId = sessionStorage.getItem('error_monitor_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('error_monitor_session_id', sessionId)
  }
  return sessionId
}

/**
 * 获取用户ID（如果有登录系统）
 */
function getUserId() {
  // 这里可以从用户状态管理中获取用户ID
  // 暂时返回游客标识
  return localStorage.getItem('user_id') || 'anonymous'
}

/**
 * 获取设备信息
 */
function getDeviceInfo() {
  return {
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    online: navigator.onLine,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

// 上报队列和配置
let reportQueue = []
const MAX_QUEUE_SIZE = 50
const REPORT_INTERVAL = 5000 // 5秒上报一次
const MAX_RETRY_COUNT = 3

let reportTimer = null
let isReporting = false

/**
 * 添加到上报队列
 */
function addToReportQueue(errorInfo) {
  reportQueue.push({
    ...errorInfo,
    retryCount: 0,
    addedTime: Date.now()
  })

  // 限制队列大小，防止内存泄漏
  if (reportQueue.length > MAX_QUEUE_SIZE) {
    reportQueue = reportQueue.slice(-MAX_QUEUE_SIZE)
  }
}

/**
 * 尝试上报到服务端
 */
async function tryReportToServer() {
  if (isReporting || reportQueue.length === 0) {
    return
  }

  // 如果没有定时器，启动定时上报
  if (!reportTimer) {
    reportTimer = setInterval(() => {
      tryReportToServer()
    }, REPORT_INTERVAL)
  }

  // 检查是否满足上报条件
  const now = Date.now()
  const recentErrors = reportQueue.filter((item) => now - item.addedTime < 30000) // 30秒内的错误

  if (recentErrors.length >= 5 || now - reportQueue[0]?.addedTime >= 10000) {
    // 5个错误或10秒超时
    await performReport()
  }
}

/**
 * 执行上报
 */
async function performReport() {
  if (isReporting || reportQueue.length === 0) {
    return
  }

  isReporting = true

  try {
    const reportsToSend = reportQueue.splice(0, 20) // 每次最多上报20条

    const response = await fetch('/api/error-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 错误报告不需要认证，移除 Authorization 头
      },
      body: JSON.stringify({
        errors: reportsToSend,
        clientVersion: '1.0.0',
        clientType: 'web'
      })
    })

    if (response.ok) {
      console.log(`[ErrorReport] 成功上报 ${reportsToSend.length} 条错误信息`)
    } else {
      throw new Error(`上报失败: ${response.status}`)
    }
  } catch (error) {
    console.error('[ErrorReport] 上报请求失败:', error)

    // 重新放回队列，增加重试计数
    reportQueue.forEach((item) => {
      if (item.retryCount < MAX_RETRY_COUNT) {
        item.retryCount++
        item.addedTime = Date.now() // 重置时间
      }
    })

    // 存储失败的上报到本地存储
    storeFailedReports(reportQueue)
    reportQueue = []
  } finally {
    isReporting = false
  }
}

/**
 * 存储失败的上报到本地存储
 */
function storeFailedReports(reports) {
  try {
    const existing = JSON.parse(localStorage.getItem('failed_error_reports') || '[]')
    const combined = [...existing, ...reports]

    // 只保留最近的100条失败记录
    const recent = combined.sort((a, b) => b.addedTime - a.addedTime).slice(0, 100)

    localStorage.setItem('failed_error_reports', JSON.stringify(recent))
  } catch (error) {
    console.error('[ErrorReport] 存储失败上报失败:', error)
  }
}

/**
 * 存储单个失败的上报
 */
function storeFailedReport(errorInfo) {
  storeFailedReports([
    {
      ...errorInfo,
      retryCount: 0,
      addedTime: Date.now()
    }
  ])
}

/**
 * 重试失败的上报（在应用启动时调用）
 */
export function retryFailedReports() {
  try {
    const failedReports = JSON.parse(localStorage.getItem('failed_error_reports') || '[]')

    if (failedReports.length > 0) {
      console.log(`[ErrorReport] 发现 ${failedReports.length} 条失败的上报记录，正在重试...`)

      failedReports.forEach((report) => {
        addToReportQueue(report)
      })

      localStorage.removeItem('failed_error_reports')
    }
  } catch (error) {
    console.error('[ErrorReport] 重试失败上报失败:', error)
  }
}

/**
 * 清理资源（在应用卸载时调用）
 */
export function cleanupReportSystem() {
  if (reportTimer) {
    clearInterval(reportTimer)
    reportTimer = null
  }

  // 执行最后一次上报
  if (reportQueue.length > 0) {
    performReport()
  }
}

/**
 * 安装统一错误处理
 */
export function setupErrorHandle(app) {
  app.config.errorHandler = vueErrorHandler
  window.onerror = scriptErrorHandler
  registerPromiseErrorHandler()
  registerResourceErrorHandler()

  // 应用启动时重试失败的上报
  retryFailedReports()

  // 监听页面卸载事件，确保数据上报
  window.addEventListener('beforeunload', () => {
    if (reportQueue.length > 0) {
      // 使用 sendBeacon 进行同步上报（如果浏览器支持）
      if (navigator.sendBeacon) {
        const blob = new Blob(
          [
            JSON.stringify({
              errors: reportQueue,
              clientVersion: '1.0.0',
              clientType: 'web'
            })
          ],
          { type: 'application/json' }
        )

        navigator.sendBeacon('/api/error-report/sync', blob)
      }
    }
  })
}
