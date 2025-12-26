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
    const { errors, clientVersion, clientType } = req.body

    if (!Array.isArray(errors) || errors.length === 0) {
      return res.status(400).json({
        success: false,
        message: '错误数据格式不正确'
      })
    }

    console.log(`[ErrorReport] 收到 ${errors.length} 条错误报告`)

    // 读取现有日志
    await ensureErrorLogFile()
    const logData = await readErrorLogs()

    // 处理每条错误记录
    const processedErrors = errors.map((error) => ({
      id: error.id || `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: error.type,
      message: error.message,
      source: error.source,
      lineno: error.lineno,
      colno: error.colno,
      stack: error.stack,
      timestamp: error.timestamp,
      sessionId: error.sessionId,
      userId: error.userId,
      deviceInfo: error.deviceInfo,
      url: error.url,
      userAgent: error.userAgent,
      referrer: error.referrer,
      screenResolution: error.screenResolution,
      viewportSize: error.viewportSize,
      clientVersion: clientVersion || 'unknown',
      clientType: clientType || 'unknown',
      serverReceivedAt: new Date().toISOString(),
      // 如果是图片类型的错误，需要特殊处理
      ...(error.imageData && {
        imageData: error.imageData,
        imageName: error.imageName,
        imageSize: error.imageSize,
        imageType: error.imageType
      })
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
      success: true,
      message: `成功接收 ${processedErrors.length} 条错误报告`,
      receivedCount: processedErrors.length
    })
  } catch (error) {
    console.error('[ErrorReport] 处理错误报告失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      success: true,
      data: logData.summary
    })
  } catch (error) {
    console.error('[ErrorReport] 获取统计信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取统计信息失败'
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
      success: true,
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
      success: false,
      message: '获取错误日志失败'
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
