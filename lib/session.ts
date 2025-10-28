// lib/session.ts
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./authOptions";

export async function getSessionOrRedirect() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    return session;
}