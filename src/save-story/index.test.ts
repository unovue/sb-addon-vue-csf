import { afterEach, describe, expect, it, vi } from 'vitest'
import { initializeSaveStory } from './index'

// Mock fs
vi.mock('node:fs', () => ({
  readFileSync: vi.fn((filePath: string) => {
    if (filePath.includes('Button.stories.vue')) {
      return `<script setup>
import { defineMeta } from 'sb-addon-vue-csf'
import Button from './Button.vue'
const { Story } = defineMeta({ title: 'Example/Button', component: Button })
</script>
<template>
  <Story
    name="Primary"
    :args="{
      primary: true,
      label: 'Button',
    }"
  />

  <Story
    name="Secondary"
    :args="{
      label: 'Button',
    }"
  />
</template>`
    }
    throw new Error(`File not found: ${filePath}`)
  }),
  writeFileSync: vi.fn(),
}))

function createChannel() {
  const handlers: Record<string, ((...args: any[]) => void)[]> = {}
  return {
    on: vi.fn((event: string, handler: (...args: any[]) => void) => {
      if (!handlers[event])
        handlers[event] = []
      handlers[event].push(handler)
    }),
    emit: vi.fn(),
    // Helper to trigger events in tests
    trigger: (event: string, data: any) => {
      for (const handler of handlers[event] || []) {
        handler(data)
      }
    },
  }
}

describe('initializeSaveStory', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should register a SAVE_STORY_REQUEST handler', () => {
    const channel = createChannel()
    initializeSaveStory(channel)

    expect(channel.on).toHaveBeenCalledWith('saveStoryRequest', expect.any(Function))
  })

  it('should skip non-.stories.vue files', async () => {
    const channel = createChannel()
    initializeSaveStory(channel)

    await channel.trigger('saveStoryRequest', {
      id: 'req-1',
      payload: {
        csfId: 'button--primary',
        importPath: './Button.stories.ts',
        args: '{"primary":true}',
      },
    })

    // Should NOT emit a response (let core handler deal with it)
    expect(channel.emit).not.toHaveBeenCalled()
  })

  it('should merge incoming args with existing args', async () => {
    const { writeFileSync } = await import('node:fs')
    const channel = createChannel()
    initializeSaveStory(channel)

    // Only send label — existing primary:true should be preserved
    await channel.trigger('saveStoryRequest', {
      id: 'req-2',
      payload: {
        csfId: 'example-button--primary',
        importPath: './Button.stories.vue',
        args: '{"label":"Updated"}',
      },
    })

    // Should write the updated file
    expect(writeFileSync).toHaveBeenCalled()
    const writtenContent = (writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string
    // Existing arg should be preserved
    expect(writtenContent).toContain('primary: true')
    // New arg should be added
    expect(writtenContent).toContain('label: \'Updated\'')

    // Should emit success response
    expect(channel.emit).toHaveBeenCalledWith('saveStoryResponse', expect.objectContaining({
      id: 'req-2',
      success: true,
    }))
  })

  it('should override existing arg values with incoming ones', async () => {
    const { writeFileSync } = await import('node:fs')
    const channel = createChannel()
    initializeSaveStory(channel)

    await channel.trigger('saveStoryRequest', {
      id: 'req-2b',
      payload: {
        csfId: 'example-button--primary',
        importPath: './Button.stories.vue',
        args: '{"primary":false,"label":"Updated"}',
      },
    })

    expect(writeFileSync).toHaveBeenCalled()
    const writtenContent = (writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string
    expect(writtenContent).toContain('primary: false')
    expect(writtenContent).toContain('label: \'Updated\'')
  })

  it('should emit error for non-existent story', async () => {
    const channel = createChannel()
    initializeSaveStory(channel)

    await channel.trigger('saveStoryRequest', {
      id: 'req-3',
      payload: {
        csfId: 'example-button--nonexistent',
        importPath: './Button.stories.vue',
        args: '{"primary":true}',
      },
    })

    expect(channel.emit).toHaveBeenCalledWith('saveStoryResponse', expect.objectContaining({
      id: 'req-3',
      success: false,
      error: expect.stringContaining('not found'),
    }))
  })

  it('should handle create new story request', async () => {
    const { writeFileSync } = await import('node:fs')
    const channel = createChannel()
    initializeSaveStory(channel)

    await channel.trigger('saveStoryRequest', {
      id: 'req-4',
      payload: {
        csfId: 'example-button--primary',
        importPath: './Button.stories.vue',
        args: '{"primary":true,"label":"New Story"}',
        name: 'MyNewStory',
      },
    })

    expect(writeFileSync).toHaveBeenCalled()
    const writtenContent = (writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string
    // Original story should still be there
    expect(writtenContent).toContain('name="Primary"')
    // New story should be added
    expect(writtenContent).toContain('My New Story')

    expect(channel.emit).toHaveBeenCalledWith('saveStoryResponse', expect.objectContaining({
      id: 'req-4',
      success: true,
    }))
  })

  it('should only update the targeted story, not other stories', async () => {
    const { writeFileSync } = await import('node:fs')
    const channel = createChannel()
    initializeSaveStory(channel)

    await channel.trigger('saveStoryRequest', {
      id: 'req-6',
      payload: {
        csfId: 'example-button--primary',
        importPath: './Button.stories.vue',
        args: '{"primary":false,"label":"Updated"}',
      },
    })

    expect(writeFileSync).toHaveBeenCalled()
    const writtenContent = (writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string
    // Secondary story should be unchanged
    expect(writtenContent).toContain('name="Secondary"')
    expect(writtenContent).toContain('label: \'Button\'')
  })

  it('should emit clear error when file read fails', async () => {
    const channel = createChannel()
    initializeSaveStory(channel)

    await channel.trigger('saveStoryRequest', {
      id: 'req-5',
      payload: {
        csfId: 'example--primary',
        importPath: './NonExistent.stories.vue',
        args: '{}',
      },
    })

    expect(channel.emit).toHaveBeenCalledWith('saveStoryResponse', expect.objectContaining({
      id: 'req-5',
      success: false,
      error: expect.stringContaining('[sb-addon-vue-csf]'),
    }))
  })
})
