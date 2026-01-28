"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Mail, KeyRound, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { getApiUrl, API_ENDPOINTS } from "@/lib/api-config"

export default function SchoolAdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [devOTP, setDevOTP] = useState("")

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.OTP.SEND), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role: "school_admin"
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP")
      }

      setOtpSent(true)
      setSuccess("OTP sent successfully! Check your email.")

      if (data.devOTP) {
        setDevOTP(data.devOTP)
        setSuccess(`OTP sent! (Dev Mode - OTP: ${data.devOTP})`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.OTP.VERIFY), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          role: "school_admin"
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Use window.location for hard navigation
      window.location.href = "/dashboard/admin"
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.OTP.RESEND), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role: "school_admin" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP")
      }

      setSuccess("OTP resent successfully!")
      if (data.devOTP) {
        setDevOTP(data.devOTP)
        setSuccess(`OTP resent! (Dev Mode - OTP: ${data.devOTP})`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 relative overflow-hidden">
      {/* Background Shapes for Glass Effect Enhancement */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded-lg shadow-lg transition"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">Back</span>
      </button>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl mb-4 shadow-xl">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white drop-shadow-md">
            School Admin Portal
          </h1>
          <p className="text-blue-100 mt-2 text-lg">
            Access school administrative dashboard
          </p>
        </div>

        {/* Login Card - GLASSPHORISM */}
        <Card className="shadow-2xl border border-white/40 bg-white/10 backdrop-blur-xl text-white">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-white">
              {otpSent ? "Enter OTP" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-blue-100">
              {otpSent
                ? "Enter the 6-digit code sent to your email"
                : "Sign in with OTP verification"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-white">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-500/20 border-green-500/50 text-white">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="schooladmin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-white/20 border-white/30 text-white placeholder:text-blue-200 focus:bg-white/30 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-white/20 hover:bg-white/30 text-white border border-white/40 backdrop-blur-sm transition-all text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending OTP...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Send OTP <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="bg-white/20 border border-white/30 rounded-lg p-4 text-sm text-white">
                  <p className="font-medium mb-1">OTP sent to:</p>
                  <p className="text-blue-100 font-bold">{email}</p>
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-white">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-500/20 border-green-500/50 text-white">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-white">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="h-14 text-center text-3xl tracking-[0.5em] font-mono bg-white/20 border-white/30 text-white placeholder:text-blue-200/50 focus:bg-white/30 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-white text-indigo-600 hover:bg-blue-50 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    "Verify & Login"
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false)
                      setOtp("")
                      setError("")
                      setSuccess("")
                    }}
                    className="text-blue-100 hover:text-white font-medium transition"
                  >
                    ← Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-blue-100 hover:text-white font-medium hover:underline transition"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 text-center text-xs text-blue-200/80">
              <p>🔒 Secure OTP-based authentication • Valid for 10 minutes</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-blue-100/60">
          <p>© 2024 Frontier LMS. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
