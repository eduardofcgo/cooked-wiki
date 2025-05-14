import axios from 'axios'
import { btoa, atob } from 'react-native-quick-base64'

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

export class ApiClient {
  constructor(baseURL, credentials) {
    console.log('initializing api client', baseURL, credentials?.username)

    this.client = axios.create({
      baseURL: baseURL,
      timeout: 6000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    this.client.interceptors.request.use(
      config => {
        if (credentials?.token) {
          try {
            const session = atob(credentials.token)
            config.headers.Cookie = `ring-session=${session}`
          } catch (e) {
            console.error(e)
          }
        }
        return config
      },
      error => {
        return Promise.reject(error)
      },
    )

    this.client.interceptors.response.use(
      response => {
        return response.data
      },
      error => {
        if (error.response) {
          console.error(
            `Request to ${error.config.baseURL}${error.config.url} failed:`,
            error.response.status,
            error.response.data,
          )

          throw new ApiError(
            error.response.data.message || 'An error occurred: ' + error.response.status,
            error.response.status,
            error.response.data.code,
          )
        }

        throw error
      },
    )
  }

  onUnauthorized(callback) {
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          callback(error.response)
        }
        return Promise.reject(error)
      },
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

  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config)
  }

  async request(config) {
    return this.client.request(config)
  }

  async uploadFormData(config) {
    if (!config.data) throw new Error('data is required')
    if (!config.url) throw new Error('url is required')
    if (!config.method) throw new Error('method is required')

    const formData = new FormData()

    for (const key in config.data) {
      const formField = config.data[key]

      // File object
      if (formField instanceof Object && (!formField.uri || !formField.type || !formField.name)) {
        throw new Error(`Form field ${key} is missing required properties: uri, type, and name are all required`)
      }

      formData.append(key, formField)
    }

    return this.client.request({
      ...config,
      headers: {
        ...(config.headers || {}),
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data, headers) => formData,
      uploadProgress: progressEvent => {},
      data: formData,
    })
  }
}
