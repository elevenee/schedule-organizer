'use server'

import List from "./_components/list";

export async function generateMetadata() {
    return {
        title: 'Sisa SKS',
        description: 'List Sisa SKS',
    };
}
export default async function SisaSKSPage() {
    return (<List />)
}
