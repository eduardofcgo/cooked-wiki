// const BASE_URL = 'https://cooked.wiki'
// const BASE_URL = 'http://192.168.1.202:3000'
const BASE_URL = 'http://localhost:3000'

export const API_BASE_URL = `${BASE_URL}/api`

export const absoluteUrl = path => `${BASE_URL}${path}`
export const getAppLoginUrl = () => `${BASE_URL}/app/login`

export const getGoogleLoginUrl = () => `${API_BASE_URL}/login/google`
export const getGoogleRegisteredUsername = () => `${API_BASE_URL}/login/google/username`
export const registerGoogleUsername = () => `${API_BASE_URL}/login/google/register`

export const validateUsernameUrl = () => `${API_BASE_URL}/user/validate-username`

export const getContactUrl = () => `${BASE_URL}/contact`
export const getTeamUrl = () => `${BASE_URL}/team`
export const getExtractUrl = url => `${BASE_URL}/new?url=${url}`
export const getSavedRecipeUrl = recipeId => `${BASE_URL}/saved/${recipeId}`
export const getCookedUrl = cookId => `${BASE_URL}/cook/${cookId}`
export const getCommunityJournalUrl = () => `${BASE_URL}/community/journal?following=true`
export const getProfileImageUrl = username => `${BASE_URL}/user/${username}/profile/image`
export const getCookedPhotoUrl = imagePath => `${BASE_URL}/image/photo/${imagePath}`
export const getThumbnailUrl = imagePath => `${BASE_URL}/image/thumbnail/${imagePath}`
export const getJournalUrl = username => `${BASE_URL}/user/${username}/journal`
export const getProfileUrl = username => `${BASE_URL}/user/${username}`
export const getShoppingListUrl = username => `${BASE_URL}/user/${username}/shopping-list`
