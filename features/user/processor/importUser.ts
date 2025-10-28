import { importJobs } from "@/lib/importJob";
import { prisma } from "@/lib/prisma";
import { JenisKelamin, Role, StatusUser } from "@prisma/client";

export async function processImportJob(
    jobId: string,
    sheets: { 'user': any[]; 'biodata': any[] },
    chunkSize = 500
) {
    const job = importJobs.get(jobId);
    if (!job) throw new Error("Job not found");

    const userRows = sheets.user ?? [];
    const biodataRows = sheets.biodata ?? [];

    // Create a more comprehensive biodata mapping
    const biodataMap = new Map<string, any>();
    const biodataByUserId = new Map<string, any>();

    for (const [index, row] of biodataRows.entries()) {
        try {
            const nik = String(row.nik ?? row.Nik ?? "").trim().toLowerCase();
            if (nik) {
                if (biodataMap.has(nik)) {
                    console.warn(`Duplicate NIK found: ${nik} at biodata row ${index}`);
                }
                biodataMap.set(nik, row);
            }

            // Also map by user ID for backward compatibility
            const userId = String(row.userid ?? row.userId ?? "").trim();
            if (userId) {
                biodataByUserId.set(userId, row);
            }
        } catch (error) {
            console.error(`Error processing biodata row ${index}:`, error);
        }
    }

    job.status = "processing";
    job.total = userRows.length;
    job.startedAt = Date.now();

    // Track all processed users to ensure no duplicates
    const processedEmails = new Set<string>();
    const processedNiks = new Set<string>();

    let curremail = "";

    try {
        for (let i = 0; i < userRows.length; i += chunkSize) {
            const chunk = userRows.slice(i, i + chunkSize);
            const chunkErrors: Array<{ rowIndex: number, reason: string, row: any }> = [];
            const chunkSuccess: any[] = [];

            await prisma.$transaction(async (tx) => {
                for (let j = 0; j < chunk.length; j++) {
                    const rowIndex = i + j;
                    const userRow = chunk[j];

                    try {
                        // Validate required fields
                        const email = String(userRow.email ?? "").trim().toLowerCase();
                        // if (!email) {
                        //     throw new Error("Missing email");
                        // }

                        // Check for duplicate email in this import batch
                        // if (processedEmails.has(email)) {
                        //     throw new Error(`Duplicate email in import data: ${email}`);
                        // }
                        const username = userRow.username ?? null;
                        if (!username) {
                            throw new Error(`Username kosoong`)
                        }
                        curremail=email+"-"+userRow.id+"-"+userRow.username+"-";
                        // Check if user already exists in database
                        const existingUser = await tx.user.findUnique({
                            where: { username: userRow.username  }
                        });

                        if (existingUser) {
                            throw new Error(`User with username ${username} already exists`);
                        }

                        const name = userRow.name ?? userRow.nama ?? "No Name";
                        const role = userRow.roles ?? userRow.role ?? "PENDAFTAR";
                        const password = userRow.password ?? null;
                        const status = userRow.status ?? "ACTIVE";
                        const verified_at = userRow.email_verified_at ?? userRow.verified_at ?? null;

                        // Find biodata using multiple strategies
                        let bio = null;

                        // Strategy 1: Find by user ID
                        const userId = String(userRow.id ?? "").trim();
                        if (userId && biodataByUserId.has(userId)) {
                            bio = biodataByUserId.get(userId);
                        }

                        // Strategy 2: Find by email in biodata
                        if (!bio) {
                            const bioByEmail = biodataRows.find(b =>
                                String(b.email ?? "").trim().toLowerCase() === email
                            );
                            if (bioByEmail) bio = bioByEmail;
                        }

                        // Strategy 3: Find by name matching (fallback)
                        if (!bio) {
                            const bioByName = biodataRows.find(b =>
                                String(b.nama ?? "").trim().toLowerCase() === String(name).trim().toLowerCase()
                            );
                            if (bioByName) bio = bioByName;
                        }

                        // Validate role
                        const validRoles = Object.values(Role);
                        if (!validRoles.includes(role as Role)) {
                            throw new Error(`Invalid role: ${role}. Valid roles: ${validRoles.join(', ')}`);
                        }

                        // Validate status
                        const validStatuses = Object.values(StatusUser);
                        if (!validStatuses.includes(status as StatusUser)) {
                            throw new Error(`Invalid status: ${status}. Valid statuses: ${validStatuses.join(', ')}`);
                        }

                        // Create user
                        const user = await tx.user.create({
                            data: {
                                email,
                                name,
                                role: role as Role,
                                username,
                                password,
                                status: status as StatusUser,
                                email_verified_at: verified_at ? new Date(verified_at) : null,
                            },
                        });

                        // Create biodata if available
                        if (bio?.nik) {
                            const nik = String(bio.nik).trim();

                            // Check for duplicate NIK in this batch
                            if (processedNiks.has(nik)) {
                                throw new Error(`Duplicate NIK in import data: ${nik}`);
                            }

                            // Check for duplicate NIK in database
                            const existingBiodata = await tx.biodata.findUnique({
                                where: { nik }
                            });

                            if (existingBiodata) {
                                throw new Error(`Biodata with NIK ${nik} already exists`);
                            }

                            // Validate required biodata fields
                            if (!bio.nama) {
                                throw new Error("Biodata missing required field: nama");
                            }

                            // Validate and convert jenis_kelamin
                            let jenisKelamin: JenisKelamin;
                            const jk = bio.jenis_kelamin;
                            if (jk === '1' || jk === 'LAKI-LAKI' || jk === 'L') {
                                jenisKelamin = JenisKelamin.LAKI_LAKI;
                            } else if (jk === '2' || jk === 'PEREMPUAN' || jk === 'P') {
                                jenisKelamin = JenisKelamin.PEREMPUAN;
                            } else {
                                throw new Error(`Invalid jenis_kelamin: ${jk}. Expected: 1/LAKI-LAKI/L or 2/PEREMPUAN/P`);
                            }

                            // Validate location IDs
                            const requiredLocationFields = ['provinsiid', 'kabupatenid', 'kecamatanid', 'kelurahanid'];
                            for (const field of requiredLocationFields) {
                                if (!bio[field] && bio[field] !== 0) {
                                    throw new Error(`Biodata missing required location field: ${field}`);
                                }
                            }

                            const biodataData: any = {
                                user: { connect: { id: user.id } },
                                nama: bio.nama,
                                email: bio.email || email,
                                nik: nik,
                                jenis_kelamin: jenisKelamin,
                                tanggal_lahir: bio.tanggal_lahir ? bio.tanggal_lahir : null,
                                tempat_lahir: bio.tempat_lahir,
                                kode_pos: bio.kode_pos,
                                no_hp: bio.no_hp,
                                no_wa: bio.no_wa,
                                alamat_lengkap: bio.alamat_lengkap,
                                provinsi: { connect: { id: Number(bio.provinsiid) } },
                                kabupaten: { connect: { id: Number(bio.kabupatenid) } },
                                kecamatan: { connect: { id: Number(bio.kecamatanid) } },
                                kelurahan: { connect: { id: Number(bio.kelurahanid) } }
                            };

                            await tx.biodata.create({
                                data: biodataData,
                            });

                            processedNiks.add(nik);
                        }

                        processedEmails.add(email);
                        chunkSuccess.push({ rowIndex, user });
                        job.success += 1;

                    } catch (err: any) {
                        const errorMessage = err?.message ?? String(err);
                        console.error(`Error processing row ${rowIndex}:`, errorMessage); 
                        console.error(`Error processing email:${curremail}`); 

                        chunkErrors.push({
                            rowIndex,
                            reason: errorMessage,
                            row: userRow,
                        });
                        job.failed += 1;
                    } finally {
                        job.processed += 1;
                    }
                }

                // Update job with chunk results
                job.errors.push(...chunkErrors);
                importJobs.set(jobId, job);

            }, {
                timeout: 5000000,
                maxWait: 5000000,
                isolationLevel: 'ReadCommitted'
            });

            // Log chunk progress
            console.log(`Processed chunk ${i / chunkSize + 1}/${Math.ceil(userRows.length / chunkSize)}: ${chunkSuccess.length} success, ${chunkErrors.length} failed`);
        }

        job.status = "done";
        job.finishedAt = Date.now();
        importJobs.set(jobId, job);

        // Final summary
        console.log(`Import completed: ${job.success} successful, ${job.failed} failed out of ${job.total} total rows`);

    } catch (err: any) {
        job.status = "failed";
        job.finishedAt = Date.now();
        const errorMessage = err?.message ?? String(err);
        console.error("Global import error:", errorMessage);

        job.errors.push({
            rowIndex: -1,
            reason: `Global import failure: ${errorMessage}`,
            row: null
        });
        importJobs.set(jobId, job);

        // Re-throw to indicate complete failure
        throw new Error(`Import job failed: ${errorMessage}`);
    }
}