import { setProjectAnnotations } from '@storybook/vue3-vite'
import { beforeAll } from 'vitest'
import * as projectAnnotations from './preview'

const project = setProjectAnnotations([projectAnnotations])

beforeAll(project.beforeAll)
