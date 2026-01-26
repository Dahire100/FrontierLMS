"use client"

import { API_URL } from "@/lib/api-config"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Building2, Mail, Phone, MapPin, User, Calendar, FileText, ArrowRight, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    schoolName: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pinCode: "",
    contactNumber: "",
    email: "",
    principalName: "",
    principalEmail: "",
    principalPhone: "",
    schoolType: "private",
    boardType: "cbse",
    establishmentYear: "",
    description: "",
    totalStudents: "",
    totalTeachers: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/schools/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-6 rounded-full">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-gray-900">Registration Submitted Successfully!</h2>
              <p className="text-lg text-gray-600 max-w-lg mx-auto">
                Thank you for registering with FrontierLMS. Your application has been received and is under review.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-blue-900">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Our team will review your school registration details</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>You will receive payment details via email within 24 hours</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>After payment confirmation, your account will be activated</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Login credentials will be sent to your registered email</span>
                </li>
              </ul>
            </div>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FrontierLMS
            </h1>
          </div>
          <p className="text-gray-600">Register your school and start managing efficiently</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${currentStep >= step
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  : "bg-gray-200 text-gray-500"
                  }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${currentStep > step ? "bg-blue-600" : "bg-gray-200"
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 max-w-md mx-auto">
            <span>School Info</span>
            <span>Contact Details</span>
            <span>Additional Info</span>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === 1 && "School Information"}
              {currentStep === 2 && "Contact Details"}
              {currentStep === 3 && "Additional Information"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your school"}
              {currentStep === 2 && "How can we reach you?"}
              {currentStep === 3 && "Final details to complete registration"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: School Information */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span>School Name *</span>
                    </label>
                    <Input
                      placeholder="Enter school name"
                      value={formData.schoolName}
                      onChange={handleInputChange("schoolName")}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">School Type *</label>
                    <Select
                      value={formData.schoolType}
                      onValueChange={handleSelectChange("schoolType")}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select school type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public/Government</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Board Type *</label>
                    <Select
                      value={formData.boardType}
                      onValueChange={handleSelectChange("boardType")}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select board type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cbse">CBSE</SelectItem>
                        <SelectItem value="icse">ICSE</SelectItem>
                        <SelectItem value="state">State Board</SelectItem>
                        <SelectItem value="ib">IB</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Establishment Year *</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 2000"
                      value={formData.establishmentYear}
                      onChange={handleInputChange("establishmentYear")}
                      required
                      min="1800"
                      max={new Date().getFullYear()}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Students (Approx.)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 500"
                      value={formData.totalStudents}
                      onChange={handleInputChange("totalStudents")}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Teachers (Approx.)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      value={formData.totalTeachers}
                      onChange={handleInputChange("totalTeachers")}
                      className="h-12"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Contact Details */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>School Address *</span>
                    </label>
                    <Textarea
                      placeholder="Enter complete school address"
                      value={formData.address}
                      onChange={handleInputChange("address")}
                      required
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">City *</label>
                    <Input
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={handleInputChange("city")}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">State *</label>
                    <Input
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={handleInputChange("state")}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country *</label>
                    <Input
                      placeholder="Enter country"
                      value={formData.country}
                      onChange={handleInputChange("country")}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">PIN Code *</label>
                    <Input
                      placeholder="Enter PIN code"
                      value={formData.pinCode}
                      onChange={handleInputChange("pinCode")}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>School Email *</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="school@example.com"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>Contact Number *</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="+91 XXXXXXXXXX"
                      value={formData.contactNumber}
                      onChange={handleInputChange("contactNumber")}
                      required
                      className="h-12"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Principal Details */}
              {currentStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Principal Name *</span>
                    </label>
                    <Input
                      placeholder="Enter principal's full name"
                      value={formData.principalName}
                      onChange={handleInputChange("principalName")}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>Principal Email *</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="principal@example.com"
                      value={formData.principalEmail}
                      onChange={handleInputChange("principalEmail")}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>Principal Phone *</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="+91 XXXXXXXXXX"
                      value={formData.principalPhone}
                      onChange={handleInputChange("principalPhone")}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span>School Description *</span>
                    </label>
                    <Textarea
                      placeholder="Brief description about your school, facilities, achievements, etc."
                      value={formData.description}
                      onChange={handleInputChange("description")}
                      required
                      rows={4}
                    />
                  </div>

                  <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-900 mb-2">Important Information</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Registration fee and subscription details will be sent to your email</li>
                      <li>• Account activation requires payment confirmation</li>
                      <li>• Login credentials will be provided after approval</li>
                      <li>• OTP verification will be required for all logins</li>
                    </ul>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-12"
                  >
                    Previous
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </span>
                    ) : (
                      "Submit Registration"
                    )}
                  </Button>
                )}
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Already registered? Back to Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}