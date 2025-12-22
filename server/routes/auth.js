/**
 * 认证路由
 * 处理登录和 token 刷新
 *
 * @module server/routes/auth
 */

import express from 'express'
import { findUserByUserName, verifyPassword } from '../data/users.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js'

export const authRouter = express.Router()

/**
 * 用户登录
 * POST /api/auth/login
 *
 * 请求体:
 * {
 *   "userName": "admin",
 *   "password": "123456"
 * }
 *
 * 响应:
 * {
 *   "code": 200,
 *   "msg": "登录成功",
 *   "data": {
 *     "token": "accessToken...",
 *     "refreshToken": "refreshToken..."
 *   }
 * }
 */
authRouter.post('/login', async (req, res, next) => {
  try {
    const { userName, password } = req.body

    // 验证参数
    if (!userName || !password) {
      return res.status(400).json({
        code: 400,
        msg: '用户名和密码不能为空',
        data: null
      })
    }

    // 查找用户
    const user = findUserByUserName(userName)

    if (!user) {
      return res.status(401).json({
        code: 401,
        msg: '用户名或密码错误',
        data: null
      })
    }

    // 验证密码
    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({
        code: 401,
        msg: '用户名或密码错误',
        data: null
      })
    }

    // 生成 token 载荷（不包含敏感信息）
    const tokenPayload = {
      userId: user.userId,
      userName: user.userName,
      email: user.userEmail || user.email || ''
    }

    // 生成 accessToken 和 refreshToken
    const token = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    // 返回成功响应
    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        token,
        refreshToken
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 刷新 accessToken
 * POST /api/auth/refresh
 *
 * 请求体:
 * {
 *   "refreshToken": "refreshToken..."
 * }
 *
 * 响应:
 * {
 *   "code": 200,
 *   "msg": "刷新成功",
 *   "data": {
 *     "token": "newAccessToken..."
 *   }
 * }
 */
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken: refreshTokenFromBody } = req.body

    // 验证参数
    if (!refreshTokenFromBody) {
      return res.status(400).json({
        code: 400,
        msg: 'refreshToken 不能为空',
        data: null
      })
    }

    // 验证 refreshToken
    const decoded = verifyRefreshToken(refreshTokenFromBody)

    if (!decoded) {
      return res.status(401).json({
        code: 401,
        msg: 'refreshToken 无效或已过期',
        data: null
      })
    }

    // 生成新的 token 载荷
    const tokenPayload = {
      userId: decoded.userId,
      userName: decoded.userName,
      email: decoded.email || ''
    }

    // 生成新的 accessToken
    const newAccessToken = generateAccessToken(tokenPayload)

    // 返回成功响应
    res.json({
      code: 200,
      msg: '刷新成功',
      data: {
        token: newAccessToken
      }
    })
  } catch (error) {
    next(error)
  }
})
