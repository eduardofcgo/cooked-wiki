import { makeAutoObservable, observable, runInAction, when, reaction } from 'mobx'
import { fromPromise } from 'mobx-utils'

export class CookedStore {
  cooked = observable.map()

  constructor(apiClient, imagePreloader) {
    this.apiClient = apiClient
    this.imagePreloader = imagePreloader

    makeAutoObservable(this)
  }

  getCookedLoadState(cookedId) {
    return this.cooked.get(cookedId)?.state
  }

  getCooked(cookedId) {
    if (this.getCookedLoadState(cookedId) === 'fulfilled') {
      return this.cooked.get(cookedId)?.value
    } else {
      return undefined
    }
  }

  ensureLoaded(cookedId) {
    if (!this.cooked.has(cookedId)) {
      runInAction(() => {
        this.cooked.set(
          cookedId,

          fromPromise(this.apiClient.get(`/journal/${cookedId}`).then(makeAutoObservable)),
        )
      })
    }
  }

  preloadCooked(cookedId) {
    this.ensureLoaded(cookedId)

    when(
      () => this.getCooked(cookedId) !== undefined,
      () => {
        const cooked = this.getCooked(cookedId)
        if (cooked && cooked['cooked-photos-urls']) {
          this.imagePreloader.preloadImageUrls(cooked['cooked-photos-urls'])
        }
      },
    )
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

  deleteCooked(cookedId) {
    this.apiClient
      .delete(`/journal/${cookedId}`)
      .then(() => {
        runInAction(() => {
          this.cooked.delete(cookedId)
        })
      })
      .catch(error => {
        console.error(error)
      })
  }
}
