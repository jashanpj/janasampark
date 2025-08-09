import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, hashPassword } from '@/lib/auth'
import { UserRole } from '@prisma/client'

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request)
    if (admin instanceof Response) return admin

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
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
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request)
    if (admin instanceof Response) return admin

    const { id } = await params
    const body = await request.json()
    const { name, username, phone, role, wardNumber, localBody, isApproved } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Validation
    if (!name || !username || !phone || !role || !wardNumber || !localBody) {
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

    // Only super admin can update admin users or change roles to admin
    if ((existingUser.role === 'ADMIN' || existingUser.role === 'SUPER_ADMIN' || 
         role === 'ADMIN' || role === 'SUPER_ADMIN') && admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only super admin can manage admin users' },
        { status: 403 }
      )
    }

    // Prevent changing own role
    if (existingUser.id === admin.id && existingUser.role !== role) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    // Check if new username already exists (if username is being changed)
    if (username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username }
      })

      if (usernameExists) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        )
      }
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

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        username,
        phone: phone.replace(/\s+/g, ''),
        role,
        wardNumber: parseInt(wardNumber),
        localBody,
        isApproved: isApproved !== undefined ? isApproved : existingUser.isApproved
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
        updatedAt: true
      }
    })

    return NextResponse.json(
      { 
        message: 'User updated successfully',
        user: updatedUser
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request)
    if (admin instanceof Response) return admin

    const { id } = await params

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only super admin can delete admin users
    if ((existingUser.role === 'ADMIN' || existingUser.role === 'SUPER_ADMIN') && 
        admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only super admin can delete admin users' },
        { status: 403 }
      )
    }

    // Prevent deleting own account
    if (existingUser.id === admin.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user (surveys will be cascade deleted)
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}