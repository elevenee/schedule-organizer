'use server'

import List from "./_components/list";

export async function generateMetadata() {
    return {
        title: 'Kurikulum',
        description: 'List Kurikulum',
    };
}
export default async function KurikulumPage() {
    return (<List />)
}
