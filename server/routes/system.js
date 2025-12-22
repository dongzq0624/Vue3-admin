/**
 * 系统管理路由
 * 处理用户列表、角色列表、菜单列表等接口
 *
 * @module server/routes/system
 */

import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { getAllUsers, filterUsers } from '../data/users.js'
import { filterRoles } from '../data/roles.js'
import { getAllMenus } from '../data/menus.js'

export const systemRouter = express.Router()

// 所有系统管理路由都需要认证
systemRouter.use(authenticateToken)

/**
 * 获取用户列表（分页）
 * GET /api/user/list
 *
 * 查询参数:
 * - current: 当前页码（默认 1）
 * - size: 每页数量（默认 20）
 * - userName: 用户名（模糊搜索）
 * - userGender: 性别
 * - userPhone: 手机号（模糊搜索）
 * - userEmail: 邮箱（模糊搜索）
 * - status: 状态（'1': 在线, '2': 离线, '3': 异常, '4': 注销）
 *
 * 响应:
 * {
 *   "code": 200,
 *   "msg": "获取成功",
 *   "data": {
 *     "records": [...],
 *     "total": 100,
 *     "current": 1,
 *     "size": 20
 *   }
 * }
 */
systemRouter.get('/user/list', async (req, res, next) => {
  try {
    const { current = 1, size = 20, userName, userGender, userPhone, userEmail, status } = req.query

    // 构建过滤条件
    const filters = {}
    if (userName) filters.userName = userName
    if (userGender) filters.userGender = userGender
    if (userPhone) filters.userPhone = userPhone
    if (userEmail) filters.userEmail = userEmail
    if (status) filters.status = status

    // 获取所有用户并过滤
    let filteredUsers = getAllUsers()

    // 应用过滤条件
    if (Object.keys(filters).length > 0) {
      filteredUsers = filterUsers(filters)
    }

    // 分页处理
    const page = parseInt(current, 10)
    const pageSize = parseInt(size, 10)
    const start = (page - 1) * pageSize
    const end = start + pageSize

    const records = filteredUsers.slice(start, end)
    const total = filteredUsers.length

    // 移除密码字段
    /* eslint-disable no-unused-vars */
    const safeRecords = records.map((user) => {
      const { password, ...safeUser } = user
      return safeUser
    })
    /* eslint-enable no-unused-vars */

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        records: safeRecords,
        total,
        current: page,
        size: pageSize
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 获取角色列表（分页）
 * GET /api/role/list
 *
 * 查询参数:
 * - current: 当前页码（默认 1）
 * - size: 每页数量（默认 20）
 * - roleName: 角色名称（模糊搜索）
 * - roleCode: 角色编码（模糊搜索）
 * - description: 角色描述（模糊搜索）
 * - enabled: 是否启用（'1'/'true': 启用, '0'/'false': 禁用）
 *
 * 响应:
 * {
 *   "code": 200,
 *   "msg": "获取成功",
 *   "data": {
 *     "records": [...],
 *     "total": 10,
 *     "current": 1,
 *     "size": 20
 *   }
 * }
 */
systemRouter.get('/role/list', async (req, res, next) => {
  try {
    const { current = 1, size = 20, roleName, roleCode, description, enabled } = req.query

    // 构建过滤条件
    const filters = {}
    if (roleName) filters.roleName = roleName
    if (roleCode) filters.roleCode = roleCode
    if (description) filters.description = description
    if (enabled !== undefined && enabled !== null && enabled !== '') {
      filters.enabled = enabled
    }

    // 获取并过滤角色
    let filteredRoles = filterRoles(filters)

    // 分页处理
    const page = parseInt(current, 10)
    const pageSize = parseInt(size, 10)
    const start = (page - 1) * pageSize
    const end = start + pageSize

    const records = filteredRoles.slice(start, end)
    const total = filteredRoles.length

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        records,
        total,
        current: page,
        size: pageSize
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * 获取菜单列表
 * GET /api/v3/system/menus/simple
 *
 * 响应:
 * {
 *   "code": 200,
 *   "msg": "获取成功",
 *   "data": [...]
 * }
 */
systemRouter.get('/v3/system/menus/simple', async (req, res, next) => {
  try {
    const menus = getAllMenus()

    res.json({
      code: 200,
      msg: '获取成功',
      data: menus
    })
  } catch (error) {
    next(error)
  }
})
