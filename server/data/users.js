/**
 * 用户数据存储
 * 包含用户信息、角色和按钮权限配置
 *
 * @module server/data/users
 */

/**
 * 用户数据
 * 实际项目中应该从数据库读取
 */
export const users = [
  {
    userId: 1,
    userName: 'admin',
    password: '123456', // 实际项目中应该使用 bcrypt 加密存储
    userEmail: 'admin@example.com',
    userPhone: '13800138000',
    userGender: 'male',
    avatar: '',
    status: '1', // '1': 在线, '2': 离线, '3': 异常, '4': 注销
    roles: ['R_SUPER'], // 超级管理员角色
    buttons: ['add', 'edit', 'delete', 'view', 'export', 'import'], // 所有按钮权限
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    userId: 2,
    userName: 'user',
    password: '123456',
    userEmail: 'user@example.com',
    userPhone: '13800138001',
    userGender: 'female',
    avatar: '',
    status: '1',
    roles: ['R_USER'], // 普通用户角色
    buttons: ['view'], // 只有查看权限
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    userId: 3,
    userName: 'manager',
    password: '123456',
    userEmail: 'manager@example.com',
    userPhone: '13800138002',
    userGender: 'male',
    avatar: '',
    status: '2',
    roles: ['R_ADMIN'], // 管理员角色
    buttons: ['add', 'edit', 'view', 'export'], // 部分按钮权限
    createTime: '2024-01-01 00:00:00',
    updateTime: '2024-01-01 00:00:00'
  },
  {
    userId: 4,
    userName: 'test1',
    password: '123456',
    userEmail: 'test1@example.com',
    userPhone: '13800138003',
    userGender: 'unknown',
    avatar: '',
    status: '1',
    roles: ['R_USER'],
    buttons: ['view'],
    createTime: '2024-01-02 00:00:00',
    updateTime: '2024-01-02 00:00:00'
  },
  {
    userId: 5,
    userName: 'test2',
    password: '123456',
    userEmail: 'test2@example.com',
    userPhone: '13800138004',
    userGender: 'female',
    avatar: '',
    status: '3',
    roles: ['R_USER'],
    buttons: ['view'],
    createTime: '2024-01-03 00:00:00',
    updateTime: '2024-01-03 00:00:00'
  }
]

/**
 * 根据用户名查找用户
 * @param {string} userName - 用户名
 * @returns {object|null} 用户对象，不存在返回 null
 */
export function findUserByUserName(userName) {
  return users.find((user) => user.userName === userName) || null
}

/**
 * 根据用户 ID 查找用户
 * @param {number} userId - 用户 ID
 * @returns {object|null} 用户对象，不存在返回 null
 */
export function findUserById(userId) {
  return users.find((user) => user.userId === userId) || null
}

/**
 * 验证用户密码
 * @param {string} inputPassword - 输入的密码
 * @param {string} storedPassword - 存储的密码
 * @returns {boolean} 密码是否正确
 */
export function verifyPassword(inputPassword, storedPassword) {
  // 实际项目中应该使用 bcrypt.compare
  // 这里为了简化，直接比较（生产环境必须使用加密）
  return inputPassword === storedPassword
}

/**
 * 获取所有用户
 * @returns {Array} 用户列表
 */
export function getAllUsers() {
  return users
}

/**
 * 根据条件过滤用户
 * @param {object} filters - 过滤条件
 * @returns {Array} 过滤后的用户列表
 */
export function filterUsers(filters) {
  let result = [...users]

  if (filters.userName) {
    result = result.filter((user) => user.userName.includes(filters.userName))
  }

  if (filters.userGender) {
    result = result.filter((user) => user.userGender === filters.userGender)
  }

  if (filters.userPhone) {
    result = result.filter((user) => user.userPhone?.includes(filters.userPhone))
  }

  if (filters.userEmail) {
    result = result.filter((user) => user.userEmail?.includes(filters.userEmail))
  }

  if (filters.status) {
    result = result.filter((user) => user.status === filters.status)
  }

  return result
}
