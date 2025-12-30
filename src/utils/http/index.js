/**
 * HTTP 请求封装模块
 * 基于 Axios 封装的 HTTP 请求工具，提供统一的请求/响应处理
 *
 * ## 主要功能
 *
 * - 请求/响应拦截器（自动添加 Token、统一错误处理）
 * - 401 未授权自动登出（带防抖机制）
 * - 请求失败自动重试（可配置）
 * - 统一的成功/错误消息提示
 * - 支持 GET/POST/PUT/DELETE 等常用方法
 *
 * ## 使用示例
 *
 * ```javascript
 * import api from '@/utils/http'
 *
 * // GET 请求
 * const data = await api.get({ url: '/user/info' })
 *
 * // POST 请求
 * const result = await api.post({
 *   url: '/user/login',
 *   data: { username, password },
 *   showSuccessMessage: true  // 显示成功消息
 * })
 * ```
 *
 * @module utils/http
 * @author Vue3-Admin Team
 */

import axios from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { $t } from '@/locales'

/**
 * 请求超时时间（毫秒）
 * 超过此时间未响应则自动取消请求
 */
const REQUEST_TIMEOUT = 15000

/**
 * 最大重试次数
 * 请求失败时的自动重试次数，0 表示不重试
 */
const MAX_RETRIES = 0

/**
 * 重试延迟时间（毫秒）
 * 每次重试请求之间的等待时间
 */
const RETRY_DELAY = 1000

/**
 * 401 错误防抖时间（毫秒）
 * 在指定时间内只处理一次 401 错误，避免重复登出
 */
const UNAUTHORIZED_DEBOUNCE_TIME = 3000

/**
 * 401 错误是否已显示标志
 * 用于防抖机制，避免短时间内多次触发登出
 */
let isUnauthorizedErrorShown = false

/**
 * 401 错误防抖定时器
 * 用于在指定时间后重置防抖状态
 */
let unauthorizedTimer = null

/**
 * 刷新令牌的请求状态
 * 用于防止并发请求多次刷新令牌
 */
let isRefreshing = false

/**
 * 等待刷新令牌的请求队列
 * 用于在刷新令牌成功后重试所有失败的请求
 */
let refreshSubscribers = []

/**
 * 从环境变量中获取 API 配置
 * - VITE_API_URL: API 基础地址
 * - VITE_WITH_CREDENTIALS: 是否携带凭证（cookies）
 */
const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

/**
 * 创建 Axios 实例
 * 配置全局的请求参数和响应处理
 */
const axiosInstance = axios.create({
  /** 请求超时时间 */
  timeout: REQUEST_TIMEOUT,
  /** API 基础地址，所有请求都会基于此地址 */
  baseURL: VITE_API_URL,
  /** 是否在跨域请求时携带凭证（cookies） */
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  /** 自定义状态码验证函数，只有 200-299 范围内的状态码才被认为是成功的 */
  validateStatus: (status) => status >= 200 && status < 300,
  /** 响应数据转换器数组，用于在响应拦截器之前处理响应数据 */
  transformResponse: [
    /**
     * 响应数据转换函数
     * 自动将 JSON 字符串解析为对象
     * @param {string} data - 原始响应数据
     * @param {object} headers - 响应头信息
     * @returns {any} 解析后的数据
     */
    (data, headers) => {
      const contentType = headers['content-type']
      // 如果响应类型是 JSON，则尝试解析
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          // 解析失败则返回原始数据
          return data
        }
      }
      // 非 JSON 类型直接返回原始数据
      return data
    }
  ]
})

/**
 * 请求拦截器
 * 在发送请求之前对请求配置进行处理
 */
