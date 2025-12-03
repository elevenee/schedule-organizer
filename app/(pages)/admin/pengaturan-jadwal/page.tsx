'use server'

import List from "./_components/list";

export async function generateMetadata() {
    return {
        title: 'Pengaturan Jadwal',
        description: 'List Pengaturan Jadwal',
    };
}
export default async function PengaturanJadwalPage() {
    return (<List />)
}
