import { makeAutoObservable, observable, runInAction, extendObservable } from 'mobx'
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

  saveToStore(cookedId, newCooked) {
    const currentCooked = this.getCooked(cookedId)

    if (!currentCooked) {
      runInAction(() => {
        const observableCooked = makeAutoObservable(newCooked)
        this.cooked.set(cookedId, fromPromise.resolve(observableCooked))
      })
    }
  }

  updateCooked(cookedId, newCooked) {
    const currentCooked = this.getCooked(cookedId)

    if (currentCooked) {
      runInAction(() => {
        for (const key in newCooked) {
          currentCooked[key] = newCooked[key]
        }
      })
    } else {
      this.saveToStore(cookedId, newCooked)
    }
  }
}
