/**
 * 用户路由
 * 处理用户信息相关接口
 *
 * @module server/routes/user
 */

import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { findUserById } from '../data/users.js'

export const userRouter = express.Router()

// 所有用户路由都需要认证
userRouter.use(authenticateToken)

/**
 * 获取当前用户信息
 * GET /api/user/info
 *
 * 请求头:
 * Authorization: Bearer <accessToken>
 *
 * 响应:
 * {
 *   "code": 200,
 *   "msg": "获取成功",
 *   "data": {
 *     "userId": 1,
 *     "userName": "admin",
 *     "email": "admin@example.com",
 *     "avatar": "",
 *     "roles": ["R_SUPER"],
 *     "buttons": ["add", "edit", "delete", "view", "export", "import"]
 *   }
 * }
 */
userRouter.get('/info', async (req, res, next) => {
  try {
    // 从认证中间件中获取用户 ID
    const { userId } = req.user

    // 查找用户
    const user = findUserById(userId)

    if (!user) {
      return res.status(404).json({
        code: 404,
        msg: '用户不存在',
        data: null
      })
    }

    // 返回用户信息（不包含密码）
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userInfo } = user

    // 确保返回的字段名与前端期望一致
    const responseData = {
      userId: userInfo.userId,
      userName: userInfo.userName,
      email: userInfo.userEmail || userInfo.email,
      avatar: userInfo.avatar || '',
      roles: userInfo.roles || [],
      buttons: userInfo.buttons || []
    }

    res.json({
      code: 200,
      msg: '获取成功',
      data: responseData
    })
  } catch (error) {
    next(error)
  }
})
