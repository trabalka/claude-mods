import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'context-bar',
  component: 'AbovePrompt',
  surface: 'desktop',
  requestId: 'above',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 10 },
    view: {},
  },
} as const

const BREAKDOWN = {
  categories: [
    { name: 'System prompt', tokens: 6000, color: 'promptBorder', isDeferred: false, kind: 'used' },
    { name: 'Messages', tokens: 12400, color: 'purple_FOR_SUBAGENTS_ONLY', isDeferred: false, kind: 'used' },
    { name: 'MCP tools', tokens: 900, color: 'ide', isDeferred: true, kind: 'deferred' },
    { name: 'Free space', tokens: 181600, color: 'inactive', isDeferred: false, kind: 'free' },
  ],
  totalTokens: 18400,
  rawMaxTokens: 200000,
  percentage: 9,
}

function engine(on: Parameters<Parameters<typeof test>[1]>[1]) {
  on('command.register', () => ({ value: { command: 'context-bar' } }))
  on('session.usage', () => ({
    value: { startedAt: 0, context: { window: 200000, breakdown: BREAKDOWN }, rateLimits: [] },
  }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('store.get', () => ({ value: undefined }))
  on('store.set', () => ({ value: undefined }))
  on('command.run', () => ({ text: 'engine' }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine</Text>
  })
}

test('the bar and legend show the /context rows, without deferred ones', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const ui = await $.ui.mount(BAND)

  expect((await ui.find({ key: 'Messages' }))?.props.flexGrow).toBe(62)
  expect((await ui.find({ key: 'Free space' }))?.props.flexGrow).toBe(908)
  expect((await ui.find({ key: 'Messages' }))?.props.backgroundColor).toBe('#a855f7')
  expect((await ui.find({ key: 'Free space' }))?.props.backgroundColor).toBe('subtle')
  expect(await ui.find({ key: 'MCP tools' })).toBeUndefined()
  expect((await ui.find({ type: 'Text', text: /18k \/ 200k \(9%\)/ }))).toBeDefined()
  await ui.unmount()
})

test('/context-bar hides the bar and shows it again', async ($, on) => {
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const off = await $.command.run({ command: 'context-bar', args: '' })
  expect(off.text).toBe('Context bar hidden.')
  let ui = await $.ui.mount(BAND)
  expect(await ui.find({ key: 'Messages' })).toBeUndefined()
  await ui.unmount()

  const on_ = await $.command.run({ command: 'context-bar', args: '' })
  expect(on_.text).toBe('Context bar shown.')
  ui = await $.ui.mount(BAND)
  expect(await ui.find({ key: 'Messages' })).toBeDefined()
  await ui.unmount()
})
