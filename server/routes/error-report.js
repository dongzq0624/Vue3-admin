/**
 * 错误上报路由
 *
 * 处理前端错误监控数据上报
 */

import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()

// 明确声明这些路由不需要认证
router.use((req, res, next) => {
  // 跳过认证检查
  next()
})
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 存储错误数据的文件路径
const ERROR_LOG_PATH = path.join(__dirname, '../data/error-logs.json')

/**
 * 确保错误日志文件存在
 */
async function ensureErrorLogFile() {
  try {
    await fs.access(ERROR_LOG_PATH)
  } catch (error) {
    console.error('确保错误日志文件存在失败:', error)
    // 文件不存在，创建初始结构
    await fs.writeFile(
      ERROR_LOG_PATH,
      JSON.stringify(
        {
          logs: [],
          summary: {
            totalErrors: 0,
            errorTypes: {},
            dailyStats: {},
            lastUpdated: new Date().toISOString()
          }
        },
        null,
        2
      )
    )
  }
}

/**
 * 读取错误日志
 */
async function readErrorLogs() {
  try {
    const data = await fs.readFile(ERROR_LOG_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取错误日志失败:', error)
    return {
      logs: [],
      summary: { totalErrors: 0, errorTypes: {}, dailyStats: {}, lastUpdated: '' }
    }
  }
}

/**
 * 保存错误日志
 */
async function saveErrorLogs(data) {
  try {
    await fs.writeFile(ERROR_LOG_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('保存错误日志失败:', error)
  }
}

/**
 * POST /api/error-report
 * 接收前端错误上报
 */
router.post('/error-report', async (req, res) => {
  try {
    const body = req.body

    // 处理SDK上报的数据格式 (TransportDataType)
    let errors = []
    let clientVersion = 'unknown'
    let clientType = 'web'

    // 检查是否是SDK上报的数据格式
    if (body.authInfo && body.data) {
      // SDK格式: { authInfo, data, breadcrumb, deviceInfo }
      errors = [body.data] // 将单个错误包装成数组
      clientVersion = '3.0.1' // 默认版本
      clientType = 'web'
    } else {
      // 原有格式: { errors, clientVersion, clientType }
      const { errors: bodyErrors, clientVersion: bodyVersion, clientType: bodyType } = body
      errors = bodyErrors
      clientVersion = bodyVersion || 'unknown'
      clientType = bodyType || 'web'
    }

    console.log('[ErrorReport] 处理后的errors:', errors)

    if (!Array.isArray(errors) || errors.length === 0) {
      return res.status(400).json({
        code: 400,
        msg: '错误数据格式不正确',
        data: null
      })
    }

    console.log(`[ErrorReport] 收到 ${errors.length} 条错误报告`)

    // 读取现有日志
    await ensureErrorLogFile()
    const logData = await readErrorLogs()

    // 处理每条错误记录
    const processedErrors = errors.map((error) => ({
      id: error.errorId
        ? `sdk_${error.errorId}`
        : `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: error.type || 'unknown_error',
      message: error.message || 'Unknown error',
      source: error.url || window?.location?.href || 'unknown',
      lineno: error.lineno || 0,
      colno: error.colno || 0,
      stack: error.stack || '',
      timestamp: error.time || Date.now(),
      sessionId: 'session_' + Date.now(),
      userId: 'user_unknown',
      deviceInfo: {
        platform: 'Node.js Server',
        language: 'Unknown',
        cookieEnabled: false,
        online: true,
        timezone: 'UTC'
      },
      url: error.url || 'unknown',
      userAgent: 'Node.js Server',
      referrer: '',
      screenResolution: '0x0',
      viewportSize: '0x0',
      clientVersion: clientVersion || '3.0.1',
      clientType: clientType || 'web',
      serverReceivedAt: new Date().toISOString()
    }))

    // 添加到日志列表
    logData.logs.unshift(...processedErrors)

    // 限制日志数量，避免文件过大
    const MAX_LOGS = 10000
    if (logData.logs.length > MAX_LOGS) {
      logData.logs = logData.logs.slice(0, MAX_LOGS)
    }

    // 更新统计信息
    updateErrorSummary(logData, processedErrors)

    // 保存到文件
    await saveErrorLogs(logData)

    console.log(`[ErrorReport] 成功处理 ${processedErrors.length} 条错误记录`)

    res.json({
      code: 200,
      msg: `成功接收 ${processedErrors.length} 条错误报告`,
      data: {
        receivedCount: processedErrors.length
      }
    })
  } catch (error) {
    console.error('[ErrorReport] 处理错误报告失败:', error)
    res.status(500).json({
      code: 500,
      msg: '服务器内部错误',
      data: null
    })
  }
})

/**
 * POST /api/error-report/sync
 * 同步上报接口（用于页面卸载时的最后上报）
 */
router.post('/error-report/sync', async (req, res) => {
  // 对于同步上报，直接处理但不返回响应（sendBeacon 不需要响应）
  try {
    const { errors } = req.body

    if (!Array.isArray(errors) || errors.length === 0) {
      return res.status(400).send('Invalid data')
    }

    console.log(`[ErrorReport] 同步上报收到 ${errors.length} 条错误`)

    // 异步处理，不阻塞响应
    setImmediate(async () => {
      try {
        await ensureErrorLogFile()
        const logData = await readErrorLogs()

        const processedErrors = errors.map((error) => ({
          ...error,
          serverReceivedAt: new Date().toISOString(),
          syncReport: true // 标记为同步上报
        }))

        logData.logs.unshift(...processedErrors)

        const MAX_LOGS = 10000
        if (logData.logs.length > MAX_LOGS) {
          logData.logs = logData.logs.slice(0, MAX_LOGS)
        }

        updateErrorSummary(logData, processedErrors)
        await saveErrorLogs(logData)

        console.log(`[ErrorReport] 同步上报处理完成 ${processedErrors.length} 条`)
      } catch (error) {
        console.error('[ErrorReport] 同步上报处理失败:', error)
      }
    })

    res.status(200).send('OK')
  } catch (error) {
    console.error('[ErrorReport] 同步上报接口错误:', error)
    res.status(500).send('Internal Server Error')
  }
})

/**
 * GET /api/error-report/stats
 * 获取错误统计信息
 */
router.get('/error-report/stats', async (req, res) => {
  try {
    await ensureErrorLogFile()
    const logData = await readErrorLogs()

    res.json({
      code: 200,
      msg: '获取统计信息成功',
      data: logData
    })
  } catch (error) {
    console.error('[ErrorReport] 获取统计信息失败:', error)
    res.status(500).json({
      code: 500,
      msg: '获取统计信息失败',
      data: null
    })
  }
})

/**
 * GET /api/error-report/logs
 * 获取错误日志列表（分页）
 */
router.get('/error-report/logs', async (req, res) => {
  try {
    const { page = 1, pageSize = 50, type, startDate, endDate } = req.query

    await ensureErrorLogFile()
    const logData = await readErrorLogs()

    let filteredLogs = logData.logs

    // 按类型过滤
    if (type) {
      filteredLogs = filteredLogs.filter((log) => log.type === type)
    }

    // 按时间范围过滤
    if (startDate || endDate) {
      filteredLogs = filteredLogs.filter((log) => {
        const logTime = new Date(log.timestamp)
        const start = startDate ? new Date(startDate) : new Date(0)
        const end = endDate ? new Date(endDate) : new Date()

        return logTime >= start && logTime <= end
      })
    }

    // 分页
    const total = filteredLogs.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + parseInt(pageSize)
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex)

    res.json({
      code: 200,
      msg: '获取错误日志成功',
      data: {
        logs: paginatedLogs,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    })
  } catch (error) {
    console.error('[ErrorReport] 获取错误日志失败:', error)
    res.status(500).json({
      code: 500,
      msg: '获取错误日志失败',
      data: null
    })
  }
})

/**
 * 更新错误统计摘要
 */
function updateErrorSummary(logData, newErrors) {
  const summary = logData.summary

  // 更新总数
  summary.totalErrors += newErrors.length
  summary.lastUpdated = new Date().toISOString()

  // 更新错误类型统计
  newErrors.forEach((error) => {
    summary.errorTypes[error.type] = (summary.errorTypes[error.type] || 0) + 1
  })

  // 更新每日统计
  const today = new Date().toISOString().split('T')[0]
  if (!summary.dailyStats[today]) {
    summary.dailyStats[today] = {
      date: today,
      total: 0,
      types: {}
    }
  }

  summary.dailyStats[today].total += newErrors.length
  newErrors.forEach((error) => {
    summary.dailyStats[today].types[error.type] =
      (summary.dailyStats[today].types[error.type] || 0) + 1
  })
}

export default router
