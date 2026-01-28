import { NextResponse } from 'next/server'

export async function POST() {
  console.log('🎯 TEST ROUTE DEFINITELY CALLED!')
  return NextResponse.json({ message: 'Test route working!' })
}