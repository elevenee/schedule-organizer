import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormEvent, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { ForgotPasswordAlert } from "./forgot-password-alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";

interface FormProps {
    className?: any,
    rawCallbackUrl: string | string[] | null,
}
export function LoginForm({
    className,
    rawCallbackUrl
}: FormProps) {
    const { data: session } = useSession();
    const router = useRouter();

    const [isSubmiting, setIsSubmiting] = useState(false)

    const callbackUrl = Array.isArray(rawCallbackUrl) ? rawCallbackUrl[0] : rawCallbackUrl || '/dashboard';

    useEffect(() => {
        if (session) {
            router.push(callbackUrl);
        }
    }, [session]);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmiting(true)
        const res = await signIn('credentials', {
            redirect: false,
            username,
            password,
            callbackUrl,
        });
        if (res?.error) {
            setError(res.error);
        } else {
            router.push(callbackUrl);
        }
        setIsSubmiting(false)
    };
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className='mb-4'>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleLogin}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="text">Username</FieldLabel>
                                <Input
                                    id="text"
                                    type="text"
                                    placeholder="Input your username"
                                    required
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input id="password" type="password" required onChange={(e) => setPassword(e.target.value)} />
                            </Field>
                            <Field>
                                <Button type="submit" className="w-full" disabled={isSubmiting}>
                                    {isSubmiting ? 'Processing..' : 'Login'}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
