/**
 * 菜单数据存储
 *
 * @module server/data/menus
 */

/**
 * 菜单数据
 * 实际项目中应该从数据库读取
 */
export const menus = [
  {
    id: 1,
    path: '/dashboard',
    name: 'Dashboard',
    component: '/index/index',
    meta: {
      title: 'menus.dashboard.title',
      icon: 'ri:dashboard-line',
      isHide: false,
      isHideTab: false,
      keepAlive: true
    },
    children: [
      {
        id: 11,
        path: 'console',
        name: 'Console',
        component: '/dashboard/console',
        meta: {
          title: 'menus.dashboard.console',
          icon: 'ri:computer-line',
          isHide: false,
          isHideTab: false,
          keepAlive: true
        }
      }
    ]
  },
  {
    id: 2,
    path: '/system',
    name: 'System',
    component: '/index/index',
    meta: {
      title: 'menus.system.title',
      icon: 'ri:user-3-line',
      isHide: false,
      isHideTab: false,
      keepAlive: false,
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      {
        id: 21,
        path: 'user',
        name: 'User',
        component: '/system/user',
        meta: {
          title: 'menus.system.user',
          icon: 'ri:user-line',
          isHide: false,
          isHideTab: false,
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      },
      {
        id: 22,
        path: 'role',
        name: 'Role',
        component: '/system/role',
        meta: {
          title: 'menus.system.role',
          icon: 'ri:admin-line',
          isHide: false,
          isHideTab: false,
          keepAlive: true,
          roles: ['R_SUPER']
        }
      },
      {
        id: 23,
        path: 'menu',
        name: 'Menus',
        component: '/system/menu',
        meta: {
          title: 'menus.system.menu',
          icon: 'ri:menu-line',
          isHide: false,
          isHideTab: false,
          keepAlive: true,
          roles: ['R_SUPER']
        }
      }
    ]
  },
  {
    id: 3,
    path: '/result',
    name: 'Result',
    component: '/index/index',
    meta: {
      title: 'menus.result.title',
      icon: 'ri:checkbox-circle-line',
      isHide: false,
      isHideTab: false,
      keepAlive: false,
      roles: ['R_SUPER']
    },
    children: [
      {
        id: 31,
        path: 'success',
        name: 'ResultSuccess',
        component: '/result/success',
        meta: {
          title: 'menus.result.success',
          icon: 'ri:checkbox-circle-line',
          isHide: false,
          isHideTab: false,
          keepAlive: true,
          roles: ['R_SUPER']
        }
      },
      {
        id: 32,
        path: 'fail',
        name: 'ResultFail',
        component: '/result/fail',
        meta: {
          title: 'menus.result.fail',
          icon: 'ri:close-circle-line',
          isHide: false,
          isHideTab: false,
          keepAlive: true,
          roles: ['R_SUPER']
        }
      }
    ]
  },
  {
    id: 4,
    path: '/exception',
    name: 'Exception',
    component: '/index/index',
    meta: {
      title: 'menus.exception.title',
      icon: 'ri:error-warning-line',
      isHide: false,
      isHideTab: false,
      keepAlive: false,
      roles: ['R_SUPER']
    },
    children: [
      {
        id: 41,
        path: '403',
        name: 'Exception403',
        component: '/exception/403',
        meta: {
          title: 'menus.exception.forbidden',
          icon: 'ri:error-warning-line',
          isHide: false,
          isHideTab: true,
          keepAlive: true,
          isFullPage: true,
          roles: ['R_SUPER']
        }
      },
      {
        id: 42,
        path: '404',
        name: 'Exception404',
        component: '/exception/404',
        meta: {
          title: 'menus.exception.notFound',
          icon: 'ri:error-warning-line',
          isHide: false,
          isHideTab: true,
          keepAlive: true,
          isFullPage: true,
          roles: ['R_SUPER']
        }
      },
      {
        id: 43,
        path: '500',
        name: 'Exception500',
        component: '/exception/500',
        meta: {
          title: 'menus.exception.serverError',
          icon: 'ri:error-warning-line',
          isHide: false,
          isHideTab: true,
          keepAlive: true,
          isFullPage: true,
          roles: ['R_SUPER']
        }
      }
    ]
  },
  {
    id: 5,
    path: '/error-dashboard',
    name: 'ErrorDashboard',
    component: '/error-dashboard',
    meta: {
      title: '错误监控大屏',
      icon: 'ri:dashboard-line',
      isHide: true,
      isHideTab: false,
      keepAlive: true,
      roles: ['R_SUPER']
    }
  }
]

/**
 * 获取所有菜单
 * @returns {Array} 菜单列表
 */
export function getAllMenus() {
  return menus
}
