import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type Organization = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    users_count: number;
};

export default function Organizations({
    organizations,
}: {
    organizations: Organization[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        admin_name: '',
        admin_username: '',
        admin_phone_number: '',
        admin_password: '',
        admin_password_confirmation: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('platform.organizations.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Organisasi
                </h2>
            }
        >
            <Head title="Organisasi" />

            <div className="py-12">
                <div className="mx-auto grid max-w-7xl gap-6 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
                    <section className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Tenant terdaftar
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Subdomain dibuat dari slug organisasi.
                            </p>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {organizations.map((organization) => (
                                <div
                                    className="flex items-center justify-between p-6"
                                    key={organization.id}
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {organization.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {organization.slug}.{usePage().props.baseDomain as string}
                                        </p>
                                    </div>
                                    <div className="text-right text-sm text-gray-600">
                                        <p>{organization.users_count} akun</p>
                                        <p>
                                            {organization.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Tenant baru
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Buat organisasi dan Admin pertamanya sekaligus.
                        </p>

                        <form className="mt-6 space-y-4" onSubmit={submit}>
                            <div>
                                <InputLabel htmlFor="name" value="Nama organisasi" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    id="name"
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    required
                                    value={data.name}
                                />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="slug" value="Slug subdomain" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    id="slug"
                                    onChange={(event) =>
                                        setData('slug', event.target.value)
                                    }
                                    placeholder="contoh: upn"
                                    required
                                    value={data.slug}
                                />
                                <InputError className="mt-2" message={errors.slug} />
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-sm font-medium text-gray-900">
                                    Admin pertama
                                </p>
                            </div>

                            <div>
                                <InputLabel htmlFor="admin_name" value="Nama admin" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    id="admin_name"
                                    onChange={(event) =>
                                        setData('admin_name', event.target.value)
                                    }
                                    required
                                    value={data.admin_name}
                                />
                                <InputError className="mt-2" message={errors.admin_name} />
                            </div>

                            <div>
                                <InputLabel htmlFor="admin_username" value="Username admin" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    id="admin_username"
                                    onChange={(event) =>
                                        setData('admin_username', event.target.value)
                                    }
                                    required
                                    value={data.admin_username}
                                />
                                <InputError className="mt-2" message={errors.admin_username} />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="admin_phone_number"
                                    value="Nomor WhatsApp admin"
                                />
                                <TextInput
                                    className="mt-1 block w-full"
                                    id="admin_phone_number"
                                    onChange={(event) =>
                                        setData(
                                            'admin_phone_number',
                                            event.target.value,
                                        )
                                    }
                                    required
                                    type="tel"
                                    value={data.admin_phone_number}
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.admin_phone_number}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="admin_password" value="Password admin" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    id="admin_password"
                                    onChange={(event) =>
                                        setData('admin_password', event.target.value)
                                    }
                                    required
                                    type="password"
                                    value={data.admin_password}
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.admin_password}
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="admin_password_confirmation"
                                    value="Konfirmasi password"
                                />
                                <TextInput
                                    className="mt-1 block w-full"
                                    id="admin_password_confirmation"
                                    onChange={(event) =>
                                        setData(
                                            'admin_password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                    required
                                    type="password"
                                    value={data.admin_password_confirmation}
                                />
                                <InputError
                                    className="mt-2"
                                    message={errors.admin_password_confirmation}
                                />
                            </div>

                            <PrimaryButton disabled={processing}>
                                Buat organisasi
                            </PrimaryButton>
                        </form>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
