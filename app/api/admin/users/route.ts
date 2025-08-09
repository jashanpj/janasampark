import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { hashPassword } from '@/lib/auth'
import { UserRole } from '@prisma/client'

// GET /api/admin/users - Get all users for admin management
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof Response) return user

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        phone: true,
        role: true,
        isApproved: true,
        wardNumber: true,
        localBody: true,
        createdAt: true,
        updatedAt: true,
        approvedBy: true,
        approver: {
          select: {
            name: true,
            username: true
          }
        },
        _count: {
          select: {
            surveys: true
          }
        }
      },
      orderBy: [
        { isApproved: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create new user (Admin/Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (admin instanceof Response) return admin

    const body = await request.json()
    const { name, username, password, phone, role, wardNumber, localBody, isApproved } = body

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

    // Only super admin can create admin users
    if ((role === 'ADMIN' || role === 'SUPER_ADMIN') && admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only super admin can create admin users' },
        { status: 403 }
      )
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
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

    // Validate phone number
    if (!/^\d{10}$/.test(phone.replace(/\s+/g, ''))) {
      return NextResponse.json(
        { error: 'Phone number must be 10 digits' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        phone: phone.replace(/\s+/g, ''),
        role,
        wardNumber: parseInt(wardNumber),
        localBody,
        isApproved: isApproved !== undefined ? isApproved : true, // Admin-created users are approved by default
        approvedBy: admin.id
      },
      select: {
        id: true,
        name: true,
        username: true,
        phone: true,
        role: true,
        isApproved: true,
        wardNumber: true,
        localBody: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: newUser
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}