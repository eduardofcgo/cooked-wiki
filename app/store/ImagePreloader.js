import FastImage from 'react-native-fast-image'
import { makeAutoObservable } from 'mobx'

export class ImagePreloader {
  constructor(client) {
    this.client = client

    makeAutoObservable(this)
  }

  clearCache() {
    FastImage.clearMemoryCache()
    FastImage.clearDiskCache()
  }

  preloadImageUrls(urls) {
    try {
      // const headers = this.client.getHeaders()

      const preloadUrls = urls?.filter(Boolean).map(url => ({
        uri: url,
        // headers: headers
      }))

      FastImage.preload(preloadUrls)
    } catch (error) {
      console.error('Error preloading images', error)
    }
  }
}
