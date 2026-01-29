'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Users, School } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function SchoolLoginSelection() {
    const router = useRouter();
    const params = useParams();
    const schoolId = params.schoolId as string;
    const schoolName = schoolId ? schoolId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'School';

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 flex flex-col items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl max-w-4xl w-full border border-white/20">
                <div className="text-center mb-12">
                    <div className="inline-block p-4 bg-orange-500 rounded-full mb-6 shadow-lg">
                        <School className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Select Login Type
                    </h1>
                    <p className="text-xl text-indigo-100 font-medium max-w-2xl mx-auto">
                        Welcome to {schoolName}. Please select your role to proceed.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* Faculty Login Option */}
                    <Link
                        href={`/schools/${schoolId}/faculty`}
                        className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-orange-400"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="bg-blue-100 p-4 rounded-full mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                                <Users className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-700">Faculty Login</h2>
                            <p className="text-gray-500 group-hover:text-gray-700">Access for Admins and Teachers</p>
                        </div>
                    </Link>

                    {/* Student/Parent Login Option */}
                    <Link
                        href={`/schools/${schoolId}/student`}
                        className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-orange-400"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <GraduationCap size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="bg-purple-100 p-4 rounded-full mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                                <GraduationCap className="w-10 h-10 text-purple-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-700">Student Login</h2>
                            <p className="text-gray-500 group-hover:text-gray-700">Access for Students and Parents</p>
                        </div>
                    </Link>
                </div>

                <div className="mt-12 text-center">
                    <button onClick={() => router.back()} className="text-indigo-200 hover:text-white transition-colors underline decoration-2 underline-offset-4">
                        ← Back to Home
                    </button>
                </div>
            </div>

            <div className="mt-8 text-white/50 text-sm">
                &copy; 2025 Frontier LMS. All rights reserved.
            </div>
        </div>
    );
}
