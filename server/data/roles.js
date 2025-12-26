/**
 * 角色数据存储
 *
 * @module server/data/roles
 */

/**
 * 角色数据
 * 实际项目中应该从数据库读取
 */
export const roles = [
  {
    roleId: 1,
    roleName: '超级管理员',
    roleCode: 'super',
    description: '拥有所有页面和按钮权限的超级管理员',
    enabled: true,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    roleId: 2,
    roleName: '管理员',
    roleCode: 'admin',
    description: '只拥有仪表盘、结果页面、异常页面和按钮查看权限',
    enabled: true,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    roleId: 3,
    roleName: '普通用户',
    roleCode: 'user',
    description: '只拥有仪表盘',
    enabled: true,
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  }
]

/**
 * 获取所有角色
 * @returns {Array} 角色列表
 */
export function getAllRoles() {
  return roles
}

/**
 * 根据条件过滤角色
 * @param {object} filters - 过滤条件
 * @returns {Array} 过滤后的角色列表
 */
export function filterRoles(filters) {
  let result = [...roles]

  if (filters.roleName) {
    result = result.filter((role) => role.roleName.includes(filters.roleName))
  }

  if (filters.roleCode) {
    result = result.filter((role) => role.roleCode.includes(filters.roleCode))
  }

  if (filters.description) {
    result = result.filter((role) => role.description?.includes(filters.description))
  }

  if (filters.enabled !== undefined && filters.enabled !== null && filters.enabled !== '') {
    const enabled =
      filters.enabled === '1' || filters.enabled === true || filters.enabled === 'true'
    result = result.filter((role) => role.enabled === enabled)
  }

  return result
}
