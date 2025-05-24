import AsyncStorage from '@react-native-async-storage/async-storage'
import { makeAutoObservable, observable, reaction, runInAction, toJS } from 'mobx'

export class RecentlyOpenedStore {
  recipeIds = observable.array()
  openDates = observable.map()

  maxRecentItems = 50

  loaded = false
  loading = false

  constructor(recipeMetadataStore) {
    this.recipeMetadataStore = recipeMetadataStore

    makeAutoObservable(this)

    reaction(
      () => toJS(this.openDates),
      () => {
        if (this.loaded) {
          this.saveToLocalStorage()
        }
      },
    )

    reaction(
      () => toJS(this.recipeMetadataStore.erroredMetadatas),
      erroredMetadatas => {
        Array.from(erroredMetadatas.entries()).forEach(([recipeId, error]) => {
          console.log('Errored getting metadata: ', error.status, recipeId)

          if (error.status === 404) {
            runInAction(() => {
              this.recipeIds.remove(recipeId)
              this.openDates.delete(recipeId)
            })
          }
        })
      },
    )

    this.loadFromLocalStorage()
  }

  async saveToLocalStorage() {
    await AsyncStorage.setItem('recentRecipeIds', JSON.stringify(toJS(this.recipeIds)))

    const serializedDates = {}
    this.openDates.forEach((date, key) => {
      serializedDates[key] = date.toISOString()
    })

    await AsyncStorage.setItem('recipeOpenDates', JSON.stringify(toJS(serializedDates)))
  }

  async loadFromLocalStorage() {
    try {
      const savedRecipeIds = await AsyncStorage.getItem('recentRecipeIds')
      const savedOpenDates = await AsyncStorage.getItem('recipeOpenDates')

      runInAction(() => {
        if (savedRecipeIds) {
          this.recipeIds.replace(JSON.parse(savedRecipeIds))
        }

        if (savedOpenDates) {
          const parsedDates = JSON.parse(savedOpenDates)

          Object.keys(parsedDates).forEach(key => {
            this.openDates.set(key, new Date(parsedDates[key]))
          })
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

  ensureLoadedMetadata() {
    runInAction(() => {
      this.recipeIds.forEach(id => {
        this.recipeMetadataStore.ensureLoadedMetadata(id)
      })
    })
  }

  get mostRecentRecipesMetadata() {
    return (
      this.recipeIds
        .map(id => this.recipeMetadataStore.getMetadata(id))

        // Ensure the metadata is loaded / exists
        .filter(metadata => Boolean(metadata))

        .map(metadata => ({
          ...metadata,
          openedAt: this.openDates.get(metadata.id),
        }))
    )
  }

  addRecent(recipeId) {
    runInAction(() => {
      // Let's preload it here, so it's ready when the user opens
      // a component that needs it (e.g. Recent recipes bar or Recipe picker).
      this.recipeMetadataStore.ensureLoadedMetadata(recipeId)

      this.openDates.set(recipeId, new Date())

      const existingIndex = this.recipeIds.findIndex(id => {
        return id == recipeId
      })
      if (existingIndex !== -1) {
        this.recipeIds.splice(existingIndex, 1)
      }

      this.recipeIds.unshift(recipeId)

      if (this.recipeIds.length > this.maxRecentItems) {
        const removedId = this.recipeIds.pop()
        this.openDates.delete(removedId)
      }
    })
  }

  async clear() {
    console.log('Clearing recently opened recipes')

    runInAction(() => {
      this.recipeIds.clear()
      this.openDates.clear()
    })
  }
}
