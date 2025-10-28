'use server'

import List from "./_components/list";

export async function generateMetadata() {
    return {
        title: 'Program Studi',
        description: 'List Program Studi',
    };
}
export default async function ProgramStudiPage() {
    return (<List />)
}
