'use server'

import List from "./_components/list";

export async function generateMetadata() {
    return {
        title: 'Mata Kuliah',
        description: 'List Mata Kuliah',
    };
}
export default async function MataKuliahPage() {
    return (<List />)
}
