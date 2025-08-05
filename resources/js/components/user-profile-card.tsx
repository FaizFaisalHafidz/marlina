import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface UserProfileCardProps {
    name: string;
    role: string;
    kelas?: string;
    nisn?: string;
    avatar?: string;
}

export function UserProfileCard({ name, role, kelas, nisn, avatar }: UserProfileCardProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Card className="mb-6">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={avatar} alt={name} />
                        <AvatarFallback className="text-lg">
                            {getInitials(name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-700 mb-2">
                                Selamat datang kembali Pengguna di Sistem Informasi Pembayaran!
                            </h2>
                            <p className="text-sm text-gray-600">
                                Sistem Informasi Pembayaran adalah aplikasi berbasis web yang digunakan untuk 
                                memudahkan dalam melakukan pencatatan administrasi siswa MIS Addimyati.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex gap-4">
                                <span className="text-sm text-gray-600 w-16">Nama :</span>
                                <span className="text-sm font-medium">{name}</span>
                            </div>
                            {kelas && (
                                <div className="flex gap-4">
                                    <span className="text-sm text-gray-600 w-16">Kelas :</span>
                                    <span className="text-sm font-medium">{kelas}</span>
                                </div>
                            )}
                            {nisn && (
                                <div className="flex gap-4">
                                    <span className="text-sm text-gray-600 w-16">NIS :</span>
                                    <span className="text-sm font-medium">{nisn}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
