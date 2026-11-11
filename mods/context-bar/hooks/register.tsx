import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Segment, Usage } from '../types'

const HIDDEN_KEY = 'isHidden'

const usage = atom({ plugin: 'context-bar', key: 'usage' } as const, null, {
  shape: 'usage-1',
})
const isHidden = atom(
  { plugin: 'context-bar', key: 'isHidden' } as const,
  false,
)

// /context's own colours by theme key, as hex: three of its keys are terminal
// only, and it reuses two greys for the free space and the compaction buffer.
const PALETTE: Record<string, string> = {
  promptBorder: '#7c8aa5',
  inactive: '#b0a58f',
  cyan_FOR_SUBAGENTS_ONLY: '#22b8cf',
  green_FOR_SUBAGENTS_ONLY: '#40c057',
  permission: '#4c8df6',
  claude: '#d97757',
  warning: '#f2b705',
  purple_FOR_SUBAGENTS_ONLY: '#a855f7',
}

const paintOf = (one: Segment): string => {
  if (one.kind === 'free') {
    return 'subtle'
  }

  return one.kind === 'buffer' ? 'inactive' : (PALETTE[one.color] ?? one.color)
}

const formatTokens = (tokens: number): string => {
  if (tokens >= 10_000) {
    return `${Math.round(tokens / 1000)}k`
  }

  return tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : String(tokens)
}

// `summary` is the free local count: `full` sends one token-count request per
// tool and memory file, too much to spend after every model response.
async function refresh($: EngineInterface): Promise<void> {
  const { breakdown } = (await $.session.usage({ breakdown: 'summary' })).context

  if (!breakdown) {
    return
  }

  const segments: Segment[] = breakdown.categories.map(row => ({
    name: row.name,
    tokens: row.tokens,
    color: row.color,
    kind: row.kind,
  }))
  const current: Usage = {
    segments,
    totalTokens: breakdown.totalTokens,
    maxTokens: breakdown.rawMaxTokens,
    percentage: breakdown.percentage,
  }

  await update($, usage, () => current)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'context-bar',
      description: 'Show or hide the context window bar above the prompt',
    })
    const stored = await $.store.get(HIDDEN_KEY)
    await update($, isHidden, () => stored === true)
    const started = await next(e)
    await refresh($)

    return started
  })

  on('command.run', { command: 'context-bar' }, async $ => {
    const hidden = !(await read($, isHidden))
    await update($, isHidden, () => hidden)
    await $.store.set(HIDDEN_KEY, hidden)

    if (!hidden) {
      await refresh($)
    }

    return { text: hidden ? 'Context bar hidden.' : 'Context bar shown.' }
  })

  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)
    await refresh($)

    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await refresh($)

    return result
  })

  on('session.compact', async ($, e, next) => {
    const result = await next(e)
    await refresh($)

    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const shown = await read($, usage)

    if (e.props.hasSurvey || shown === null || (await read($, isHidden))) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    // Deferred rows are tool schemas outside the window; the rest fill it.
    const segments = shown.segments.filter(
      one => one.kind !== 'deferred' && one.tokens > 0,
    )
    const sum = segments.reduce((all, one) => all + one.tokens, 0)

    return (
      <Box flexDirection="column" rowGap="xs">
        <Box flexDirection="row" width="100%" height={1} overflow="hidden">
          {segments.map(one => (
            <Box
              key={one.name}
              flexGrow={Math.max(1, Math.round((one.tokens / sum) * 1000))}
              width={0}
              minWidth={1}
              backgroundColor={paintOf(one)}
            />
          ))}
        </Box>
        <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
          <Text weight="medium" tabular>
            {formatTokens(shown.totalTokens)} / {formatTokens(shown.maxTokens)} ({shown.percentage}%)
          </Text>
          {segments.map(one => (
            <Text dimColor tabular>
              <Text color={paintOf(one)}>{one.kind === 'free' ? '□' : '■'}</Text> {one.name} {formatTokens(one.tokens)}
            </Text>
          ))}
        </Box>
      </Box>
    )
  })
}
