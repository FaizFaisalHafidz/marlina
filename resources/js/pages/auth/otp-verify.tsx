import InputError from '@/components/input-error'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthLayout from '@/layouts/auth-layout'
import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Props {
    phone_number: string
}

export default function OtpVerify({ phone_number }: Props) {
    const [countdown, setCountdown] = useState(300) // 5 minutes
    const [canResend, setCanResend] = useState(false)

    const { data, setData, post, processing, errors } = useForm({
        otp_code: '',
        phone_number: phone_number
    })

    const { post: resendPost, processing: resendProcessing } = useForm({
        phone_number: phone_number
    })

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setCanResend(true)
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('otp.verify'))
    }

    const resendOtp = () => {
        resendPost(route('otp.resend'), {
            onSuccess: () => {
                setCountdown(300)
                setCanResend(false)
            }
        })
    }

    const formatPhoneNumber = (phone: string) => {
        // Format for display: 6289656519477 -> 089656519477
        if (phone.startsWith('62')) {
            return '0' + phone.substring(2)
        }
        return phone
    }

    return (
        <AuthLayout title="Verifikasi OTP" description={`Kode telah dikirim ke ${formatPhoneNumber(phone_number)}`}>
            <Head title="Verifikasi OTP" />

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
                <p className="text-sm text-gray-500 mt-2">
                    Verifikasi OTP - {formatPhoneNumber(phone_number)}
                </p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="otp_code" className="text-gray-700 font-medium">
                            Kode OTP (6 digit)
                        </Label>
                        <Input
                            id="otp_code"
                            type="text"
                            maxLength={6}
                            value={data.otp_code}
                            onChange={(e) => setData('otp_code', e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="text-center text-2xl tracking-widest"
                            required
                            autoFocus
                        />
                        <InputError message={errors.otp_code} />
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || data.otp_code.length !== 6}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium"
                    >
                        {processing ? 'Memverifikasi...' : 'Verifikasi & Login'}
                    </Button>
                </div>
            </form>

            {/* Timer and Resend */}
            <div className="mt-6 text-center space-y-3">
                {!canResend ? (
                    <div className="text-gray-600">
                        <p className="text-sm">Kode akan expired dalam</p>
                        <p className="text-xl font-bold text-green-600">{formatTime(countdown)}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">Tidak menerima kode?</p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resendOtp}
                            disabled={resendProcessing}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                            {resendProcessing ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Mengirim ulang...
                                </>
                            ) : (
                                'Kirim ulang OTP'
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Back Button */}
            <div className="mt-6 text-center">
                <Link
                    href={route('otp.phone.form')}
                    className="inline-flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Kembali
                </Link>
            </div>

            {/* Info */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Tips
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Periksa pesan WhatsApp dari MIS Addimiyati</li>
                    <li>• Jangan bagikan kode OTP kepada siapa pun</li>
                    <li>• Kode hanya berlaku selama 5 menit</li>
                </ul>
            </div>

            {/* Copyright */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">@2025 MIS Addimiyati</p>
            </div>
        </AuthLayout>
    )
}
