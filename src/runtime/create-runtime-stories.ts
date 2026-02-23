/**
 * Create runtime stories for Vue CSF
 * 
 * This module is responsible for creating runtime story objects
 * from Vue stories files. It mounts the Stories component in
 * extraction mode to collect story definitions.
 */

import { h, render, nextTick, createVNode, type Component } from 'vue';
import type { StoryObj } from '@storybook/vue3';
import type { StoriesRepository } from './contexts/extractor.js';
import type { Cmp, ComponentAnnotations } from '../types.js';
import StoriesExtractor from './StoriesExtractor.vue';
import StoryRenderer from './StoryRenderer.vue';

/**
 * Create a runtime stories object from a Vue stories component
 */
export const createRuntimeStories = (
  Stories: Component,
  meta: ComponentAnnotations<Cmp>
): Record<string, StoryObj> => {
  const repository: StoriesRepository<Cmp> = {
    stories: new Map(),
  };

  // Create a container element
  const container = document.createElement('div');
  container.style.display = 'none';
  document.body.appendChild(container);

  // Mount the extractor to collect stories
  const vnode = h(StoriesExtractor, {
    Stories,
    repository: () => repository,
  });

  render(vnode, container);

  // Clean up
  render(null, container);
  document.body.removeChild(container);

  // Create story objects from the repository
  const stories: Record<string, StoryObj> = {};

  for (const [exportName, story] of repository.stories) {
    const storyObj: StoryObj = {
      ...story,
      render: (args, storyContext) => ({
        components: { StoryRenderer },
        setup() {
          return () =>
            h(StoryRenderer, {
              exportName,
              Stories,
              storyContext,
              args,
              metaRenderTemplate: meta.render,
            });
        },
      }),
    };

    // Handle play function
    const play = story.play;
    if (play) {
      storyObj.play = (storyContext) => {
        // @ts-expect-error - accessing internal play function
        const delegate = storyContext.playFunction?.__play;
        if (delegate) {
          return delegate(storyContext);
        }
        return play(storyContext);
      };
    }

    stories[exportName] = storyObj;
  }

  // Set meta defaults
  if (!meta.parameters) {
    meta.parameters = {};
  }
  if (!meta.parameters.controls) {
    meta.parameters.controls = {};
  }
  meta.parameters.controls.disableSaveFromUI = true;

  return stories;
};

export default createRuntimeStories;
