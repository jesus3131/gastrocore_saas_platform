import type { Request, Response, NextFunction } from 'express'

export function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next)
  }
}

export function wrapAsync<T extends Record<string, any>>(target: T): T {
  const wrapped: any = {}
  const proto = Object.getPrototypeOf(target)
  const keys = new Set([...Object.keys(target), ...Object.getOwnPropertyNames(proto).filter(k => k !== 'constructor')])
  for (const key of keys) {
    const val = target[key as keyof T]
    if (typeof val === 'function') {
      wrapped[key] = asyncHandler(val.bind(target))
    } else {
      wrapped[key] = val
    }
  }
  return wrapped
}
