import { makeAutoObservable, observable, runInAction } from 'mobx'
import { fromPromise } from 'mobx-utils'

export class CookedStore {
  cooked = observable.map()

  constructor(apiClient) {
    this.apiClient = apiClient

    makeAutoObservable(this)
  }

  getCookedLoadState(cookedId) {
    return this.cooked.get(cookedId)?.state
  }

  getCooked(cookedId) {
    return this.cooked.get(cookedId)?.value
  }

  ensureLoaded(cookedId) {
    if (!this.cooked.has(cookedId)) {
      runInAction(() => {
        this.cooked.set(cookedId, fromPromise(this.apiClient.get(`/journal/${cookedId}`)))
      })
    }
  }

  saveToStore(cookedId, cooked) {
    this.cooked.set(cookedId, fromPromise(Promise.resolve(cooked)))
  }
}
