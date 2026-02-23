/**
 * Create runtime stories for Vue CSF
 *
 * This module is responsible for creating runtime story objects
 * from Vue stories files. It mounts the Stories component in
 * extraction mode to collect story definitions.
 */

import type { StoryObj } from '@storybook/vue3'
import type { Component } from 'vue'
import type { Cmp, Meta, StoryAnnotations } from '../types.js'
import type { StoriesRepository } from './contexts/extractor.js'
import { h, render } from 'vue'
import StoriesExtractor from './StoriesExtractor.vue'
import StoryRenderer from './StoryRenderer.vue'

/**
 * Create a runtime stories object from a Vue stories component
 */
export function createRuntimeStories(storiesComponent: Component, meta: Meta): Record<string, StoryObj> {
  const repository: StoriesRepository<Cmp> = {
    stories: new Map(),
  }

  // Create a container element
  const container = document.createElement('div')
  container.style.display = 'none'
  document.body.appendChild(container)

  // Mount the extractor to collect stories
  const vnode = h(StoriesExtractor, {
    storiesComponent,
    repository: () => repository,
  })

  render(vnode, container)

  // Clean up
  render(null, container)
  document.body.removeChild(container)

  // Create story objects from the repository
  const stories: Record<string, StoryObj> = {}

  for (const [exportName, story] of repository.stories) {
    const storyObj: StoryObj = {
      ...(story as StoryAnnotations) as any,
      render: (args: any, storyContext: any) => ({
        components: { StoryRenderer },
        setup() {
          return () =>
            h(StoryRenderer, {
              exportName,
              storiesComponent,
              storyContext,
              args,
              metaRenderTemplate: meta.render,
            } as any)
        },
      }),
    }

    // Handle play function
    const play = story.play
    if (play) {
      storyObj.play = (storyContext: any) => {
        const delegate = storyContext.playFunction?.__play
        if (delegate) {
          return delegate(storyContext)
        }
        return play(storyContext)
      }
    }

    stories[exportName] = storyObj
  }

  // Set meta defaults
  if (!meta.parameters) {
    meta.parameters = {}
  }
  const params = meta.parameters as Record<string, unknown>
  if (!params.controls) {
    params.controls = {}
  }
  (params.controls as Record<string, unknown>).disableSaveFromUI = true

  return stories
}

export default createRuntimeStories
