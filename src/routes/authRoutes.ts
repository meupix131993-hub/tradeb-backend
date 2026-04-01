import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const router = Router()

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: parsed.error.flatten(),
      })
    }

    const { email, password } = parsed.data

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const jwtSecret = process.env.JWT_SECRET

    if (!adminEmail || !adminPassword || !jwtSecret) {
      return res.status(500).json({
        message: 'Variáveis de ambiente obrigatórias não configuradas',
      })
    }

    if (email !== adminEmail) {
      return res.status(401).json({
        message: 'E-mail ou senha inválidos',
      })
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10)
    const passwordMatch = await bcrypt.compare(password, passwordHash)

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'E-mail ou senha inválidos',
      })
    }

    const token = jwt.sign(
      {
        email: adminEmail,
        role: 'ADMIN',
      },
      jwtSecret,
      {
        expiresIn: '1d',
      }
    )

    return res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        email: adminEmail,
        role: 'ADMIN',
      },
    })
  } catch {
    return res.status(500).json({
      message: 'Erro interno no login',
    })
  }
})

export default router