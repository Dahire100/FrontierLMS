"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function TestConnectionPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState("")
    const [details, setDetails] = useState<any>(null)

    const checkConnection = async () => {
        setStatus('loading')
        setMessage("Pinging backend...")
        try {
            const res = await fetch(`${API_URL}/api/health`)
            const data = await res.json()

            if (res.ok) {
                setStatus('success')
                setMessage("Connected to Backend Successfully!")
                setDetails(data)
            } else {
                setStatus('error')
                setMessage(`Backend Check Failed: ${res.status} ${res.statusText}`)
            }
        } catch (error: any) {
            setStatus('error')
            setMessage("Network Error: Could not reach backend.")
            setDetails({ error: error.message, url: `${API_URL}/api/health` })
        }
    }

    useEffect(() => {
        checkConnection()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6 text-center">
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">System Diagnostic</h1>

                <div className="flex justify-center">
                    {status === 'loading' && <Loader2 className="animate-spin text-indigo-600 h-16 w-16" />}
                    {status === 'success' && <CheckCircle2 className="text-emerald-500 h-16 w-16" />}
                    {status === 'error' && <XCircle className="text-rose-500 h-16 w-16" />}
                </div>

                <div className={`p-4 rounded-xl font-bold ${status === 'success' ? 'bg-emerald-50 text-emerald-800' :
                        status === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {message}
                </div>

                {details && (
                    <pre className="text-left text-xs bg-gray-900 text-gray-100 p-4 rounded-xl overflow-auto max-h-60 shadow-inner">
                        {JSON.stringify(details, null, 2)}
                    </pre>
                )}

                <Button onClick={checkConnection} variant="outline" className="w-full h-12 rounded-xl font-bold">
                    Retry Connection
                </Button>

                <p className="text-xs text-gray-400 font-medium">Target: {API_URL}</p>
            </div>
        </div>
    )
}
