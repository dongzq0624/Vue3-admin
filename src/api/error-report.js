/**
 * 错误报告 API 接口
 *
 * 提供与服务端错误报告相关的接口调用
 */

import api from '@/utils/http'

/**
 * 获取错误统计信息
 * @returns {Promise} 错误统计数据
 */
export function getErrorStats() {
  return api.request({
    url: '/api/error-report/stats',
    method: 'get'
  })
}

/**
 * 获取错误日志列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.type - 错误类型过滤
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise} 错误日志列表
 */
export function getErrorLogs(params = {}) {
  return api.request({
    url: '/api/error-report/logs',
    method: 'get',
    params
  })
}

/**
 * 上报错误信息到服务端（手动上报）
 * @param {Array} errors - 错误信息数组
 * @returns {Promise} 上报结果
 */
export function reportErrors(errors) {
  return api.request({
    url: '/api/error-report',
    method: 'post',
    data: {
      errors,
      clientVersion: '1.0.0',
      clientType: 'web'
    }
  })
}

/**
 * 获取错误趋势数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise} 错误趋势数据
 */
export function getErrorTrends(params = {}) {
  return api.request({
    url: '/api/error-report/trends',
    method: 'get',
    params
  })
}

/**
 * 获取错误类型分布
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise} 错误类型分布数据
 */
export function getErrorDistribution(params = {}) {
  return api.request({
    url: '/api/error-report/distribution',
    method: 'get',
    params
  })
}

/**
 * 删除指定的错误记录
 * @param {string} errorId - 错误ID
 * @returns {Promise} 删除结果
 */
export function deleteError(errorId) {
  return api.request({
    url: `/api/error-report/logs/${errorId}`,
    method: 'delete'
  })
}

/**
 * 批量删除错误记录
 * @param {Array} errorIds - 错误ID数组
 * @returns {Promise} 删除结果
 */
export function batchDeleteErrors(errorIds) {
  return api.request({
    url: '/api/error-report/logs/batch',
    method: 'delete',
    data: { errorIds }
  })
}

/**
 * 导出错误报告
 * @param {Object} params - 导出参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.type - 错误类型
 * @param {string} params.format - 导出格式 (csv, json, excel)
 * @returns {Promise} 导出结果
 */
export function exportErrors(params = {}) {
  return api.request({
    url: '/api/error-report/export',
    method: 'get',
    params: {
      ...params,
      format: params.format || 'csv'
    },
    responseType: 'blob' // 对于文件下载
  })
}
