import { makeAutoObservable, observable, runInAction } from 'mobx'
import { fromPromise } from 'mobx-utils'
import { when } from 'mobx'

export class RecipeMetadataStore {
  metadataMap = observable.map()

  constructor(apiClient, imagePreloader) {
    this.apiClient = apiClient
    this.imagePreloader = imagePreloader

    makeAutoObservable(this)
  }

  get erroredMetadatas() {
    return new Map(
      Array.from(this.metadataMap.entries())
        .filter(([recipeId, metadata]) => metadata.state === 'rejected')
        .map(([recipeId, metadata]) => [recipeId, metadata.value]),
    )
  }

  getMetadataLoadState(recipeId) {
    return this.metadataMap.get(recipeId)?.state
  }

  getMetadata(recipeId) {
    if (this.getMetadataLoadState(recipeId) === 'fulfilled') {
      return this.metadataMap.get(recipeId)?.value
    } else {
      return undefined
    }
  }

  ensureLoadedMetadata(recipeId) {
    if (!this.metadataMap.has(recipeId)) {
      runInAction(() => {
        this.metadataMap.set(recipeId, fromPromise(this.apiClient.get(`/recipe/${recipeId}/metadata`)))

        when(
          () => this.getMetadataLoadState(recipeId) === 'fulfilled',
          () => {
            const metadata = this.getMetadata(recipeId)
            if (metadata && metadata['thumbnail-url']) {
              this.imagePreloader.preloadImageUrls([metadata['thumbnail-url']])
            }
          },
        )
      })
    }
  }
}
