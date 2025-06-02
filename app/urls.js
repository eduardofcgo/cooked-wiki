import env from './config/environment'

const { BASE_URL, API_BASE_URL } = env

export const absoluteUrl = path => `${BASE_URL}${path}`
export const getAppLoginUrl = () => `${BASE_URL}/app/login`

export const getGoogleLoginUrl = () => `${API_BASE_URL}/login/google`
export const getGoogleRegisteredUsername = () => `${API_BASE_URL}/login/google/username`
export const registerGoogleUsername = () => `${API_BASE_URL}/login/google/register`

export const validateUsernameUrl = () => `${API_BASE_URL}/user/validate-username`

export const getContactUrl = () => `${BASE_URL}/contact`
export const getTeamUrl = () => `${BASE_URL}/team`
export const getExtractUrl = url => `${BASE_URL}/new?url=${url}`
export const getRecentExtractUrl = extractId => `${BASE_URL}/new/recent/${extractId}`
export const getSavedRecipeUrl = recipeId => `${BASE_URL}/saved/${recipeId}`
export const getPrintRecipeUrl = recipeId => `${BASE_URL}/saved/${recipeId}/print`
export const getPrintExtractUrl = extractId => `${BASE_URL}/new/recent/${extractId}/print`
export const getCookedUrl = cookId => `${BASE_URL}/cook/${cookId}`
export const getPublicCommunityJournalUrl = () => `${BASE_URL}/community/journal`
export const getCommunityJournalUrl = () => `${BASE_URL}/community/journal?following=true`
export const getProfileImageUrl = username => `${BASE_URL}/user/${username}/profile/image`
export const getCookedPhotoUrl = imagePath => `${BASE_URL}/image/photo/${imagePath}`
export const getThumbnailUrl = imagePath => `${BASE_URL}/image/thumbnail/${imagePath}`
export const getJournalUrl = username => `${BASE_URL}/user/${username}/journal`
export const getProfileUrl = username => `${BASE_URL}/user/${username}`
export const getLoggedInProfileUrl = () => `${BASE_URL}/recipes`
export const getShareableProfileUrl = username => `${BASE_URL}/user/${username}`
export const getCollectionsUrl = username => `${BASE_URL}/user/${username}/collections`
export const getCollectionUrl = (username, collectionId) => `${BASE_URL}/user/${username}/collections/${collectionId}`
export const getShoppingListUrl = username => `${BASE_URL}/user/${username}/shopping-list`
export const getShoppingListPrintUrl = username => `${BASE_URL}/user/${username}/shopping-list/print`
export const getLimitsUrl = (queryParams = {}) => {
  const url = new URL(`${BASE_URL}/limits`)
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value)
    }
  })
  return url.toString()
}
