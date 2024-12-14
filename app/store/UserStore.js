import { makeAutoObservable, runInAction, reaction, observable } from 'mobx'

export class UserStore {
    notificationToken = ''
    
    constructor(apiClient) {
      this.apiClient = apiClient

      makeAutoObservable(this)

      reaction(
        () => this.notificationToken,
        async (newToken, previousToken) => {
            console.log('notificationToken', newToken)

            try {
                if (previousToken) {
                    await this.apiClient.delete('/user/tokens', {
                        params: { "notification-token": previousToken }
                    })
                }

                if (newToken) {
                    await this.apiClient.put(
                        '/user/tokens',
                        { "notification-token": newToken }
                    )
                }
            } catch (error) {
                console.error('Error updating notification tokens', error)
            }
        }
      )
    }
}