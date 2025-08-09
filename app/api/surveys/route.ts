import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { PoliticalAffiliation, Sex } from '@prisma/client'

// GET /api/surveys - List all surveys for logged-in user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const surveys = await prisma.survey.findMany({
      where: {
        createdBy: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json(
      { surveys },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get surveys error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/surveys - Create new survey
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      age, 
      education, 
      job, 
      phone, 
      politicalAffiliation, 
      religion, 
      caste, 
      sex 
    } = body

    // Validation
    if (!name || !age || !education || !job || !phone || !politicalAffiliation || !religion || !caste || !sex) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate age
    if (age < 1 || age > 120) {
      return NextResponse.json(
        { error: 'Age must be between 1 and 120' },
        { status: 400 }
      )
    }

    // Validate political affiliation
    if (!Object.values(PoliticalAffiliation).includes(politicalAffiliation)) {
      return NextResponse.json(
        { error: 'Invalid political affiliation' },
        { status: 400 }
      )
    }

    // Validate sex
    if (!Object.values(Sex).includes(sex)) {
      return NextResponse.json(
        { error: 'Invalid sex value' },
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

    // Create survey
    const survey = await prisma.survey.create({
      data: {
        name,
        age: parseInt(age),
        education,
        job,
        phone: phone.replace(/\s+/g, ''),
        politicalAffiliation,
        religion,
        caste,
        sex,
        createdBy: user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: 'Survey created successfully',
        survey 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create survey error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 