'use server'

import List from "./_components/list";

export async function generateMetadata() {
    return {
        title: 'Dosen Tidak Tetap',
        description: 'List Dosen Tidak Tetap',
    };
}
export default async function DosenPage() {
    return (<List />)
}
