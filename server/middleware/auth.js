/**
 * JWT 认证中间件
 * 验证请求中的 accessToken
 *
 * @module server/middleware/auth
 */

import { extractTokenFromHeader, verifyAccessToken } from '../utils/jwt.js'

/**
 * JWT 认证中间件
 * 验证请求头中的 accessToken，验证通过后将用户信息添加到 req.user
 */
export function authenticateToken(req, res, next) {
  // 提取 token
  const token = extractTokenFromHeader(req)

  if (!token) {
    return res.status(401).json({
      code: 401,
      msg: '未提供访问令牌',
      data: null
    })
  }

  // 验证 token
  const decoded = verifyAccessToken(token)

  if (!decoded) {
    return res.status(401).json({
      code: 401,
      msg: '访问令牌无效或已过期',
      data: null
    })
  }

  // 将用户信息添加到请求对象
  req.user = decoded

  next()
}
