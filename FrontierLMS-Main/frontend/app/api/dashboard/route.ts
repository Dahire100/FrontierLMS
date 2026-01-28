import { NextResponse } from 'next/server';

export async function GET() {
  const mockData = {
    stats: {
      totalSchools: 5,
      totalStudents: 1250,
      activeSubscriptions: 4,
      monthlyRevenue: 150000,
    },
    schools: [
      {
        id: '1',
        name: 'Delhi Public School',
        plan: 'Enterprise',
        students: 450,
        status: 'Active',
        revenue: 'Rs45000',
        growth: '+12.5%',
      },
      {
        id: '2',
        name: 'Mumbai Academy',
        plan: 'Premium',
        students: 380,
        status: 'Active',
        revenue: 'Rs38000',
        growth: '+8.2%',
      },
    ],
    recentActivity: [],
  };
  return NextResponse.json(mockData);
}
