import { describe, it, expect, vi } from 'vitest'
import * as docService from '../services/documentService'

vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => ({ items: [], total: 0 }) }))

describe('serviceListDocuments (moved)', () => {
  it('returns list from API', async () => {
    const res = await docService.serviceListDocuments({ page: 1 })
    expect(res).toHaveProperty('items')
  })
})
