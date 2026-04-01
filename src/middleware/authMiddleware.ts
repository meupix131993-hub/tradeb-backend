import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

type JwtPayload = {
  email: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      message: 'Token não enviado',
    })
  }

  const [, token] = authHeader.split(' ')

  if (!token) {
    return res.status(401).json({
      message: 'Token inválido',
    })
  }

  try {
    const secret = process.env.JWT_SECRET

    if (!secret) {
      return res.status(500).json({
        message: 'JWT_SECRET não configurado',
      })
    }

    const decoded = jwt.verify(token, secret) as JwtPayload
    req.user = decoded

    next()
  } catch {
    return res.status(401).json({
      message: 'Token inválido ou expirado',
    })
  }
}
