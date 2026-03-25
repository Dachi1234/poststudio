"use client"

import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  /** Label shown in the error UI so the user knows what crashed */
  label?: string
  onError?: (error: Error, info: React.ErrorInfo) => void
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ""}]`, error, info.componentStack)
    this.props.onError?.(error, info)
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border border-red-200 bg-red-50 text-center">
          <p className="font-[family-name:var(--font-inter)] font-semibold text-sm text-red-700">
            {this.props.label ? `${this.props.label} crashed` : "Something went wrong"}
          </p>
          <p className="font-[family-name:var(--font-inter)] text-xs text-red-500 max-w-md">
            {this.state.error.message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-1 px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
