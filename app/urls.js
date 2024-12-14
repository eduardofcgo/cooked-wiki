
const BASE_URL = 'http://192.168.1.96:3000'
export const API_BASE_URL = `${BASE_URL}/api`

export const getAppLoginUrl = () => `${BASE_URL}/app/login`
export const getContactUrl = () => `${BASE_URL}/contact`
export const getTeamUrl = () => `${BASE_URL}/team`
export const getExtractUrl = (url) => `${BASE_URL}/extract/${url}`
export const getCommunityJournalUrl = () => `${BASE_URL}/community/journal`
export const getProfileImageUrl = (username) => `${BASE_URL}/user/${username}/profile/image`
export const getJournalUrl = (username) => `${BASE_URL}/user/${username}/journal`
export const getProfileUrl = (username) => `${BASE_URL}/user/${username}`
export const getShoppingListUrl = (username) => `${BASE_URL}/user/${username}/shopping-list` 