import { makeAutoObservable, observable, runInAction } from 'mobx'

class RecipeCooked {
  cooked = observable.array()

  isLoadingCookeds = undefined
  isLoadingCookedsNextPage = false
  cookedsPage = 1
  hasMoreCookeds = true

  constructor() {
    makeAutoObservable(this)
  }
}

export class RecipeJournalStore {
  recipeCooked = observable.map()

  constructor(apiClient, profileStore, cookedStore) {
    this.apiClient = apiClient
    this.profileStore = profileStore
    this.cookedStore = cookedStore

    makeAutoObservable(this)
  }

  getRecipeCooked(recipeId) {
    return this.recipeCooked.get(recipeId)?.cooked
  }

  deleteCooked(username, cookedId) {
    runInAction(() => {
      this.recipeCooked.forEach(recipeCooked => {
        const filteredCooked = recipeCooked.cooked.filter(cooked => cooked.id !== cookedId)
        recipeCooked.cooked.replace(filteredCooked)
      })

      this.profileStore.deleteCooked(username, cookedId)
      this.cookedStore.deleteCooked(cookedId)
    })
  }

  isLoadingRecipeCooked(recipeId) {
    return this.recipeCooked.get(recipeId)?.isLoadingCookeds
  }

  isLoadingRecipeCookedsNextPage(recipeId) {
    return this.recipeCooked.get(recipeId)?.isLoadingCookedsNextPage
  }

  hasMoreRecipeCookeds(recipeId) {
    return this.recipeCooked.get(recipeId)?.hasMoreCookeds
  }

  async loadCookeds(recipeId) {
    console.log('[RecipeJournalStore] loadCookeds', recipeId)
    const recipeCooked = new RecipeCooked()
    recipeCooked.isLoadingCookeds = true

    runInAction(() => {
      this.recipeCooked.set(recipeId, recipeCooked)
    })

    try {
      const recipeJournalResponse = await this.apiClient.get(`/journal/recipe/${recipeId}`)

      runInAction(() => {
        for (const cooked of recipeJournalResponse.cooked) {
          this.cookedStore.saveToStore(cooked.id, cooked)
        }

        const cookedObserved = recipeJournalResponse.cooked.map(cooked => this.cookedStore.getCooked(cooked.id))

        recipeCooked.cooked.replace(cookedObserved)
        recipeCooked.isLoadingCookeds = false
      })
    } catch (error) {
      console.error(error)
    } finally {
      runInAction(() => {
        recipeCooked.isLoadingCookeds = false
      })
    }
  }

  async loadNextCookedsPage(recipeId) {
    const recipeCooked = this.recipeCooked.get(recipeId)

    if (!recipeCooked) {
      throw new Error('Recipe cooked not found')
    }

    if (recipeCooked.isLoadingCookedsNextPage) {
      throw new Error('Recipe cooked is already loading next page')
    }

    if (!recipeCooked.hasMoreCookeds) {
      throw new Error('No more cookeds')
    }

    runInAction(() => {
      recipeCooked.isLoadingCookedsNextPage = true
    })

    try {
      const cookeds = await this.apiClient.get(`/journal/recipe/${recipeId}`, {
        params: {
          page: recipeCooked.cookedsPage + 1,
        },
      })

      runInAction(() => {
        recipeCooked.cooked.push(...cookeds)
        recipeCooked.hasMoreCookeds = cookeds.length > 0
        recipeCooked.isLoadingCookedsNextPage = false
        recipeCooked.cookedsPage++
      })
    } catch (error) {
      throw error
    } finally {
      runInAction(() => {
        recipeCooked.isLoadingCookedsNextPage = false
      })
    }
  }
}
