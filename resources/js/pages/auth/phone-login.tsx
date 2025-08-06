import InputError from '@/components/input-error'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthLayout from '@/layouts/auth-layout'
import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft, Phone } from 'lucide-react'

export default function PhoneLogin() {
    const { data, setData, post, processing, errors } = useForm({
        phone_number: ''
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('otp.send'))
    }

    return (
        <AuthLayout title="Login dengan Nomor HP" description="Masukkan nomor telepon orang tua untuk mendapatkan kode OTP">
            <Head title="Login dengan Nomor HP" />

            {/* Logo dan Title */}
            <div className="flex flex-col items-center mb-8">
                <img 
                    src="https://neoflash.sgp1.cdn.digitaloceanspaces.com/logo-sirnamiskin.png" 
                    alt="Logo Sirnamiskin" 
                    className="w-24 h-24 mb-4"
                />
                <h2 className="text-lg font-semibold text-gray-700 text-center">
                    SISTEM INFORMASI PEMBAYARAN
                </h2>
                <p className="text-sm text-gray-500 mt-2">Login Orang Tua Siswa</p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="phone_number" className="text-gray-700 font-medium">
                            Nomor Telepon Orang Tua
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                id="phone_number"
                                type="tel"
                                value={data.phone_number}
                                onChange={(e) => setData('phone_number', e.target.value)}
                                placeholder="08xx-xxxx-xxxx"
                                className="pl-10"
                                required
                                autoFocus
                            />
                        </div>
                        <InputError message={errors.phone_number} />
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium"
                    >
                        {processing ? 'Mengirim OTP...' : 'Kirim Kode OTP'}
                    </Button>
                </div>
            </form>

            {/* Back to regular login */}
            <div className="mt-6 text-center">
                <Link
                    href={route('login')}
                    className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Kembali ke Login Email
                </Link>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Informasi
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Masukkan nomor HP yang terdaftar sebagai orang tua siswa</li>
                    <li>• Kode OTP akan dikirim melalui WhatsApp</li>
                    <li>• Kode berlaku selama 5 menit</li>
                    <li>• Hubungi sekolah jika mengalami kendala</li>
                </ul>
            </div>

            {/* Copyright */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">@2025 MIS Addimiyati</p>
            </div>
        </AuthLayout>
    )
}
