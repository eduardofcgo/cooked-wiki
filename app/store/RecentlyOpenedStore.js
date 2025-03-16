import AsyncStorage from '@react-native-async-storage/async-storage'
import { makeAutoObservable, observable, reaction, runInAction, toJS } from 'mobx'
import { equals } from 'ramda'

export class RecentlyOpenedStore {
  recipes = observable.array()
  maxRecentItems = 10

  loaded = false
  loading = false

  constructor() {
    makeAutoObservable(this)

    reaction(
      () => toJS(this.recipes),
      recipes => {
        if (this.loaded) {
          this.saveToLocalStorage(recipes)
        }
      },
    )

    this.loadFromLocalStorage()
  }

  async saveToLocalStorage(recipes) {
    await AsyncStorage.setItem('recentRecipes', JSON.stringify(recipes))
  }

  async loadFromLocalStorage() {
    try {
      const savedRecipes = await AsyncStorage.getItem('recentRecipes')
      runInAction(() => {
        if (savedRecipes) {
          this.recipes.replace(JSON.parse(savedRecipes))
        }

        this.loading = false
        this.loaded = true
      })
    } catch (error) {
      console.error('Error loading recent recipes from storage', error)

      runInAction(() => {
        this.loading = false
        this.loaded = true
      })
    }
  }

  addRecent(recipe) {
    runInAction(() => {
      const existingIndex = this.recipes.findIndex(r => equals(r, recipe))
      if (existingIndex !== -1) {
        this.recipes.splice(existingIndex, 1)
      }

      this.recipes.unshift(recipe)

      if (this.recipes.length > this.maxRecentItems) {
        this.recipes.pop()
      }
    })
  }

  clearRecent() {
    runInAction(() => {
      this.recipes.clear()
    })
  }
}
