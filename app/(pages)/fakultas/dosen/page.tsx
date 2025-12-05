'use server'

import List from "./_components/list";

export async function generateMetadata() {
    return {
        title: 'Dosen',
        description: 'List Dosen',
    };
}
export default async function DosenPage() {
    return (<List />)
}
