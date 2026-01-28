import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('🚀 REGISTER ROUTE CALLED at:', new Date().toISOString())
  
  try {
    // Log that we entered the route
    console.log('✅ Reached the register route handler')
    
    const data = await request.json()
    console.log('📝 Request data:', data)

    const backendUrl = 'http://localhost:5001'
    const targetUrl = `${backendUrl}/api/schools/register`
    console.log('🔄 Calling backend:', targetUrl)

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    console.log('📡 Backend response status:', response.status)
    console.log('📡 Backend response ok:', response.ok)

    if (!response.ok) {
      const text = await response.text()
      console.error('❌ Backend returned error:', {
        status: response.status,
        statusText: response.statusText, 
        body: text
      })
      return NextResponse.json(
        { error: 'Registration failed', details: text || `status ${response.status}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('✅ Backend success:', result)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('🚨 API route error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Registration failed', details: errorMessage },
      { status: 500 }
    )
  }
}