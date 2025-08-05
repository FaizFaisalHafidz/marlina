import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BarChart3, Building, CheckCircle, CreditCard, Database, FileText, HelpCircle, LayoutGrid, Receipt, Shield, TrendingUp, UserCheck, UserCog, Users } from 'lucide-react';
import AppLogo from './app-logo';

// Function to get navigation items based on user role
const getNavItemsByRole = (role: string): NavItem[] => {
    const baseItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    switch (role) {
        case 'Admin':
            return [
                ...baseItems,
                {
                    title: 'Data',
                    icon: Database,
                    items: [
                        {
                            title: 'Data Role',
                            href: '/admin/roles',
                            icon: Shield,
                        },
                        {
                            title: 'Data Pengguna',
                            href: '/admin/users',
                            icon: UserCog,
                        },
                        {
                            title: 'Data Siswa',
                            href: '/admin/siswa',
                            icon: Users,
                        },
                    ],
                },
                {
                    title: 'Transaksi',
                    icon: CreditCard,
                    items: [
                        {
                            title: 'Data Pembayaran',
                            href: '/admin/pembayaran',
                            icon: Receipt,
                        },
                        {
                            title: 'Status Pembayaran Siswa',
                            href: '/admin/status-pembayaran',
                            icon: CheckCircle,
                        },
                    ],
                },
                {
                    title: 'Laporan',
                    icon: FileText,
                    items: [
                        {
                            title: 'Laporan Pemasukan',
                            href: '/admin/laporan-pemasukan',
                            icon: TrendingUp,
                        },
                        {
                            title: 'Laporan Pengeluaran',
                            href: '/admin/laporan-pengeluaran',
                            icon: BarChart3,
                        },
                    ],
                },
                {
                    title: 'Bantuan',
                    icon: HelpCircle,
                    items: [
                        {
                            title: 'Tentang Aplikasi',
                            href: '/tentang',
                            icon: HelpCircle,
                        },
                    ],
                },
            ];

        case 'Bendahara':
            return [
                ...baseItems,
                {
                    title: 'Transaksi',
                    icon: CreditCard,
                    items: [
                        {
                            title: 'Status Pembayaran Siswa',
                            href: '/bendahara/status-pembayaran',
                            icon: CheckCircle,
                        },
                        {
                            title: 'Validasi Transaksi',
                            href: '/bendahara/validasi-transaksi',
                            icon: UserCheck,
                        },
                        {
                            title: 'Data Rekening',
                            href: '/bendahara/rekening',
                            icon: Building,
                        },
                    ],
                },
                {
                    title: 'Laporan',
                    icon: FileText,
                    items: [
                        {
                            title: 'Laporan Pemasukan',
                            href: '/bendahara/laporan-pemasukan',
                            icon: TrendingUp,
                        },
                        {
                            title: 'Laporan Pengeluaran',
                            href: '/bendahara/laporan-pengeluaran',
                            icon: BarChart3,
                        },
                    ],
                },
                {
                    title: 'Bantuan',
                    icon: HelpCircle,
                    items: [
                        {
                            title: 'Tentang Aplikasi',
                            href: '/tentang',
                            icon: HelpCircle,
                        },
                    ],
                },
            ];

        case 'Kepala Madrasah':
            return [
                ...baseItems,
                {
                    title: 'Transaksi',
                    icon: CreditCard,
                    items: [
                        {
                            title: 'Status Pembayaran Siswa',
                            href: '/kepala/status-pembayaran',
                            icon: CheckCircle,
                        },
                    ],
                },
                {
                    title: 'Laporan',
                    icon: FileText,
                    items: [
                        {
                            title: 'Laporan Pemasukan',
                            href: '/kepala/laporan-pemasukan',
                            icon: TrendingUp,
                        },
                        {
                            title: 'Laporan Pengeluaran',
                            href: '/kepala/laporan-pengeluaran',
                            icon: BarChart3,
                        },
                    ],
                },
                {
                    title: 'Bantuan',
                    icon: HelpCircle,
                    items: [
                        {
                            title: 'Tentang Aplikasi',
                            href: '/tentang',
                            icon: HelpCircle,
                        },
                    ],
                },
            ];

        case 'Orang Tua':
            return [
                ...baseItems,
                {
                    title: 'Transaksi',
                    icon: CreditCard,
                    items: [
                        {
                            title: 'Tagihan',
                            href: '/orangtua/tagihan',
                            icon: Receipt,
                        },
                        {
                            title: 'Riwayat Transaksi',
                            href: '/orangtua/riwayat',
                            icon: FileText,
                        },
                    ],
                },
                {
                    title: 'Bantuan',
                    icon: HelpCircle,
                    items: [
                        {
                            title: 'Tentang Aplikasi',
                            href: '/tentang',
                            icon: HelpCircle,
                        },
                    ],
                },
            ];

        case 'Siswa':
            return [
                ...baseItems,
                {
                    title: 'Transaksi',
                    icon: CreditCard,
                    items: [
                        {
                            title: 'Tagihan Saya',
                            href: '/siswa/tagihan',
                            icon: Receipt,
                        },
                        {
                            title: 'Riwayat Pembayaran',
                            href: '/siswa/riwayat',
                            icon: FileText,
                        },
                    ],
                },
                {
                    title: 'Bantuan',
                    icon: HelpCircle,
                    items: [
                        {
                            title: 'Tentang Aplikasi',
                            href: '/tentang',
                            icon: HelpCircle,
                        },
                    ],
                },
            ];

        default:
            return [
                ...baseItems,
                {
                    title: 'Bantuan',
                    icon: HelpCircle,
                    items: [
                        {
                            title: 'Tentang Aplikasi',
                            href: '/tentang',
                            icon: HelpCircle,
                        },
                    ],
                },
            ];
    }
};

const footerNavItems: NavItem[] = [
   
];

interface AppSidebarProps {
    user?: {
        role?: {
            nama_role: string;
        };
    };
}

export function AppSidebar({ user }: AppSidebarProps) {
    const userRole = user?.role?.nama_role || 'Orang Tua';
    const mainNavItems = getNavItemsByRole(userRole);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
