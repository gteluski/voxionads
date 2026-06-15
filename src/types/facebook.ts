export interface FacebookAuthResponse {
  accessToken: string
  expiresIn: number
  signedRequest: string
  userID: string
}

export interface FacebookLoginStatus {
  status: 'connected' | 'not_authorized' | 'unknown'
  authResponse?: FacebookAuthResponse
}

export interface FacebookUser {
  id: string
  name: string
  email: string
  picture?: {
    data: {
      url: string
    }
  }
}
