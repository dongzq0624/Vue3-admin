import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { errorDashboardRoutes } from './error-dashboard'

/**
 * 导出所有模块化路由
 */
export const routeModules = [
  dashboardRoutes,
  systemRoutes,
  resultRoutes,
  exceptionRoutes,
  errorDashboardRoutes
]
