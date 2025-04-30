import { makeAutoObservable, observable, runInAction } from 'mobx'
import { fromPromise } from 'mobx-utils'

export class RecipeMetadataStore {
  metadataMap = observable.map()

  constructor(apiClient) {
    this.apiClient = apiClient

    makeAutoObservable(this)
  }

  getMetadataLoadState(recipeId) {
    return this.metadataMap.get(recipeId)?.state
  }

  getMetadata(recipeId) {
    return this.metadataMap.get(recipeId)?.value
  }

  ensureLoadedMetadata(recipeId) {
    if (!this.metadataMap.has(recipeId)) {
      runInAction(() => {
        this.metadataMap.set(
          recipeId,

          fromPromise(
            this.apiClient.get(`/recipe/${recipeId}/metadata`).then(data => ({
              // TODO: the server should already return the scaled thumbnail
              thumbnail: data['image-path'] && '/image/thumbnail/' + data['image-path'],

              ...data,
            })),
          ),
        )
      })
    }
  }
}
