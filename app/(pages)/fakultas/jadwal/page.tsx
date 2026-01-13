'use server'

import List from "./_components/list";

export async function generateMetadata() {
    return {
        title: 'Jadwal',
        description: 'List Jadwal',
    };
}
export default async function JadwalPage() {
    return (<List />)
}
