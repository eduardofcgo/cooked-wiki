import AsyncStorage from '@react-native-async-storage/async-storage'
import { makeAutoObservable, observable, reaction, runInAction, toJS } from 'mobx'

export class RecentlyOpenedStore {
  recipeIds = observable.array()
  maxRecentItems = 20

  loaded = false
  loading = false

  constructor(recipeMetadataStore) {
    this.recipeMetadataStore = recipeMetadataStore

    makeAutoObservable(this)

    reaction(
      () => toJS(this.recipeIds),
      recipeIds => {
        if (this.loaded) {
          this.saveToLocalStorage(recipeIds)
        }
      },
    )

    this.loadFromLocalStorage()
  }

  async saveToLocalStorage(recipeIds) {
    await AsyncStorage.setItem('recentRecipeIds', JSON.stringify(recipeIds))
  }

  async loadFromLocalStorage() {
    try {
      const savedRecipeIds = await AsyncStorage.getItem('recentRecipeIds')
      runInAction(() => {
        if (savedRecipeIds) {
          this.recipeIds.replace(JSON.parse(savedRecipeIds))
        }

        this.loading = false
        this.loaded = true
      })
    } catch (error) {
      console.error('Error loading recent recipes from storage', error)
    } finally {
      runInAction(() => {
        this.loading = false
        this.loaded = true
      })
    }
  }

  get mostRecentRecipesMetadata() {
    return (
      this.recipeIds
        .map(id => this.recipeMetadataStore.getMetadata(id))
        // Ensure the metadata is loaded / exists
        .filter(metadata => Boolean(metadata))
    )
  }

  addRecent(recipeId) {
    runInAction(() => {
      // Let's preload it here, most likelly the user will open the
      // recent recipes component which needs the recipe thumbnail
      this.recipeMetadataStore.ensureLoadedMetadata(recipeId)

      const existingIndex = this.recipeIds.findIndex(id => {
        return id == recipeId
      })
      if (existingIndex !== -1) {
        this.recipeIds.splice(existingIndex, 1)
      }

      this.recipeIds.unshift(recipeId)

      if (this.recipeIds.length > this.maxRecentItems) {
        this.recipeIds.pop()
      }
    })
  }

  clear() {
    runInAction(() => {
      this.recipeIds.clear()
    })
  }
}
