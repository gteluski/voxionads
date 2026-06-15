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

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'fb:login-button': {
        scope?: string
        onlogin?: string
        size?: 'small' | 'medium' | 'large' | 'xlarge'
        button_type?: 'login' | 'continue_with'
        show_faces?: 'true' | 'false'
        auto_logout_link?: 'true' | 'false'
        [key: string]: any
      }
    }
  }
}
