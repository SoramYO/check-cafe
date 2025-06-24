'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  Globe, 
  Save,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    // System Settings
    systemName: 'CheckCafe Admin',
    systemVersion: '1.0.0',
    maintenanceMode: false,
    debugMode: false,
    
    // Database Settings
    dbBackupEnabled: true,
    dbBackupInterval: '24',
    dbRetentionDays: '30',
    
    // Security Settings
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    passwordMinLength: '8',
    requireTwoFactor: false,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    notificationSound: true,
    
    // General Settings
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24'
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Cài đặt đã được lưu thành công')
    } catch (error) {
      toast.error('Không thể lưu cài đặt')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSettings = () => {
    // TODO: Implement reset to default settings
    toast.info('Đã reset về cài đặt mặc định')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý cài đặt hệ thống và cấu hình
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Tổng quan</TabsTrigger>
          <TabsTrigger value="database">Cơ sở dữ liệu</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="system">Hệ thống</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Cài đặt chung
              </CardTitle>
              <CardDescription>
                Cấu hình cơ bản cho hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemName">Tên hệ thống</Label>
                  <Input
                    id="systemName"
                    value={settings.systemName}
                    onChange={(e) => handleSettingChange('systemName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Múi giờ</Label>
                  <Input
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <Input
                    id="language"
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Định dạng ngày</Label>
                  <Input
                    id="dateFormat"
                    value={settings.dateFormat}
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Cài đặt cơ sở dữ liệu
              </CardTitle>
              <CardDescription>
                Quản lý backup và bảo trì cơ sở dữ liệu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bật backup tự động</Label>
                  <p className="text-sm text-muted-foreground">
                    Tự động backup cơ sở dữ liệu định kỳ
                  </p>
                </div>
                <Switch
                  checked={settings.dbBackupEnabled}
                  onCheckedChange={(checked) => handleSettingChange('dbBackupEnabled', checked)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backupInterval">Chu kỳ backup (giờ)</Label>
                  <Input
                    id="backupInterval"
                    type="number"
                    value={settings.dbBackupInterval}
                    onChange={(e) => handleSettingChange('dbBackupInterval', e.target.value)}
                    disabled={!settings.dbBackupEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retentionDays">Thời gian lưu trữ (ngày)</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    value={settings.dbRetentionDays}
                    onChange={(e) => handleSettingChange('dbRetentionDays', e.target.value)}
                    disabled={!settings.dbBackupEnabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Cài đặt bảo mật
              </CardTitle>
              <CardDescription>
                Cấu hình bảo mật và xác thực
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Thời gian timeout phiên (phút)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Số lần đăng nhập tối đa</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Độ dài mật khẩu tối thiểu</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Yêu cầu xác thực 2 yếu tố</Label>
                  <p className="text-sm text-muted-foreground">
                    Bắt buộc sử dụng 2FA cho tài khoản admin
                  </p>
                </div>
                <Switch
                  checked={settings.requireTwoFactor}
                  onCheckedChange={(checked) => handleSettingChange('requireTwoFactor', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Cài đặt thông báo
              </CardTitle>
              <CardDescription>
                Quản lý các loại thông báo hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo qua email</Label>
                  <p className="text-sm text-muted-foreground">
                    Gửi thông báo quan trọng qua email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Thông báo push</Label>
                  <p className="text-sm text-muted-foreground">
                    Gửi thông báo real-time
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Âm thanh thông báo</Label>
                  <p className="text-sm text-muted-foreground">
                    Phát âm thanh khi có thông báo mới
                  </p>
                </div>
                <Switch
                  checked={settings.notificationSound}
                  onCheckedChange={(checked) => handleSettingChange('notificationSound', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Cài đặt hệ thống
              </CardTitle>
              <CardDescription>
                Cấu hình nâng cao cho hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chế độ bảo trì</Label>
                  <p className="text-sm text-muted-foreground">
                    Tạm thời vô hiệu hóa hệ thống để bảo trì
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chế độ debug</Label>
                  <p className="text-sm text-muted-foreground">
                    Hiển thị thông tin debug chi tiết
                  </p>
                </div>
                <Switch
                  checked={settings.debugMode}
                  onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="systemVersion">Phiên bản hệ thống</Label>
                <Input
                  id="systemVersion"
                  value={settings.systemVersion}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-muted-foreground">
                  Phiên bản hiện tại của hệ thống
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 