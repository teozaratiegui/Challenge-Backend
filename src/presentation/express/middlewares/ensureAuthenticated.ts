import { Request, Response, NextFunction } from 'express'

/**
 * Factory to create a middleware that validates a specific API key based on .env variable name
 * @param envKeyName The name of the environment variable to compare against
 */
export function ensureAuthenticated(envKeyName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.headers['api-key'] as string | undefined

    if (!apiKey) {
      res.status(401).json({ error: 'API key missing' })
      return
    }

    const validApiKey = process.env[envKeyName]

    if (!validApiKey) {
      res.status(500).json({ error: `Server misconfiguration: ${envKeyName} is missing` })
      return
    }

    if (apiKey !== validApiKey) {
      res.status(403).json({ error: 'Invalid API key' })
      return
    }

    next()
  }
}
