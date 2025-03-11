import { makeAutoObservable, observable, runInAction } from 'mobx'

class RecipeMetadata {
  title = ''
  thumbnail = ''
  type = ''

  isLoading = false

  constructor() {
    makeAutoObservable(this)
  }
}

export class RecipeMetadataStore {
  metadataMap = observable.map()

  constructor(apiClient) {
    this.apiClient = apiClient

    makeAutoObservable(this)
  }

  async ensureLoadedMetadata(id) {
    if (this.metadataMap.has(id)) {
      return this.metadataMap.get(id)
    }

    const metadata = new RecipeMetadata()
    metadata.isLoading = true

    runInAction(() => {
      this.metadataMap.set(id, metadata)
    })

    try {
      console.log('getting metadata', `/recipe/${id}/metadata`)
      const data = await this.apiClient.get(`/recipe/${id}/metadata`)

      runInAction(() => {
        metadata.title = data.title
        metadata.thumbnail = data['image-path'] && '/image/thumbnail/' + data['image-path']
        metadata.type = data.type

        metadata.isLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.metadataMap.delete(id)
      })

      console.error('Error loading recipe metadata:', error)
    }
  }

  getMetadata(id) {
    return this.metadataMap.get(id)
  }
}
