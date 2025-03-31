import { Request, Response, NextFunction } from 'express'

/**
 * Middleware to ensure the request contains a valid API key in the headers.
 */
export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['api-key'] as string | undefined

  if (!apiKey) {
    res.status(401).json({ error: 'API key missing' })
    return
  }

  const validApiKey = process.env.API_KEY

  if (apiKey !== validApiKey) {
    res.status(403).json({ error: 'Invalid API key' })
    return
  }

  next()
}
