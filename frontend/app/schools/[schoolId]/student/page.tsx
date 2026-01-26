"use client";
export const dynamic = 'force-dynamic';
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, HelpCircle, ArrowRight, ArrowLeft, GraduationCap } from "lucide-react";
import { getApiUrl, API_ENDPOINTS } from "@/lib/api-config";

export default function StudentLoginPage() {
    const router = useRouter();
    const params = useParams();
    const schoolId = params.schoolId as string;
    const schoolName = schoolId
        ? schoolId.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
        : "School";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const apiUrl = getApiUrl(API_ENDPOINTS.AUTH.SCHOOL_LOGIN);
            const requestBody = {
                email: username, // Send as email field (backend checks email || username)
                username: username,
                password,
                schoolId: schoolId,
                portalType: "student"
            };

            console.log('Student Login Request:', { apiUrl, schoolId, username });

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Response status:', response.status, response.statusText);

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                throw new Error('Server returned invalid response');
            }

            console.log('Response data:', data);

            if (!response.ok) {
                const errorMessage = data.error || data.message || `Login failed (${response.status})`;
                console.error("Login failed:", errorMessage, data);
                throw new Error(errorMessage);
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Use window.location for hard navigation to ensure localStorage is available
            const role = data.user?.role;

            if (role === 'parent') {
                window.location.href = '/dashboard/parent';
            } else if (role === 'student') {
                window.location.href = '/dashboard/student';
            } else if (role === 'teacher') {
                window.location.href = '/dashboard/teacher';
            } else if (role === 'school_admin' || role === 'admin') {
                window.location.href = '/dashboard/admin';
            } else {
                console.error("Unknown role:", role);
                window.location.href = '/';
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Side - Visuals - UPDATED TO TEAL/EMERALD THEME */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-500 via-emerald-600 to-green-700 items-center justify-center relative overflow-hidden p-12">
                <div className="relative z-10 text-center text-white space-y-8">
                    <div className="inline-block p-6 bg-white/10 backdrop-blur-md rounded-3xl mb-4 shadow-2xl border border-white/20">
                        <GraduationCap size={64} className="text-yellow-300" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-bold mb-4 leading-tight">{schoolName}</h1>
                        <h2 className="text-2xl font-light text-teal-50">Student & Parent Portal</h2>
                    </div>
                    <p className="max-w-md mx-auto text-teal-100 leading-relaxed text-lg">
                        Empowering students with digital learning tools and parents with real-time progress tracking.
                    </p>

                    <div className="pt-8 flex justify-center gap-4">
                        <div className="bg-white/10 backdrop-blur px-6 py-3 rounded-xl border border-white/10">
                            <span className="font-bold text-2xl block">Easy</span>
                            <span className="text-sm text-teal-50">Access</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur px-6 py-3 rounded-xl border border-white/10">
                            <span className="font-bold text-2xl block">Real-time</span>
                            <span className="text-sm text-teal-50">Updates</span>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-200 via-transparent to-transparent"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h3 className="text-3xl font-bold text-teal-700">Student Sign-In</h3>
                        <p className="text-gray-500">Welcome back! Please login to continue.</p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 pl-1">Username / ID</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Enter your ID"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 pl-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? 'Authenticating...' : 'SIGN IN'}
                            </button>
                        </div>
                    </form>

                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <Link href={`/schools/${schoolId}/help`} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 text-sm font-medium transition-colors">
                            <HelpCircle size={16} /> Need Help?
                        </Link>

                        <div className="flex flex-col items-end gap-3 text-sm">
                            <Link href={`/schools/${schoolId}/faculty`} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold group transition-colors">
                                Faculty Login <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href={`/schools/${schoolId}/forgot-password?role=student`} className="text-gray-400 hover:text-gray-600 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Back Button positioned absolutely */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all flex items-center gap-2 group"
                    title="Go Back"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
