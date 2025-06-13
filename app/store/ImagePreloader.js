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
      const preloadUrls = urls?.filter(Boolean).map(url => ({
        uri: url,
        headers: {
          'User-Agent': 'app'
        }
      }))

      FastImage.preload(preloadUrls)
    } catch (error) {
      console.error('Error preloading images', error)
    }
  }
}
