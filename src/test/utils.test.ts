import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

describe('cn helper (moved)', () => {
  it('merges class names and returns a string', () => {
    const result = cn('btn', 'btn-primary', { hidden: false } as Record<string, boolean>)
    expect(typeof result).toBe('string')
  })
})