axiosInstance.interceptors.request.use(
  /**
   * 请求成功拦截器
   * 在请求发送前自动添加认证 Token 和设置请求头
   * @param {object} request - Axios 请求配置对象
   * @returns {object} 处理后的请求配置
   */
  (request) => {
    // 从用户 store 中获取访问令牌
    const { accessToken } = useUserStore()
    // 如果存在访问令牌，则添加到请求头的 Authorization 字段
    if (accessToken) {
      request.headers.set('Authorization', accessToken)
    }

    // 处理请求体数据
    // 如果存在请求数据，且不是 FormData 类型，且未设置 Content-Type，则自动设置
    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      // 设置 JSON 内容类型
      request.headers.set('Content-Type', 'application/json')
      // 将对象转换为 JSON 字符串
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  /**
   * 请求失败拦截器
   * 处理请求配置错误的情况
   * @param {Error} error - 请求配置错误对象
   * @returns {Promise} 拒绝的 Promise，包含错误信息
   */
  (error) => {
    // 显示请求配置错误消息
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 在接收到响应后对响应数据进行统一处理
 */
axiosInstance.interceptors.response.use(
  /**
   * 响应成功拦截器
   * 处理业务层面的成功/失败逻辑
   * @param {object} response - Axios 响应对象
   * @returns {object} 处理后的响应对象
   * @throws {HttpError} 当业务逻辑返回失败时抛出错误
   */
  (response) => {
    // 从响应数据中提取业务状态码和消息
    const { code, msg } = response.data

    // 如果业务状态码为成功（200），直接返回响应
    if (code === ApiStatus.success) {
      return response
    }

    // 如果业务状态码为未授权（401），触发未授权错误处理
    if (code === ApiStatus.unauthorized) {
      handleUnauthorizedError(msg)
    }

    // 其他业务错误，抛出 HttpError
    throw createHttpError(msg || $t('httpMsg.requestFailed'), code)
  },
  /**
   * 响应失败拦截器
   * 处理 HTTP 层面的错误（网络错误、状态码错误等）
   * @param {Error} error - Axios 错误对象
   * @returns {Promise} 拒绝的 Promise，包含处理后的错误信息
   */
  async (error) => {
    // 从错误响应中提取状态码
    const { config, response } = error
    const status = response?.status

    // 如果 HTTP 状态码为 401，尝试刷新令牌
    if (status === ApiStatus.unauthorized) {
      // 如果没有配置信息，直接抛出错误
      if (!config) {
        return Promise.reject(handleError(error))
      }

      // 如果已经在刷新令牌，将请求加入等待队列
      if (isRefreshing) {
        return new Promise((resolve) => {
          // 添加到订阅者队列，等待刷新令牌成功后重试
          addRefreshSubscriber((newAccessToken) => {
            // 更新请求头中的 Authorization
            config.headers.set('Authorization', newAccessToken)
            // 重试请求
            resolve(axiosInstance(config))
          })
        })
      }

      // 标记开始刷新令牌
      isRefreshing = true

      try {
        // 刷新令牌
        const newAccessToken = await refreshAccessToken()

        // 刷新成功，通知所有订阅者重试请求
        notifyRefreshSubscribers(newAccessToken)

        // 更新当前请求的 Authorization 头
        config.headers.set('Authorization', newAccessToken)

        // 重试当前请求
        return axiosInstance(config)
      } catch (refreshError) {
        // 刷新令牌失败，处理错误
        return Promise.reject(handleError(refreshError))
      } finally {
        // 标记刷新令牌结束
        isRefreshing = false
      }
    }

    // 统一处理错误并返回
    return Promise.reject(handleError(error))
  }
)

/**
 * 统一创建 HttpError 错误对象
 * @param {string} message - 错误消息
 * @param {number} code - 错误状态码
 * @returns {HttpError} HttpError 实例
 */
function createHttpError(message, code) {
  return new HttpError(message, code)
}

/**
 * 处理 401 未授权错误（带防抖机制和令牌刷新）
 * 防止短时间内多次触发登出操作，支持自动刷新令牌
 * @param {string} [message] - 可选的错误消息，如果不提供则使用默认消息
 * @throws {HttpError} 始终抛出 HttpError 错误
 */
function handleUnauthorizedError(message) {
  // 创建未授权错误对象
  const error = createHttpError(message || $t('httpMsg.unauthorized'), ApiStatus.unauthorized)

  // 防抖处理：如果错误还未显示过，则执行处理逻辑
  if (!isUnauthorizedErrorShown) {
    // 标记错误已显示，防止重复处理
    isUnauthorizedErrorShown = true

    // 设置定时器，在指定时间后重置防抖状态
    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)

    // 显示错误消息
    showError(error, true)
    // 抛出错误，中断后续处理
    throw error
  }

  // 如果错误已显示过（防抖期内），直接抛出错误
  throw error
}

/**
 * 重置 401 错误防抖状态
 * 在防抖时间结束后调用，允许下次 401 错误时再次触发登出
 */
function resetUnauthorizedError() {
  // 重置防抖标志
  isUnauthorizedErrorShown = false
  // 清除定时器
  if (unauthorizedTimer) {
    clearTimeout(unauthorizedTimer)
    unauthorizedTimer = null
  }
}

/**
 * 判断是否需要重试请求
 * 根据 HTTP 状态码判断是否为可重试的错误（通常是服务器临时错误）
 * @param {number} statusCode - HTTP 状态码
 * @returns {boolean} 是否需要重试
 */
function shouldRetry(statusCode) {
  // 可重试的状态码列表：超时、服务器错误、网关错误等
  return [
    ApiStatus.requestTimeout, // 408 请求超时
    ApiStatus.internalServerError, // 500 服务器内部错误
    ApiStatus.badGateway, // 502 网关错误
    ApiStatus.serviceUnavailable, // 503 服务不可用
    ApiStatus.gatewayTimeout // 504 网关超时
  ].includes(statusCode)
}

/**
 * 请求重试逻辑
 * 当请求失败且满足重试条件时，自动重试请求
 * @param {object} config - Axios 请求配置对象
 * @param {number} [retries=MAX_RETRIES] - 剩余重试次数，默认为最大重试次数
 * @returns {Promise} 请求结果
 * @throws {HttpError} 当重试次数用尽或错误不可重试时抛出错误
 */
async function retryRequest(config, retries = MAX_RETRIES) {
  try {
    // 执行请求
    return await request(config)
  } catch (error) {
    // 如果还有重试次数，且错误是 HttpError 类型，且状态码允许重试
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      // 等待指定时间后重试
      await delay(RETRY_DELAY)
      // 递归调用，重试次数减 1
      return retryRequest(config, retries - 1)
    }
    // 不满足重试条件，直接抛出错误
    throw error
  }
}

/**
 * 延迟函数
 * 创建一个延迟指定时间的 Promise
 * @param {number} ms - 延迟时间（毫秒）
 * @returns {Promise} 延迟 Promise
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 刷新令牌函数
 * 用于获取新的访问令牌
 * @returns {Promise<string>} 新的访问令牌
 * @throws {HttpError} 刷新令牌失败时抛出错误
 */
async function refreshAccessToken() {
  // 获取用户 store
  const userStore = useUserStore()
  // 获取刷新令牌
  const { refreshToken } = userStore

  // 如果没有刷新令牌，直接抛出错误
  if (!refreshToken) {
    throw createHttpError($t('httpMsg.noRefreshToken'), ApiStatus.unauthorized)
  }

  try {
    // 直接使用 axios 原始实例请求刷新令牌，避免触发拦截器
    const response = await axios.request({
      method: 'POST',
      url: '/api/auth/refresh',
      data: { refreshToken },
      timeout: REQUEST_TIMEOUT,
      withCredentials: VITE_WITH_CREDENTIALS === 'true'
    })

    // 提取新的访问令牌
    const { token: newAccessToken } = response.data.data

    // 更新 store 中的访问令牌
    userStore.setToken(newAccessToken)

    // 返回新的访问令牌
    return newAccessToken
  } catch {
    // 刷新令牌失败，直接登出
    userStore.logOut()
    // 抛出错误
    throw createHttpError($t('httpMsg.refreshTokenFailed'), ApiStatus.unauthorized)
  }
}

/**
 * 添加请求到刷新令牌订阅者队列
 * 用于在刷新令牌成功后重试所有失败的请求
 * @param {function} callback - 请求重试的回调函数
 */
function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback)
}

