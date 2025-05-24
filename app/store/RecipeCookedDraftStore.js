import AsyncStorage from '@react-native-async-storage/async-storage'
import { makeAutoObservable, observable, reaction, runInAction, toJS } from 'mobx'

export class CookedDraft {
  notes = undefined

  constructor(notes) {
    this.notes = notes

    makeAutoObservable(this)
  }

  setNotes(notes) {
    runInAction(() => {
      this.notes = notes
    })
  }

  clearNotes() {
    runInAction(() => {
      this.notes = null
    })
  }
}

export class RecipeCookedDraftStore {
  drafts = observable.map()
  loadedFromStorage = false
  loadingFromStorage = false
  savingToStorage = false

  constructor() {
    makeAutoObservable(this)

    reaction(
      () => toJS(this.drafts),
      drafts => {
        if (!this.loadingFromStorage && this.loadedFromStorage && !this.savingToStorage && drafts.size > 0) {
          this.saveToLocalStorage()
        }
      },
      // Debounce saving to storage
      { delay: 500 },
    )

    this.loadFromLocalStorage()
  }

  async saveToLocalStorage() {
    runInAction(() => {
      this.savingToStorage = true
    })

    const serializedDrafts = {}
    this.drafts.forEach((draft, recipeId) => {
      serializedDrafts[recipeId] = toJS(draft)
    })

    try {
      // For now lets save all the drafts on the same key
      await AsyncStorage.setItem('recipeCookedDrafts', JSON.stringify(serializedDrafts))
    } catch (error) {
      console.error('Error saving recipe cooked drafts to storage', error)
    } finally {
      runInAction(() => {
        this.savingToStorage = false
      })
    }
  }

  async loadFromLocalStorage() {
    try {
      runInAction(() => {
        this.loadingFromStorage = true
      })

      const savedDrafts = await AsyncStorage.getItem('recipeCookedDrafts')

      runInAction(() => {
        if (savedDrafts) {
          const parsedDrafts = JSON.parse(savedDrafts)
          Object.entries(parsedDrafts).forEach(([recipeId, draftData]) => {
            this.drafts.set(recipeId, new CookedDraft(draftData.notes))
          })
        }

        this.loadedFromStorage = true
      })
    } catch (error) {
      console.error('Error loading recipe cook drafts from storage', error)
    } finally {
      runInAction(() => {
        this.loadingFromStorage = false
      })
    }
  }

  ensureDraft(recipeId) {
    if (!this.drafts.has(recipeId)) {
      runInAction(() => {
        this.drafts.set(recipeId, new CookedDraft(''))
      })
    }
  }

  getDraft(recipeId) {
    return this.drafts.get(recipeId)
  }

  clear() {
    runInAction(() => {
      this.drafts.clear()
    })
  }
}
