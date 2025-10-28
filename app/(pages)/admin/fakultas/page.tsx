'use server'

import List from "./_components/list";

export async function generateMetadata() {
    return {
        title: 'Fakultas',
        description: 'List Fakultas',
    };
}
export default async function FakultasPage() {
    return (<List />)
}