/**
 * 通知所有订阅者使用新的访问令牌重试请求
 * @param {string} newAccessToken - 新的访问令牌
 */
function notifyRefreshSubscribers(newAccessToken) {
  // 遍历所有订阅者，调用回调函数传递新的访问令牌
  refreshSubscribers.forEach((callback) => callback(newAccessToken))
  // 清空订阅者队列
  refreshSubscribers = []
}

/**
 * 核心请求函数
 * 处理请求参数、执行请求、处理响应和错误
 * @param {object} config - Axios 请求配置对象
 * @param {string} [config.method] - HTTP 方法（GET、POST、PUT、DELETE 等）
 * @param {string} config.url - 请求 URL（相对于 baseURL）
 * @param {any} [config.data] - 请求体数据（POST、PUT 使用）
 * @param {object} [config.params] - URL 查询参数（GET 使用）
 * @param {boolean} [config.showSuccessMessage] - 是否显示成功消息
 * @param {boolean} [config.showErrorMessage] - 是否显示错误消息（默认 true）
 * @returns {Promise<any>} 返回响应数据中的 data 字段
 * @throws {HttpError} 请求失败时抛出 HttpError
 */
async function request(config) {
  // POST 和 PUT 请求的参数自动填充逻辑
  // 如果方法为 POST 或 PUT，且存在 params 但没有 data，则将 params 作为 data
  if (
    ['POST', 'PUT'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    // 执行 Axios 请求
    const res = await axiosInstance.request(config)

    // 如果配置了显示成功消息，且响应中包含消息，则显示成功提示
    if (config.showSuccessMessage && res.data.msg) {
      showSuccess(res.data.msg)
    }

    // 返回完整的响应对象，包含 code、msg、data
    return res.data
  } catch (error) {
    // 处理错误：如果是 HttpError 且不是 401 错误，则显示错误消息
    // 401 错误已在拦截器中处理，这里不再重复显示
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      // 默认显示错误消息，除非明确设置为 false
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    // 拒绝 Promise，将错误传递给调用者
    return Promise.reject(error)
  }
}

/**
 * API 方法集合
 * 提供常用的 HTTP 请求方法，每个方法都支持自动重试
 */
const api = {
  /**
   * GET 请求
   * 用于获取数据，参数通过 URL 查询字符串传递
   * @param {object} config - 请求配置对象
   * @param {string} config.url - 请求 URL
   * @param {object} [config.params] - URL 查询参数
   * @param {object} [config.headers] - 自定义请求头
   * @returns {Promise<any>} 响应数据
   * @example
   * ```javascript
   * const data = await api.get({
   *   url: '/user/info',
   *   params: { id: 1 }
   * })
   * ```
   */
  get(config) {
    return retryRequest({ ...config, method: 'GET' })
  },

  /**
   * POST 请求
   * 用于创建资源或提交数据，数据通过请求体传递
   * @param {object} config - 请求配置对象
   * @param {string} config.url - 请求 URL
   * @param {any} [config.data] - 请求体数据
   * @param {boolean} [config.showSuccessMessage] - 是否显示成功消息
   * @returns {Promise<any>} 响应数据
   * @example
   * ```javascript
   * const result = await api.post({
   *   url: '/user/login',
   *   data: { username: 'admin', password: '123456' },
   *   showSuccessMessage: true
   * })
   * ```
   */
  post(config) {
    return retryRequest({ ...config, method: 'POST' })
  },

  /**
   * PUT 请求
   * 用于更新资源，数据通过请求体传递
   * @param {object} config - 请求配置对象
   * @param {string} config.url - 请求 URL
   * @param {any} [config.data] - 请求体数据
   * @param {boolean} [config.showSuccessMessage] - 是否显示成功消息
   * @returns {Promise<any>} 响应数据
   * @example
   * ```javascript
   * const result = await api.put({
   *   url: '/user/1',
   *   data: { name: '新名称' }
   * })
   * ```
   */
  put(config) {
    return retryRequest({ ...config, method: 'PUT' })
  },

  /**
   * DELETE 请求
   * 用于删除资源
   * @param {object} config - 请求配置对象
   * @param {string} config.url - 请求 URL
   * @param {object} [config.params] - URL 查询参数（某些情况下可能需要）
   * @returns {Promise<any>} 响应数据
   * @example
   * ```javascript
   * await api.del({ url: '/user/1' })
   * ```
   */
  del(config) {
    return retryRequest({ ...config, method: 'DELETE' })
  },

  /**
   * 通用请求方法
   * 支持自定义 HTTP 方法和所有 Axios 配置选项
   * @param {object} config - 完整的 Axios 请求配置对象
   * @param {string} config.method - HTTP 方法
   * @param {string} config.url - 请求 URL
   * @returns {Promise<any>} 响应数据
   * @example
   * ```javascript
   * const data = await api.request({
   *   method: 'PATCH',
   *   url: '/user/1',
   *   data: { name: '新名称' }
   * })
   * ```
   */
  request(config) {
    return retryRequest(config)
  }
}

export default api
