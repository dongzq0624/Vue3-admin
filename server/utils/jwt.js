/**
 * JWT Token 工具函数
 * 用于生成和验证 accessToken 和 refreshToken
 *
 * @module server/utils/jwt
 */

import jwt from 'jsonwebtoken'

/**
 * 从环境变量获取配置值
 * 支持多种命名方式，优先级：VITE_* > JWT_* > 简化命名
 * 与前端环境变量命名保持一致
 */
function getEnvValue(viteKey, jwtKey, simpleKey, defaultValue) {
  return process.env[viteKey] || process.env[jwtKey] || process.env[simpleKey] || defaultValue
}

// JWT 密钥（从环境变量读取，支持多种命名方式）
const ACCESS_TOKEN_SECRET = getEnvValue(
  'VITE_JWT_ACCESS_TOKEN_SECRET',
  'JWT_ACCESS_TOKEN_SECRET',
  'ACCESS_TOKEN_SECRET',
  'default-access-secret'
)

const REFRESH_TOKEN_SECRET = getEnvValue(
  'VITE_JWT_REFRESH_TOKEN_SECRET',
  'JWT_REFRESH_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'default-refresh-secret'
)

// Token 过期时间（从环境变量读取）
const ACCESS_TOKEN_EXPIRES_IN = getEnvValue(
  'VITE_JWT_ACCESS_TOKEN_EXPIRES_IN',
  'JWT_ACCESS_TOKEN_EXPIRES_IN',
  'ACCESS_TOKEN_EXPIRES_IN',
  '2h' // 默认 2 小时
)

const REFRESH_TOKEN_EXPIRES_IN = getEnvValue(
  'VITE_JWT_REFRESH_TOKEN_EXPIRES_IN',
  'JWT_REFRESH_TOKEN_EXPIRES_IN',
  'REFRESH_TOKEN_EXPIRES_IN',
  '7d' // 默认 7 天
)

/**
 * 生成 accessToken
 * @param {object} payload - Token 载荷（用户信息）
 * @returns {string} accessToken
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  })
}

/**
 * 生成 refreshToken
 * @param {object} payload - Token 载荷（用户信息）
 * @returns {string} refreshToken
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  })
}

/**
 * 验证 accessToken
 * @param {string} token - accessToken
 * @returns {object|null} 解码后的 payload，验证失败返回 null
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET)
  } catch {
    return null
  }
}

/**
 * 验证 refreshToken
 * @param {string} token - refreshToken
 * @returns {object|null} 解码后的 payload，验证失败返回 null
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET)
  } catch {
    return null
  }
}

/**
 * 从请求头中提取 token
 * @param {object} req - Express 请求对象
 * @returns {string|null} token 字符串，不存在返回 null
 */
export function extractTokenFromHeader(req) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return null
  }

  // 支持 "Bearer <token>" 格式
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // 也支持直接传递 token
  return authHeader
}
