"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  Mail,
  KeyRound,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  GraduationCap
} from "lucide-react"
import { getApiUrl, API_ENDPOINTS } from "@/lib/api-config"

export default function TeacherLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [devOTP, setDevOTP] = useState("")
  const [activeStep, setActiveStep] = useState(1)

  // Captcha State
  const [captcha, setCaptcha] = useState("")
  const [userCaptchaInput, setUserCaptchaInput] = useState("")

  const generateCaptcha = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
    setUserCaptchaInput("");
  }

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Handle individual OTP input changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (userCaptchaInput !== captcha) {
      setError("Invalid Captcha. Please try again.");
      generateCaptcha();
      return;
    }

    setIsLoading(true)

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.OTP.SEND), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role: "teacher"
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate login")
      }

      setOtpSent(true)
      setActiveStep(2)
      setSuccess("We've sent a secure code to your inbox.")

      if (data.devOTP) {
        setDevOTP(data.devOTP)
        // For development convenience, we'll auto-fill if user clicks?
        // No, let's just keep the message subtle.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const fullOtp = otp.join("")
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit code.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.OTP.VERIFY), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: fullOtp,
          role: "teacher"
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "The code you entered is incorrect.")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Success animation then redirect
      setSuccess("Authentication successful. Redirecting...")
      setTimeout(() => {
        window.location.href = "/dashboard/teacher"
      }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.")
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
        body: JSON.stringify({ email, role: "teacher" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Resend failed")
      }

      setSuccess("A new code has been dispatched.")
      if (data.devOTP) setDevOTP(data.devOTP)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-[120px] opacity-60" />
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="absolute top-8 left-8 flex items-center gap-2 group text-gray-400 hover:text-gray-900 transition-colors z-10"
      >
        <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight uppercase">Return</span>
      </motion.button>

      <div className="w-full max-w-[440px] px-6 z-10">
        {/* Identity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-white shadow-2xl shadow-indigo-100/50 rounded-[2.5rem] mb-6 border border-gray-50">
            <GraduationCap className="h-10 w-10 text-indigo-600 stroke-[1.5]" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-3 italic uppercase">
            Educator <span className="text-indigo-600 tracking-tighter not-italic font-medium lowercase italic">Access</span>
          </h1>
          <p className="text-gray-400 font-medium text-sm tracking-wide uppercase italic">
            Secure Gateway for Teaching Professionals
          </p>
        </motion.div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 border-none bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
              <ShieldCheck className="w-32 h-32 text-indigo-900" />
            </div>

            <AnimatePresence mode="wait">
              {!otpSent ? (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-gray-900">Sign In</h2>
                      <p className="text-sm text-gray-400 font-medium">Please provide your registered institutional email.</p>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <Alert variant="destructive" className="bg-rose-50 border-none text-rose-600 rounded-2xl py-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs font-bold uppercase tracking-tight">{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <div className="relative group">
                        <Label htmlFor="email" className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-indigo-600 transition-colors">Credential</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-400 transition-colors" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="name@institution.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-indigo-50 border-2 transition-all font-medium text-gray-900"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Check</Label>
                        <div className="flex gap-2">
                          <div
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center font-mono text-lg font-bold tracking-widest select-none relative overflow-hidden cursor-pointer"
                            onClick={generateCaptcha}
                            style={{ height: '56px' }}
                            title="Click to regenerate"
                          >
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '10px 10px' }}></div>
                            <span className="relative z-10 text-gray-800 transform -skew-x-12">{captcha}</span>
                          </div>
                          <Button type="button" variant="outline" onClick={generateCaptcha} className="h-14 w-14 p-0 rounded-2xl border-gray-100 hover:bg-gray-50 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                          </Button>
                        </div>
                        <Input
                          type="text"
                          placeholder="Enter characters"
                          value={userCaptchaInput}
                          onChange={(e) => setUserCaptchaInput(e.target.value)}
                          required
                          className="h-14 pl-4 rounded-2xl border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-4 focus:ring-indigo-50 border-2 transition-all font-medium text-gray-900"
                        />
                      </div>

                      <Button
                        onClick={handleSendOTP}
                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] disabled:opacity-50"
                        disabled={isLoading || !email}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Initialize Authentication <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Identity Verification</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 italic">Code sent to: {email}</p>
                      </div>
                      <button
                        onClick={() => { setOtpSent(false); setOtp(["", "", "", "", "", ""]); setError(""); setSuccess(""); }}
                        className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <Alert variant="destructive" className="bg-rose-50 border-none text-rose-600 rounded-2xl py-3 text-center">
                          <AlertDescription className="text-xs font-black uppercase tracking-tight">{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    {success && devOTP && (
                      <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest text-center italic">
                        Developer Mode: <span className="underline select-all">{devOTP}</span>
                      </div>
                    )}

                    <div className="flex gap-2 justify-center">
                      {otp.map((digit, idx) => (
                        <Input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className="w-12 h-16 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-center text-2xl font-black text-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all uppercase"
                          maxLength={1}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={handleVerifyOTP}
                      className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-2xl shadow-xl shadow-gray-200 font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] disabled:opacity-50"
                      disabled={isLoading || otp.some(d => !d)}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Validating</span>
                        </div>
                      ) : (
                        "Verify & Confirm Identity"
                      )}
                    </Button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-indigo-600 transition-colors py-2 px-4 rounded-full hover:bg-indigo-50"
                      >
                        Resend Security Code
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {success && !isLoading && !devOTP && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-emerald-50 border-none text-emerald-600 rounded-2xl flex items-center gap-3"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <p className="text-xs font-black uppercase tracking-tight">{success}</p>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
            <span className="w-8 h-[1px] bg-gray-200"></span>
            <span>Identity Protocol Active</span>
            <span className="w-8 h-[1px] bg-gray-200"></span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium">
            © 2024 Institutional ERP System. <br />
            Designed for secure academic administration.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
