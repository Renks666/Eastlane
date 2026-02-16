function withScope(scope: string) {
  return `[${scope}]`
}

export const logger = {
  info(scope: string, message: string, meta?: unknown) {
    if (meta !== undefined) {
      console.info(withScope(scope), message, meta)
      return
    }
    console.info(withScope(scope), message)
  },
  error(scope: string, message: string, meta?: unknown) {
    if (meta !== undefined) {
      console.error(withScope(scope), message, meta)
      return
    }
    console.error(withScope(scope), message)
  },
}

