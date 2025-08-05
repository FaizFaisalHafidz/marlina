import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href?: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    role_id: number;
    role?: Role;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Role {
    id: number;
    nama_role: string;
    created_at: string;
    updated_at: string;
}

export interface Siswa {
    id: number;
    user_id?: number;
    nisn: string;
    nama: string;
    kelas: string;
    alamat: string;
    tanggal_lahir: string;
    jenis_kelamin: 'L' | 'P';
    user?: User;
    created_at: string;
    updated_at: string;
}

export interface Rekening {
    id: number;
    nama_bank: string;
    nomor_rekening: string;
    nama_penerima: string;
    created_at: string;
    updated_at: string;
}

export interface Pembayaran {
    id: number;
    siswa_id: number;
    jumlah: string | number;
    tanggal_pembayaran: string;
    status: 'pending' | 'disetujui' | 'ditolak';
    metode_pembayaran_id: number;
    keterangan?: string;
    bukti_transfer?: string;
    divalidasi_oleh?: number;
    tanggal_validasi?: string;
    siswa?: Siswa;
    rekening?: Rekening;
    details?: DetailPembayaran[];
    validator?: User;
    created_at: string;
    updated_at: string;
}

export interface DetailPembayaran {
    id: number;
    pembayaran_id: number;
    jenis_pembayaran_id: number;
    jumlah: string | number;
    keterangan?: string;
    jenisPembayaran?: JenisPembayaran;
    jenis_pembayaran?: JenisPembayaran; // Laravel snake_case version
    created_at: string;
    updated_at: string;
}

export interface JenisPembayaran {
    id: number;
    nama_jenis: string;
    kode: string;
    nominal_default: number;
    is_wajib: boolean;
    deskripsi?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
