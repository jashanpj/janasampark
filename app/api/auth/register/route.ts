import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, username, password, phone, role, wardNumber, localBody } = body

    // Validation
    if (!name || !username || !password || !phone || !role || !wardNumber || !localBody) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Validate ward number
    if (wardNumber < 1 || wardNumber > 100) {
      return NextResponse.json(
        { error: 'Ward number must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Validate phone number (basic validation)
    if (!/^\d{10}$/.test(phone.replace(/\s+/g, ''))) {
      return NextResponse.json(
        { error: 'Phone number must be 10 digits' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        phone: phone.replace(/\s+/g, ''),
        role,
        wardNumber: parseInt(wardNumber),
        localBody,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        wardNumber: true,
        localBody: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
} 