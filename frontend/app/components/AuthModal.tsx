"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaGoogle, FaWeixin } from "react-icons/fa"
import { useRouter } from "next/navigation"

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isPhoneLogin, setIsPhoneLogin] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === "demo@timely.ai" && password === "timely123") {
      console.log("使用默认账户登录成功")
      onClose()
      router.push("/dashboard") // 添加这行来实现跳转
    } else {
      // 处理其他登录/注册逻辑
      console.log("表单提交")
      // 这里可以添加错误提示
    }
  }

  const handleSocialLogin = (provider: string) => {
    // Handle social login
    console.log(`Logging in with ${provider}`)
    onClose()
  }

  const handleSendVerificationCode = () => {
    // Simulate sending verification code
    console.log("Sending verification code to", phoneNumber)
    setIsCodeSent(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isLogin ? "登录" : "注册"}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">邮箱</TabsTrigger>
            <TabsTrigger value="phone">手机号</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="mt-2 text-sm text-gray-600">默认邮箱：demo@timely.ai</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="mt-2 text-sm text-gray-600">默认密码：timely123</div>
              </div>
              <Button type="submit" className="w-full">
                {isLogin ? "登录" : "注册"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="phone">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              {isPhoneLogin && (
                <div className="space-y-2">
                  <Label htmlFor="code">验证码</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      type="text"
                      placeholder="请输入验证码"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                    />
                    <Button type="button" onClick={handleSendVerificationCode} disabled={isCodeSent}>
                      {isCodeSent ? "已发送" : "发送验证码"}
                    </Button>
                  </div>
                </div>
              )}
              {!isPhoneLogin && (
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input id="password" type="password" required />
                </div>
              )}
              <Button type="submit" className="w-full">
                {isLogin ? "登录" : "注册"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <div className="mt-4">
          <Button variant="outline" className="w-full mb-2" onClick={() => handleSocialLogin("Google")}>
            <FaGoogle className="mr-2" /> 使用 Google 账号登录
          </Button>
          <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("WeChat")}>
            <FaWeixin className="mr-2" /> 使用微信账号登录
          </Button>
        </div>
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:underline" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "还没有账号？点击注册" : "已有账号？点击登录"}
          </button>
        </div>
        {!isPhoneLogin && (
          <div className="mt-2 text-center">
            <button className="text-sm text-blue-600 hover:underline" onClick={() => setIsPhoneLogin(true)}>
              使用手机验证码登录
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

