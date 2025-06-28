"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import RegisterForm from "@/components/register-form"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      router.push("/chat")
    }
  }, [router])

  if (token) {
    return null // Will redirect to chat
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-600 mb-2">ChatApp</h1>
            <p className="text-gray-600">Connect with friends and family</p>
          </div>

          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <Button variant={isLogin ? "default" : "ghost"} className="flex-1" onClick={() => setIsLogin(true)}>
              Login
            </Button>
            <Button variant={!isLogin ? "default" : "ghost"} className="flex-1" onClick={() => setIsLogin(false)}>
              Register
            </Button>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  )
}
