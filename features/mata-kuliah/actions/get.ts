

export async function GET({
    nama = "",
    jenjang = "",
    offset = 0,
    limit = 10,
}: { nama?: string, jenjang?: string, offset?: number, limit?: number }) {
    const buildSafeFilter = (filters:any = {}) => {
        const conditions = [];
        const params = [];
        let paramCount = 0;

        if (filters.nama) {
            paramCount++;
            conditions.push(`NAMA_MATAKULIAH LIKE $${paramCount}`);
            params.push(`%${filters.nama}%`);
        }

        if (filters.jenjang) {
            paramCount++;
            conditions.push(`JENJANG_STUDI = $${paramCount}`);
            params.push(filters.jenjang);
        }

        if (filters.kode) {
            paramCount++;
            conditions.push(`KODE_MATAKULIAH LIKE $${paramCount}`);
            params.push(`%${filters.kode}%`);
        }

        if (filters.semester) {
            paramCount++;
            conditions.push(`SEMESTER = $${paramCount}`);
            params.push(parseInt(filters.semester) || 0);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        return {
            whereClause,
            params
        };
    };
    try {
        const filters = {
            ...(nama ? { nama } : {}),
            ...(jenjang ? { jenjang } : {}),
        };
        const safeFilter = buildSafeFilter(filters);
        const res = await fetch('/api/matakuliah', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filter: safeFilter.whereClause, offset, limit }),
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error mengambil mata kuliah:", error);
        throw new Error("Gagal mengambil mata kuliah: " + (error as Error).message);
    }
}