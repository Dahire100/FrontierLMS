"use client";
export const dynamic = 'force-dynamic';
import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Phone, Mail, MessageCircle, FileQuestion, Globe } from "lucide-react";

export default function HelpPage() {
    const router = useRouter();
    const params = useParams();
    const schoolId = params.schoolId as string;
    const schoolName = schoolId
        ? schoolId.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
        : "School";

    const contactMethods = [
        {
            name: 'Technical Support',
            description: 'For login issues and system errors.',
            icon: Phone,
            contact: '+91 1234 567 890',
            action: 'Call Now',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            name: 'Email Support',
            description: 'Send us detailed queries.',
            icon: Mail,
            contact: 'support@frontierlms.com',
            action: 'Send Email',
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            name: 'School Administration',
            description: 'For academic and fee related queries.',
            icon: Globe,
            contact: 'admin@' + schoolId + '.edu',
            action: 'Visit Website',
            color: 'text-green-600',
            bg: 'bg-green-50'
        }
    ];

    const faqs = [
        {
            q: "I forgot my password, what should I do?",
            a: "Click on the 'Forgot Password' link on the login page and follow the instructions to reset it via email."
        },
        {
            q: "My account is locked.",
            a: "Accounts are locked after 5 failed attempts. Please contact the school administration or wait for 30 minutes."
        },
        {
            q: "How do I update my profile?",
            a: "Once logged in, go to 'Settings' > 'Profile' to update your contact information."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto relative">
                    <button
                        onClick={() => router.back()}
                        className="absolute top-0 left-0 text-white/80 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={20} /> Back
                    </button>
                    <h1 className="text-3xl font-bold text-white text-center mt-4">Help & Support</h1>
                    <p className="text-blue-100 text-center mt-2 max-w-2xl mx-auto">
                        Need assistance with the {schoolName} portal? We are here to help.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">

                {/* Contact Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {contactMethods.map((method, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
                            <div className={`w-12 h-12 ${method.bg} rounded-full flex items-center justify-center mb-4`}>
                                <method.icon className={`h-6 w-6 ${method.color}`} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{method.name}</h3>
                            <p className="text-gray-500 text-sm mb-4">{method.description}</p>
                            <div className="pt-4 border-t border-gray-100">
                                <p className={`font-medium ${method.color}`}>{method.contact}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQs */}
                <div className="bg-gray-50 rounded-2xl p-8 mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FileQuestion className="text-blue-600" /> Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h4 className="font-bold text-gray-800 mb-2">{faq.q}</h4>
                                <p className="text-gray-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
