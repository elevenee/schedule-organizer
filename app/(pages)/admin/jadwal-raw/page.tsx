'use server'

import List from "./_components/list";

export async function generateMetadata() {
    return {
        title: 'Jadwal Raw',
        description: 'List Jadwal Raw',
    };
}
export default async function JadwalPage() {
    return (<List />)
}
