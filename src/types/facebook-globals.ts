declare global {
  interface Window {
    checkLoginState: () => void
    statusChangeCallback: (response: any) => void
    FB: any
    fbAsyncInit: () => void
  }
}

export {}
