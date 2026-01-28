"use client"

import { API_URL } from "@/lib/api-config"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, User, Lock, ArrowRight, HelpCircle, Eye, EyeOff, GraduationCap } from "lucide-react"
import { toast } from "sonner"

interface School {
    _id: string
    schoolName: string
    city: string
    state: string
}

export default function SchoolLoginPage() {
    const params = useParams()
    const router = useRouter()
    const schoolId = params.schoolId as string

    const [school, setSchool] = useState<School | null>(null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isFetchingSchool, setIsFetchingSchool] = useState(true)
    const [loginType, setLoginType] = useState<"faculty" | "student">("faculty")

    useEffect(() => {
        const fetchSchoolDetails = async () => {
            try {
                const response = await fetch(`${API_URL}/api/schools/active`)
                if (response.ok) {
                    const data = await response.json()
                    const foundSchool = data.schools.find((s: School) => s._id === schoolId)
                    if (foundSchool) {
                        setSchool(foundSchool)
                    } else {
                        toast.error("School not found")
                        router.push("/")
                    }
                }
            } catch (error) {
                console.error("Failed to fetch school:", error)
            } finally {
                setIsFetchingSchool(false)
            }
        }

        if (schoolId) {
            fetchSchoolDetails()
        }
    }, [schoolId, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/auth/school-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    schoolId,
                    portalType: loginType // 'faculty' or 'student'
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Login failed")
            }


            // Store token and user data
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))

            toast.success(`Welcome back to ${school?.schoolName}`)

            // Redirect based on role
            const roleRoutes: Record<string, string> = {
                super_admin: "/dashboard/super-admin",
                school_admin: "/dashboard/admin",
                teacher: "/dashboard/teacher",
                student: "/dashboard/student",
                parent: "/dashboard/parent",
            }

            const redirectRoute = roleRoutes[data.user.role] || "/dashboard/admin"
            router.push(redirectRoute)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Login failed")
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetchingSchool) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!school) return null

    const isFaculty = loginType === "faculty"

    return (
        <div className="min-h-screen flex overflow-hidden bg-white">
            {/* Left Panel */}
            <div
                className={`hidden lg:flex flex-col justify-center items-center w-1/2 p-12 text-white transition-colors duration-500 ${isFaculty
                    ? "bg-gradient-to-br from-blue-600 to-indigo-700"
                    : "bg-gradient-to-br from-emerald-500 to-teal-700"
                    }`}
            >
                <div className="max-w-md text-center space-y-8">
                    {/* Logo/Icon Box */}
                    <div className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl">
                        {isFaculty ? (
                            <BookOpen className="w-12 h-12 text-white" />
                        ) : (
                            <GraduationCap className="w-12 h-12 text-white" />
                        )}
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight">
                        {school.schoolName}
                    </h1>

                    <h2 className="text-xl font-medium text-white/90">
                        {isFaculty ? "Faculty & Admin Portal" : "Student & Parent Portal"}
                    </h2>

                    <p className="text-white/80 leading-relaxed text-lg">
                        {isFaculty
                            ? "Access your dashboard to manage classes, attendance, and administrative tasks efficiently."
                            : "Empowering students with digital learning tools and parents with real-time progress tracking."
                        }
                    </p>

                    <div className="flex justify-center gap-6 pt-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 w-32">
                            <div className="text-2xl font-bold">100%</div>
                            <div className="text-sm text-white/70">Secure</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 w-32">
                            <div className="text-2xl font-bold">24/7</div>
                            <div className="text-sm text-white/70">Support</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 relative">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/")}
                    className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    ← Back
                </button>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className={`text-3xl font-bold ${isFaculty ? 'text-blue-600' : 'text-emerald-600'}`}>
                            {isFaculty ? "Faculty Sign-In" : "Student Sign-In"}
                        </h2>
                        <p className="text-gray-500">
                            {isFaculty ? "Enter your credentials to access your account" : "Welcome back! Please login to continue."}
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Username / ID
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Enter your ID or Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className={`w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${isFaculty
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                }`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "SIGN IN"}
                        </Button>
                    </form>

                    <div className="flex items-center justify-between pt-4">
                        <button className="flex items-center text-sm text-gray-500 hover:text-gray-900 gap-1">
                            <HelpCircle className="h-4 w-4" />
                            Need Help?
                        </button>

                        <div className="text-right space-y-1">
                            <button
                                onClick={() => setLoginType(isFaculty ? "student" : "faculty")}
                                className={`block text-sm font-medium hover:underline ${isFaculty ? "text-blue-600" : "text-emerald-600"
                                    }`}
                            >
                                {isFaculty ? "Student Login →" : "Faculty Login →"}
                            </button>
                            <button className="block text-xs text-gray-400 hover:text-gray-600">
                                Forgot Password?
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
