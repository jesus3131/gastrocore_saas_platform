import type { Request, Response, NextFunction } from 'express'

export function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next)
  }
}

export function wrapAsync<T extends Record<string, any>>(target: T): T {
  const wrapped: any = {}
  for (const key of Object.keys(target)) {
    const val = target[key]
    if (typeof val === 'function') {
      wrapped[key] = asyncHandler(val.bind(target))
    } else {
      wrapped[key] = val
    }
  }
  return wrapped
}
