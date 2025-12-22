/**
 * 错误处理中间件
 * 统一处理应用中的错误
 *
 * @module server/middleware/errorHandler
 */

/**
 * 错误处理中间件
 * @param {Error} err - 错误对象
 * @param {object} req - Express 请求对象
 * @param {object} res - Express 响应对象
 */
export function errorHandler(err, req, res) {
  console.error('[Error]', err)

  // 默认错误响应
  const statusCode = err.statusCode || 500
  const message = err.message || '服务器内部错误'

  res.status(statusCode).json({
    code: statusCode,
    msg: message,
    data: null
  })
}
