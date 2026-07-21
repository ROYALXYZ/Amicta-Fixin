import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {auth.user.role === 'PLATFORM_OWNER' ? (
                                <Link
                                    className="font-medium text-indigo-600 underline"
                                    href={route('platform.organizations.index')}
                                >
                                    Kelola organisasi
                                </Link>
                            ) : (
                                "You're logged in!"
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
