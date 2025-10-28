'use server'

import List from "./_components/list";

export async function generateMetadata() {
    return {
        title: 'Tahun Akademik',
        description: 'List Tahun Akademik',
    };
}
export default async function TahunAkademikPage() {
    return (<List />)
}
