import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { PoliticalAffiliation, Sex } from '@prisma/client'

// GET /api/surveys/[id] - Get single survey
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const survey = await prisma.survey.findFirst({
      where: {
        id: id,
        createdBy: user.id
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

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { survey },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get survey error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/surveys/[id] - Update survey
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    // Check if survey exists and belongs to user
    const existingSurvey = await prisma.survey.findFirst({
      where: {
        id: id,
        createdBy: user.id
      }
    })

    if (!existingSurvey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
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
      customCaste,
      category,
      sex 
    } = body

    // Validation
    if (!name || !age || !education || !job || !phone || !politicalAffiliation || !religion || !caste || !category || !sex) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate custom caste if caste is 'Other'
    if (caste === 'Other' && !customCaste) {
      return NextResponse.json(
        { error: 'Custom caste is required when selecting Other' },
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

    // Update survey
    const updatedSurvey = await prisma.survey.update({
      where: {
        id: id
      },
      data: {
        name,
        age: parseInt(age),
        education,
        job,
        phone: phone.replace(/\s+/g, ''),
        politicalAffiliation,
        religion,
        caste,
        customCaste: caste === 'Other' ? customCaste : null,
        category,
        sex,
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
        message: 'Survey updated successfully',
        survey: updatedSurvey 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update survey error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/surveys/[id] - Delete survey
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    // Check if survey exists and belongs to user
    const existingSurvey = await prisma.survey.findFirst({
      where: {
        id: id,
        createdBy: user.id
      }
    })

    if (!existingSurvey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    // Delete survey
    await prisma.survey.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json(
      { message: 'Survey deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete survey error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 