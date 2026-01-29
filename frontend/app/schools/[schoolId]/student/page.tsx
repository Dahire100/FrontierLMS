"use client";
export const dynamic = 'force-dynamic';
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, HelpCircle, ArrowRight, ArrowLeft, GraduationCap, BookOpen, RefreshCw } from "lucide-react";
import { getApiUrl, API_ENDPOINTS, API_URL } from "@/lib/api-config";

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

    // Captcha State
    const [captchaValue, setCaptchaValue] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [schoolLogo, setSchoolLogo] = useState("");

    const generateCaptcha = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaValue(result);
        setCaptchaInput("");
    };

    React.useEffect(() => {
        generateCaptcha();

        // Fetch School Public Info (Logo)
        const fetchSchoolInfo = async () => {
            if (!schoolId) return;
            try {
                const apiUrl = getApiUrl(`/api/schools/public/${schoolId}`);
                const res = await fetch(apiUrl);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.school && data.school.logo) {
                        setSchoolLogo(data.school.logo);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch school info:", error);
            }
        };

        fetchSchoolInfo();
    }, [schoolId]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (captchaInput !== captchaValue) {
            setError("Incorrect Security Code. Please try again.");
            generateCaptcha();
            setLoading(false);
            return;
        }

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
                        {schoolLogo ? (
                            <img
                                src={`${API_URL}${schoolLogo}`}
                                alt={schoolName}
                                className="w-32 h-32 object-contain bg-white/90 rounded-xl p-2"
                            />
                        ) : (
                            <GraduationCap size={64} className="text-yellow-300" />
                        )}
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
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-teal-50 p-1.5 rounded-lg text-teal-600 group-focus-within:bg-teal-600 group-focus-within:text-white transition-all duration-300">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter your ID"
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 pl-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-teal-50 p-1.5 rounded-lg text-teal-600 group-focus-within:bg-teal-600 group-focus-within:text-white transition-all duration-300">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Captcha Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 pl-1">Security Check</label>
                            <div className="flex gap-3">
                                <div
                                    className="flex-1 h-12 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center font-mono text-xl font-bold tracking-widest text-gray-600 select-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
                                >
                                    {captchaValue}
                                </div>
                                <button
                                    type="button"
                                    onClick={generateCaptcha}
                                    className="h-12 w-12 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition-all"
                                    title="Refresh Code"
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter security code"
                                className="w-full pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all font-medium"
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Authenticating...
                                    </span>
                                ) : (
                                    <>
                                        SIGN IN <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <Link href={`/schools/${schoolId}/help`} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 text-sm font-medium transition-colors">
                            <HelpCircle size={16} /> Need Help?
                        </Link>

                        <div className="flex flex-col items-end gap-3 text-sm">
                            <Link href={`/schools/${schoolId}/faculty`} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold group transition-colors">
                                <BookOpen size={18} />
                                Faculty Login
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
