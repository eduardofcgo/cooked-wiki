import axios from 'axios'
import { Base64 } from 'js-base64'

import { API_BASE_URL } from '../urls'

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

export class ApiClient {
  constructor(credentials) {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    this.client.interceptors.request.use(
      (config) => {
        if (credentials?.token) {
          const session = Base64.decode(credentials.token)
          config.headers.Cookie = `ring-session=${session}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    this.client.interceptors.response.use(
      (response) => {
        return response.data
      },
      (error) => {
        if (error.response) {
          throw new ApiError(
            error.response.data.message || 'An error occurred: ' + error.response.status,
            error.response.status,
            error.response.data.code
          )
        }
        throw new ApiError('Network error', 0, 'NETWORK_ERROR')
      }
    )
  }

  onUnauthorized(callback) {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          callback(error.response)
        }
        return Promise.reject(error)
      }
    )
    return this
  }

  async get(url, config = {}) {
    return this.client.get(url, config)
  }

  async post(url, data, config = {}) {
    return this.client.post(url, data, config)
  }

  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config)
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config)
  }
}

