export type Segment = {
  name: string
  tokens: number
  color: string
  kind: 'used' | 'free' | 'buffer' | 'deferred'
}

export type Usage = {
  segments: Segment[]
  totalTokens: number
  maxTokens: number
  percentage: number
}

declare module 'claude-code' {
  interface PluginState {
    'context-bar': { usage: Usage | null; isHidden: boolean }
  }
}
