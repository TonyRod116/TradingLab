const tokenName = 'access_token'
const refreshTokenName = 'refresh_token'

export const setToken = (token) => {
  localStorage.setItem(tokenName, token)
}

export const getToken = () => {
  return localStorage.getItem(tokenName)
}

export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(refreshTokenName, token)
  }
}

export const getRefreshToken = () => {
  return localStorage.getItem(refreshTokenName)
}

export const removeToken = () => {
  localStorage.removeItem(tokenName)
  localStorage.removeItem(refreshTokenName)
}

export const getUser = () => {
  // 1. get token from localStorage (if it exists)
  const token = getToken()
  // 2. If it doesn't exist, we'll return `null`
  if (!token) return null
  // 3. If a token exists, we need to extract the payload string (middle)
  const payloadString = token.split('.')[1]
  // 4. We then decode the payload string into an object by b64 decoding
  try {
    const { user, exp } = JSON.parse(atob(payloadString))
    // 5. Ensure the token is still within the expiry date
    const today = Date.now() / 1000
    if (today > exp) {
      removeToken()
      return null
    }
    // 6. Return the user if the token is valid
    return user
  } catch (error) {
    console.error('Error parsing JWT token:', error)
    removeToken()
    return null
  }
}

export const isTokenExpired = () => {
  const token = getToken()
  if (!token) return true
  
  try {
    const payloadString = token.split('.')[1]
    const { exp } = JSON.parse(atob(payloadString))
    const today = Date.now() / 1000
    return today > exp
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true
  }
}
