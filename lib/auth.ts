import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export interface JWTPayload {
  userId: string
  username: string
  role: string
  isApproved: boolean
}

// Password hashing functions
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

// JWT token functions
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Auth middleware
export const getAuthUser = async (request: NextRequest) => {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isApproved: true,
        wardNumber: true,
        localBody: true,
        createdAt: true,
      },
    })

    // Check if user is approved
    if (!user?.isApproved) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

// Protected route helper
export const requireAuth = async (request: NextRequest) => {
  const user = await getAuthUser(request)
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  return user
}

// Admin authorization helper
export const requireAdmin = async (request: NextRequest) => {
  const user = await getAuthUser(request)
  
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return new Response(
      JSON.stringify({ error: 'Admin access required' }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  return user
}

// Super admin authorization helper
export const requireSuperAdmin = async (request: NextRequest) => {
  const user = await getAuthUser(request)
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    return new Response(
      JSON.stringify({ error: 'Super admin access required' }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  return user
} 