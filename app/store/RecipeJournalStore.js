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

  constructor(apiClient, profileStore) {
    this.apiClient = apiClient
    this.profileStore = profileStore
  }

  getRecipeCooked(recipeId) {
    return this.recipeCooked.get(recipeId)?.cooked
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
    const recipeCooked = new RecipeCooked()
    recipeCooked.isLoadingCookeds = true

    runInAction(() => {
      this.recipeCooked.set(recipeId, recipeCooked)
    })

    const { cooked } = await this.apiClient.get(`/journal/recipe/${recipeId}`)

    runInAction(() => {
      recipeCooked.cooked.replace(cooked.results)
      recipeCooked.isLoadingCookeds = false
    })
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
      const { cooked } = await this.apiClient.get(`/journal/recipe/${recipeId}`, {
        params: {
          page: recipeCooked.cookedsPage + 1,
        },
      })

      runInAction(() => {
        recipeCooked.cooked.push(...cooked.results)
        recipeCooked.hasMoreCookeds = cooked.results.length > 0
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
