import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

// POST /api/admin/users/[id]/approve - Approve a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request)
    if (admin instanceof Response) return admin

    const { id } = await params

    // Check if user exists and is not already approved
    const targetUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (targetUser.isApproved) {
      return NextResponse.json(
        { error: 'User is already approved' },
        { status: 400 }
      )
    }

    // Approve the user
    const approvedUser = await prisma.user.update({
      where: { id },
      data: {
        isApproved: true,
        approvedBy: admin.id
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isApproved: true,
        approver: {
          select: {
            name: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: 'User approved successfully',
        user: approvedUser
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Approve user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}