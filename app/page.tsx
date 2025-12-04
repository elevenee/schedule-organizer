'use client';
import { LoginForm } from '@/features/auth/components/login';
import { use } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default function LoginPage(props: {
    searchParams: SearchParams
}) {
    const searchParams = use(props.searchParams);
    const rawCallbackUrl = searchParams.callbackUrl ?? null;
    return (
        <>
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <LoginForm rawCallbackUrl={rawCallbackUrl}/>
                </div>
            </div>
        </>
    );
}
