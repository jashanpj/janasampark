import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

// GET /api/admin/surveys - Get all surveys for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (admin instanceof Response) return admin

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''
    const localBody = url.searchParams.get('localBody') || ''
    const wardNumber = url.searchParams.get('wardNumber') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }

    // Build user filters
    const userFilters: any = {}
    
    if (localBody) {
      userFilters.localBody = {
        equals: localBody,
        mode: 'insensitive'
      }
    }

    if (wardNumber) {
      userFilters.wardNumber = parseInt(wardNumber)
    }

    if (Object.keys(userFilters).length > 0) {
      where.user = userFilters
    }

    const [surveys, totalCount] = await Promise.all([
      prisma.survey.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
              wardNumber: true,
              localBody: true
            }
          }
        }
      }),
      prisma.survey.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      surveys,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Get admin surveys error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET survey statistics
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (admin instanceof Response) return admin

    const [
      totalSurveys,
      totalUsers,
      pendingApprovals,
      recentSurveys
    ] = await Promise.all([
      prisma.survey.count(),
      prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
      prisma.user.count({ where: { isApproved: false } }),
      prisma.survey.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              localBody: true,
              wardNumber: true
            }
          }
        }
      })
    ])

    return NextResponse.json({
      statistics: {
        totalSurveys,
        totalUsers,
        pendingApprovals,
        recentSurveys
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Get admin statistics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}