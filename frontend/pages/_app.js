import React from 'react'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '../context/AuthContext'
import '../app/globals.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, info) {
    // You can log to a remote error tracker here
    // console.error('Unhandled error', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page or contact support.</p>
        </div>
      )
    }
    return this.props.children
  }
}

export default function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class">
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
