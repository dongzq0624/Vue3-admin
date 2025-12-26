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

// 注意：不在路由器级别应用全局认证中间件
// 而是在具体的路由处理函数中根据需要应用

/**
 * 根据用户角色过滤菜单
 * @param {Array} menus - 所有菜单数据
 * @param {Array} userRoles - 用户角色列表
 * @returns {Array} 过滤后的菜单数据
 */
function filterMenusByRoles(menus, userRoles) {
  return menus
    .map((menu) => {
      // 检查当前菜单是否有权限
      const hasPermission = checkMenuPermission(menu, userRoles)

      if (!hasPermission) {
        return null // 无权限访问的菜单不返回
      }

      // 如果有子菜单，递归过滤
      let filteredMenu = { ...menu }
      if (menu.children && menu.children.length > 0) {
        const filteredChildren = filterMenusByRoles(menu.children, userRoles)
        filteredMenu.children = filteredChildren.filter((child) => child !== null)

        // 如果过滤后没有子菜单了，但这个菜单是目录类型（有children属性），且有权限，则保留
        // 或者如果有直接访问权限，也保留
        if (filteredMenu.children.length === 0 && !hasDirectAccess(menu, userRoles)) {
          // 检查是否是目录菜单（有children属性定义），如果是则保留
          if (menu.children && Array.isArray(menu.children)) {
            // 保留空目录菜单，让前端处理显示逻辑
          } else {
            return null
          }
        }
      }

      return filteredMenu
    })
    .filter((menu) => menu !== null)
}

/**
 * 检查菜单是否有权限访问
 * @param {Object} menu - 菜单对象
 * @param {Array} userRoles - 用户角色列表
 * @returns {boolean} 是否有权限
 */
function checkMenuPermission(menu, userRoles) {
  // 如果菜单没有设置角色限制，所有用户都可以访问
  if (!menu.meta || !menu.meta.roles || menu.meta.roles.length === 0) {
    return true
  }

  // 检查用户角色是否与菜单角色有交集
  return menu.meta.roles.some((role) => userRoles.includes(role))
}

/**
 * 检查菜单是否有直接访问权限（不考虑子菜单）
 * @param {Object} menu - 菜单对象
 * @param {Array} userRoles - 用户角色列表
 * @returns {boolean} 是否有直接访问权限
 */
function hasDirectAccess(menu, userRoles) {
  // 如果菜单没有设置角色限制，或者用户角色与菜单角色有交集
  if (!menu.meta || !menu.meta.roles || menu.meta.roles.length === 0) {
    return true
  }

  // 检查用户角色是否与菜单角色有交集
  const hasRolePermission = menu.meta.roles.some((role) => userRoles.includes(role))

  // 如果有角色权限，且菜单有有效的component（包括布局组件），则有直接访问权限
  if (hasRolePermission && menu.component && menu.component !== '') {
    return true
  }

  return false
}

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
systemRouter.get('/user/list', authenticateToken, async (req, res, next) => {
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
systemRouter.get('/role/list', authenticateToken, async (req, res, next) => {
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
systemRouter.get('/v3/system/menus/simple', authenticateToken, async (req, res, next) => {
  try {
    // 获取用户的角色信息
    const userRoles = req.user?.roles || []

    // 获取所有菜单
    const allMenus = getAllMenus()

    // 根据用户角色过滤菜单
    const filteredMenus = filterMenusByRoles(allMenus, userRoles)

    res.json({
      code: 200,
      msg: '获取成功',
      data: filteredMenus
    })
  } catch (error) {
    next(error)
  }
})
