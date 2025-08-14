// Setup global mocks and helpers for tests

// Mock localStorage for tests
class LocalStorageMock implements Storage {
  store: Record<string, string> = {}

  get length() {
    return Object.keys(this.store).length
  }

  clear() { this.store = {} }

  getItem(key: string) { return this.store[key] ?? null }

  setItem(key: string, value: string) { this.store[key] = String(value) }

  removeItem(key: string) { delete this.store[key] }

  key(index: number): string | null {
    const keys = Object.keys(this.store)
    return keys[index] ?? null
  }
}

globalThis.localStorage = new LocalStorageMock() as Storage

globalThis.fetch = globalThis.fetch || (async () =>
  ({
    ok: true,
    json: async () => ({}),
  } as Response)
)
