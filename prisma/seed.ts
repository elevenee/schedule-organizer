// prisma/seed.ts
import { hash } from "@/lib/bcrypt";
import { Jenjang, PrismaClient, Role, StatusUser, TypeDosen } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    await prisma.user.upsert({
        where: { username: "ADMIN" },
        update: {},
        create: {
            name: "ADMIN",
            username: "ADMIN",
            password: await hash("admin9900"),
            role: Role.ADMIN,
            status: StatusUser.ACTIVE
        }
    })
    await prisma.user.upsert({
        where: { username: "ADMIN" },
        update: {},
        create: {
            name: "ADMIN",
            username: "ADMIN",
            password: await hash("admin9900"),
            role: Role.ADMIN,
            status: StatusUser.ACTIVE
        }
    })
    // await prisma.pengaturanJadwal.upsert({
    //     where: { id: 1, jenisDosen: TypeDosen.TETAP },
    //     update: {},
    //     create: {
    //         jenisDosen: TypeDosen.TETAP,
    //         minSks: 12,
    //         maxSks: 20,
    //     }
    // })
    // await prisma.pengaturanJadwal.upsert({
    //     where: { id: 2, jenisDosen: TypeDosen.TIDAK_TETAP },
    //     update: {},
    //     create: {
    //         jenisDosen: TypeDosen.TIDAK_TETAP,
    //         minSks: 12,
    //         maxSks: 20,
    //     }
    // })
    const fakultas = [
        {
            "nama": "Dakwah dan Ilmu Komunikasi",
        },
        {
            "nama": "Syariah",
        },
        {
            "nama": "Tarbiyah dan Keguruan",
        },
        {
            "nama": "Ushuluddin dan Studi Agama",
        },
        {
            "nama": "Pascasarjana",
        },
        {
            "nama": "Ekonomi dan Bisnis Islam",
        }
    ];

    // await prisma.fakultas.createMany({
    //     data: fakultas
    // })

    const prodis = [
        {
            "jenjang": "S1" as Jenjang,
            "kode": "86208 ",
            "singkatan": "S1_0101_PAI",
            "nama": "Pendidikan Agama Islam",
            "fakultasId": 4
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "88204 ",
            "singkatan": "S1_0102_PBA",
            "nama": "Pendidikan Bahasa Arab",
            "fakultasId": 4
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "84202 ",
            "singkatan": "S1_0103_MTK",
            "nama": "Tadris Matematika",
            "fakultasId": 4
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "84201 ",
            "singkatan": "S1_0104_IPA",
            "nama": "Tadris IPA Biologi",
            "fakultasId": 4
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "87220 ",
            "singkatan": "S1_0105_IPS",
            "nama": "Tadris IPS",
            "fakultasId": 4
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "86232 ",
            "singkatan": "S1_0106_PGMI",
            "nama": "Pendidikan Guru Madrasah Ibtidaiyah",
            "fakultasId": 4
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "88203 ",
            "singkatan": "S1_0107_TBI",
            "nama": "Tadris Bahasa Inggris",
            "fakultasId": 4
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "84203 ",
            "singkatan": "S1_0108_TF",
            "nama": "Tadris Fisika",
            "fakultasId": 4
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "84204 ",
            "singkatan": "S1_0109_TK",
            "nama": "Tadris Kimia",
            "fakultasId": 4
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "86207 ",
            "singkatan": "S1_0110_PIAUD",
            "nama": "Pendidikan Islam Anak Usia Dini",
            "fakultasId": 4
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "74234 ",
            "singkatan": "S1_0201_MUA",
            "nama": "Hukum Ekonomi Syariah (Muamalah)",
            "fakultasId": 3
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "74230 ",
            "singkatan": "S1_0202_AS",
            "nama": "Hukum Keluarga Islam (Ahwal Syakhshiyyah)",
            "fakultasId": 3
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "50202 ",
            "singkatan": "S1_0204_IF",
            "nama": "Ilmu Falak",
            "fakultasId": 3
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "70233 ",
            "singkatan": "S1_0301_KPI",
            "nama": "Komunikasi dan Penyiaran Islam",
            "fakultasId": 1
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "70231 ",
            "singkatan": "S1_0302_PMI",
            "nama": "Pengembangan Masyarakat Islam",
            "fakultasId": 1
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "70232 ",
            "singkatan": "S1_0303_BKI",
            "nama": "Bimbingan Konseling Islam",
            "fakultasId": 1
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "61201 ",
            "singkatan": "S1_0305_MD",
            "nama": "Manajemen Dakwah",
            "fakultasId": 1
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "60202 ",
            "singkatan": "S1_0501_ES",
            "nama": "Ekonomi Syariah",
            "fakultasId": 2
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "61206 ",
            "singkatan": "S1_0502_PS",
            "nama": "Perbankan Syariah",
            "fakultasId": 2
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "93202 ",
            "singkatan": "S1_0503_PWS",
            "nama": "Pariwisata Syariah",
            "fakultasId": 2
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "76231",
            "singkatan": "S1_0601_IQT",
            "nama": "Ilmu Al-Qur'an dan Tafsir",
            "fakultasId": 5
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "69201 ",
            "singkatan": "S1_0602_SA",
            "nama": "Sosiologi Agama",
            "fakultasId": 5
        },
        {
            "jenjang": "S1" as Jenjang,
            "kode": "74237 ",
            "singkatan": "S1_0603_PPI",
            "nama": "Pemikiran Politik Islam",
            "fakultasId": 5
        },
        {
            "jenjang": "S2" as Jenjang,
            "kode": "86108 ",
            "singkatan": "S2_0401_PAI",
            "nama": "Pendidikan Agama Islam",
            "fakultasId": 6
        },
        {
            "jenjang": "S2" as Jenjang,
            "kode": "74130 ",
            "singkatan": "S2_0402_AS",
            "nama": "Hukum Keluarga Islam (Ahwal Syakhshiyyah)",
            "fakultasId": 6
        },
        {
            "jenjang": "S2" as Jenjang,
            "kode": "86131 ",
            "singkatan": "S2_0403_MPI",
            "nama": "Manajemen Pendidikan Islam",
            "fakultasId": 6
        },
        {
            "jenjang": "S2" as Jenjang,
            "kode": "60102 ",
            "singkatan": "S2_0404_ES",
            "nama": "Ekonomi Syariah",
            "fakultasId": 6
        },
        {
            "jenjang": "S2" as Jenjang,
            "kode": "70133 ",
            "singkatan": "S2_0405_KPI",
            "nama": "Komunikasi dan Penyiaran Islam",
            "fakultasId": 6
        },
        {
            "jenjang": "S2" as Jenjang,
            "kode": "88104 ",
            "singkatan": "S2_0406_PBA",
            "nama": "Pendidikan Bahasa Arab",
            "fakultasId": 6
        },
        {
            "jenjang": "S2" as Jenjang,
            "kode": "76131",
            "singkatan": "S2_0407_IQT",
            "nama": "Ilmu al-Qur'an dan Tafsir",
            "fakultasId": 6
        },
        {
            "jenjang": "S3" as Jenjang,
            "kode": "86030 ",
            "singkatan": "S3_0701_PAI",
            "nama": "Pendidikan Agama Islam",
            "fakultasId": 6
        },
        {
            "jenjang": "S3" as Jenjang,
            "kode": "10101",
            "singkatan": "S3_0702_HKI",
            "nama": "Hukum Keluarga Islam",
            "fakultasId": 6
        },
        {
            "jenjang": "S3" as Jenjang,
            "kode": "10100",
            "singkatan": "S3_0703_SI",
            "nama": "Studi Islam",
            "fakultasId": 6
        }
    ];
    // await prisma.jurusan.createMany(({
    //     data: prodis
    // }))

    const MK_PMI = [
        {
            "jurusanId": 15,
            "kode": "UPMI0305",
            "nama": "Hadis",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 15,
            "kode": "UPMI0304",
            "nama": "Al-Quran",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 15,
            "kode": "UPMI0306",
            "nama": "Bahasa Arab",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0332",
            "nama": "Dasar-Dasar PMI",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 15,
            "kode": "NPMI0301",
            "nama": "Pancasila",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0352",
            "nama": "Sosiologi Pembangunan",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 15,
            "kode": "FPMI0311",
            "nama": "Ilmu Dakwah",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 15,
            "kode": "FPMI0316",
            "nama": "Dirosah Al-Quran",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0334",
            "nama": "Ilmu Politik",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 15,
            "kode": "UPMI0310",
            "nama": "Akhlak Tasawuf",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 15,
            "kode": "UPMI0307",
            "nama": "Bahasa Inggris",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 15,
            "kode": "UPMI0309",
            "nama": "Fikih dan Ushul Fikih",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 15,
            "kode": "NPMI0302",
            "nama": "Kewarganegaraan",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 15,
            "kode": "FPMI0318",
            "nama": "Ilmu Komunikasi",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 15,
            "kode": "UPMI0308",
            "nama": "Tauhid dan Ilmu Kalam",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 15,
            "kode": "FPMI0319",
            "nama": "Retorika Dakwah",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 15,
            "kode": "FPMI0313",
            "nama": "Psikologi",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 15,
            "kode": "FPMI0312",
            "nama": "Islam dan Budaya Lokal",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0340",
            "nama": "Kewirausahaan Sosial",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 15,
            "kode": "NPMI0303",
            "nama": "Bahasa Indonesia",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 15,
            "kode": "FPMI0314",
            "nama": "Bahsa Arab 2",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0360",
            "nama": "Tafsir PMI",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0329",
            "nama": "Antropologi Pembangunan Partisipatif",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 15,
            "kode": "FPMI0315",
            "nama": "Bahasa Inggris 2",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0345",
            "nama": "Masalah Kesehatan dan Kesejahteraan Sosial",
            "sks": 2,
            "semester": 3
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0342",
            "nama": "Manajemen Pengetahuan Lokal",
            "sks": 3,
            "semester": 3
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0334",
            "nama": "Ekologi Manusia",
            "sks": 3,
            "semester": 3
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0338",
            "nama": "Inklusi Digital dan Pengembangan Masyarakat",
            "sks": 3,
            "semester": 3
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0365",
            "nama": "Kebijakan Penanggulangan Kemiskinan",
            "sks": 3,
            "semester": 3
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0354",
            "nama": "Pengembangan Masyarakat Partisipatif",
            "sks": 3,
            "semester": 3
        },
        {
            "jurusanId": 15,
            "kode": "UPMI0311",
            "nama": "Metodologi Studi Islam",
            "sks": 2,
            "semester": 3
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0356",
            "nama": "Psikologi Sosial",
            "sks": 2,
            "semester": 3
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0331",
            "nama": "Dasar-Dasar Pekerjaan Sosial",
            "sks": 2,
            "semester": 3
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0341",
            "nama": "Manajemen Layanan Sosial",
            "sks": 3,
            "semester": 4
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0325",
            "nama": "Advokasi Pekerjaan Sosial",
            "sks": 3,
            "semester": 4
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0333",
            "nama": "Direct Intervention",
            "sks": 3,
            "semester": 4
        },
        {
            "jurusanId": 15,
            "kode": "FPMI0317",
            "nama": "Filsafat Dakwah",
            "sks": 2,
            "semester": 4
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0350",
            "nama": "Nilai dan Etika dalam Pekerjaan Sosial",
            "sks": 3,
            "semester": 4
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0344",
            "nama": "Manajemen ZIS",
            "sks": 3,
            "semester": 4
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0328",
            "nama": "Analsis Masalah Sosial",
            "sks": 3,
            "semester": 4
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0349",
            "nama": "Statistik Sosial",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0346",
            "nama": "Mediasi Konflik",
            "sks": 2,
            "semester": 5
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0355",
            "nama": "Perundang-Undangan Sosial",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0351",
            "nama": "Patologi Sosial dan Sosioterapi",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0363",
            "nama": "Metopen Kualitatif dan Kuantitatif",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0366",
            "nama": "Adaptasi dan Mitigasi Bencana",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0367",
            "nama": "Praktik Pengembangan Masyarakat",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 15,
            "kode": "FPMI0320",
            "nama": "Bimbingan Penulisan Skripsi",
            "sks": 2,
            "semester": 6
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0357",
            "nama": "Riset Berbasis Masyarakat",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0352",
            "nama": "Pekerjaan Sosial dan Kesejahteraan Sosial",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0368",
            "nama": "Manajemen Corporate Social Responsibility",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0339",
            "nama": "Inklusi Sosial dan Kebutuhan Khusus",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0324",
            "nama": "Administrasi Pekerjaan Sosial",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0347",
            "nama": "Metode dan Praktik Pekerjaan Sosial",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 15,
            "kode": "FPMI0320",
            "nama": "Skripsi",
            "sks": 6,
            "semester": 7
        },
        {
            "jurusanId": 15,
            "kode": "PPMI0357",
            "nama": "PKL",
            "sks": 4,
            "semester": 7
        },
        {
            "jurusanId": 15,
            "kode": "FPMI0321",
            "nama": "KKP",
            "sks": 4,
            "semester": 7
        }
    ];
    const MK_TI = [
        {
            "jurusanId": 35,
            "kode": "NTI0101",
            "nama": "Pancasila",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 35,
            "kode": "NTI0102",
            "nama": "Kewarganegaraan",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 35,
            "kode": "UTI0104",
            "nama": "Al-Quran",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 35,
            "kode": "FTI0112",
            "nama": "Pengantar Teknologi Informasi",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 35,
            "kode": "PTI0101",
            "nama": "Kalkulus",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 35,
            "kode": "PTI0102",
            "nama": "Teori Vektor dan Matriks",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 35,
            "kode": "PTI0103",
            "nama": "Fisika",
            "sks": 2,
            "semester": 1
        },
        {
            "jurusanId": 35,
            "kode": "PTI0111",
            "nama": "Algoritma dan Struktur Data",
            "sks": 3,
            "semester": 1
        },
        {
            "jurusanId": 35,
            "kode": "PTI0112",
            "nama": "Pemrograman Dasar",
            "sks": 3,
            "semester": 1
        },
        {
            "jurusanId": 35,
            "kode": "NTI0103",
            "nama": "Bahasa Indonesia",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 35,
            "kode": "UTI0106",
            "nama": "Bahasa Arab",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 35,
            "kode": "UTI0105",
            "nama": "Hadis",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 35,
            "kode": "FTI0119",
            "nama": "Ilmu Komunikasi",
            "sks": 2,
            "semester": 2
        },
        {
            "jurusanId": 35,
            "kode": "PTI0104",
            "nama": "Rangkaian Logika",
            "sks": 3,
            "semester": 2
        },
        {
            "jurusanId": 35,
            "kode": "PTI0105",
            "nama": "Aljabar Linear",
            "sks": 3,
            "semester": 2
        },
        {
            "jurusanId": 35,
            "kode": "PTI0106",
            "nama": "Matematika Diskrit",
            "sks": 3,
            "semester": 2
        },
        {
            "jurusanId": 35,
            "kode": "PTI0114",
            "nama": "Pemrograman Berorientasi Objek",
            "sks": 3,
            "semester": 2
        },
        {
            "jurusanId": 35,
            "kode": "UTI0107",
            "nama": "Bahasa Inggris",
            "sks": 2,
            "semester": 3
        },
        {
            "jurusanId": 35,
            "kode": "UTI0108",
            "nama": "Tauhid dan Ilmu Kalam",
            "sks": 2,
            "semester": 3
        },
        {
            "jurusanId": 35,
            "kode": "UTI0109",
            "nama": "Fikih dan Ushul Fikih",
            "sks": 2,
            "semester": 3
        },
        {
            "jurusanId": 35,
            "kode": "FTI0114",
            "nama": "Tata Kelola Teknologi Informasi",
            "sks": 2,
            "semester": 3
        },
        {
            "jurusanId": 35,
            "kode": "PTI0107",
            "nama": "Statistika",
            "sks": 3,
            "semester": 3
        },
        {
            "jurusanId": 35,
            "kode": "PTI0108",
            "nama": "Sistem Kendali",
            "sks": 3,
            "semester": 3
        },
        {
            "jurusanId": 35,
            "kode": "PTI0115",
            "nama": "Sistem Operasi",
            "sks": 3,
            "semester": 3
        },
        {
            "jurusanId": 35,
            "kode": "PTI0116",
            "nama": "Analisis Numerik",
            "sks": 3,
            "semester": 3
        },
        {
            "jurusanId": 35,
            "kode": "PTI0117",
            "nama": "Teknologi Basis Data",
            "sks": 3,
            "semester": 3
        },
        {
            "jurusanId": 35,
            "kode": "UTI0111",
            "nama": "Metodologi Studi Islam",
            "sks": 2,
            "semester": 4
        },
        {
            "jurusanId": 35,
            "kode": "UTI0110",
            "nama": "Akhlak Tasawuf",
            "sks": 2,
            "semester": 4
        },
        {
            "jurusanId": 35,
            "kode": "PTI0109",
            "nama": "Probabilitas dan Variabel Acak",
            "sks": 2,
            "semester": 4
        },
        {
            "jurusanId": 35,
            "kode": "PTI0110",
            "nama": "Analisis Multivariat",
            "sks": 3,
            "semester": 4
        },
        {
            "jurusanId": 35,
            "kode": "PTI0118",
            "nama": "Technopreneurship",
            "sks": 2,
            "semester": 4
        },
        {
            "jurusanId": 35,
            "kode": "PTI0119",
            "nama": "Etika Profesi",
            "sks": 2,
            "semester": 4
        },
        {
            "jurusanId": 35,
            "kode": "PTI0120",
            "nama": "Komunikasi Data",
            "sks": 2,
            "semester": 4
        },
        {
            "jurusanId": 35,
            "kode": "PTI0121",
            "nama": "Arsitektur Komputer",
            "sks": 2,
            "semester": 4
        },
        {
            "jurusanId": 35,
            "kode": "PTI0122",
            "nama": "Jaringan Komputer",
            "sks": 3,
            "semester": 4
        },
        {
            "jurusanId": 35,
            "kode": "PTI0123",
            "nama": "Pemrograman Web",
            "sks": 3,
            "semester": 4
        },
        {
            "jurusanId": 35,
            "kode": "PTI0124",
            "nama": "Artificial Intelligence",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 35,
            "kode": "PTI0125",
            "nama": "Logika Fuzzy",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 35,
            "kode": "PTI0126",
            "nama": "Jaringan Komputer Terapan",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 35,
            "kode": "PTI0127",
            "nama": "Sistem Informasi",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 35,
            "kode": "PTI0128",
            "nama": "Sistem Berbasis Microprocessor",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 35,
            "kode": "PTI0129",
            "nama": "Design UI/UX",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 35,
            "kode": "PTI0130",
            "nama": "Pemodelan dan Simulasi",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 35,
            "kode": "PTI0131",
            "nama": "Robotika",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 35,
            "kode": "PTI0132",
            "nama": "Pengolahan Citra Digital",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 35,
            "kode": "FTI0122",
            "nama": "Kuliah Kerja Partisipatif",
            "sks": 4,
            "semester": 7
        },
        {
            "jurusanId": 35,
            "kode": "PTI0133",
            "nama": "Metode Riset Teknologi Informasi",
            "sks": 3,
            "semester": 7
        },
        {
            "jurusanId": 35,
            "kode": "PTI0134",
            "nama": "Proyek Perancangan Teknologi Informasi",
            "sks": 3,
            "semester": 7
        },
        {
            "jurusanId": 35,
            "kode": "FTI0123",
            "nama": "Pratik Kerja Lapangan",
            "sks": 4,
            "semester": 7
        },
        {
            "jurusanId": 35,
            "kode": "FTI0124",
            "nama": "Skripsi",
            "sks": 6,
            "semester": 7
        },
        {
            "jurusanId": 35,
            "kode": "PTI0135",
            "nama": "Mobile Programming",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 35,
            "kode": "PTI0136",
            "nama": "IT Project Manajement",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 35,
            "kode": "PTI0137",
            "nama": "Software Testing",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 35,
            "kode": "PTI0138",
            "nama": "Pengembangan Aplikasi Game",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 35,
            "kode": "PTI0139",
            "nama": "Sistem Pendukung Keputusan",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 35,
            "kode": "PTI0140",
            "nama": "Natural Language Processing",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 35,
            "kode": "PTI0141",
            "nama": "Machine Learning",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 35,
            "kode": "PTI0142",
            "nama": "Big Data Analytic",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 35,
            "kode": "PTI0143",
            "nama": "Cyber Security",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 35,
            "kode": "PTI0144",
            "nama": "Kemanan dan Integritas Data",
            "sks": 3,
            "semester": 5
        },
        {
            "jurusanId": 35,
            "kode": "PTI0145",
            "nama": "Internet of Things",
            "sks": 3,
            "semester": 6
        },
        {
            "jurusanId": 35,
            "kode": "PTI0146",
            "nama": "Cloud Computing",
            "sks": 3,
            "semester": 6
        }
    ];
    const MK_KPI = [
        {
            "kode": "NKPI0301",
            "nama": "Pancasila",
            "sks": 2,
            "semester": 1
        },
        {
            "kode": "NKPI0303",
            "nama": "Bahasa Indonesia",
            "sks": 2,
            "semester": 1
        },
        {
            "kode": "UKPI0302",
            "nama": "Kewarganegaraan",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "UKPI0304",
            "nama": "AL-Quran",
            "sks": 2,
            "semester": 1
        },
        {
            "kode": "UKPI0305",
            "nama": "Hadis",
            "sks": 2,
            "semester": 1
        },
        {
            "kode": "UKPI0306",
            "nama": "Bahasa Arab",
            "sks": 2,
            "semester": 1
        },
        {
            "kode": "UKPI0307",
            "nama": "Bahasa Inggris",
            "sks": 2,
            "semester": 1
        },
        {
            "kode": "UKPI0308",
            "nama": "Tauhid dan Ilmu Kalam",
            "sks": 2,
            "semester": 1
        },
        {
            "kode": "UKPI0309",
            "nama": "Fikih dan Ushul Fikih",
            "sks": 2,
            "semester": 1
        },
        {
            "kode": "UKPI0310",
            "nama": "Akhlak Tasawuf",
            "sks": 2,
            "semester": 1
        },
        {
            "kode": "UKPI0311",
            "nama": "Metodologi Studi Islam",
            "sks": 2,
            "semester": 1
        },
        {
            "kode": "FKPI0311",
            "nama": "Ilmu Dakwah",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "FKPI0312",
            "nama": "Islam dan Budaya Lokal",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "FKPI0313",
            "nama": "Psikologi",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "FKPI0314",
            "nama": "Bahasa Arab 2",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "FKPI0315",
            "nama": "Bahasa Inggris 2",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "FKPI0316",
            "nama": "Dirosah al-Qur'an",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "FKPI0317",
            "nama": "Filsafat Dakwah",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "FKPI0318",
            "nama": "Ilmu Komunikasi",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "FKPI0319",
            "nama": "Retorika Dakwah",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "FKPI0320",
            "nama": "Teori-Teori Komunikasi",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "FKPI0321",
            "nama": "Kuliah Kerja Partisipatif (KKP)",
            "sks": 4,
            "semester": 7
        },
        {
            "kode": "FKPI0322",
            "nama": "Praktik Kerja Lapangan (PKL)",
            "sks": 4,
            "semester": 7
        },
        {
            "kode": "FKPI0323",
            "nama": "Skripsi",
            "sks": 6,
            "semester": 7
        },
        {
            "kode": "PKPI0324",
            "nama": "Teknologi Informasi dan Komunikasi",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "PKPI0325",
            "nama": "Ilmu Jurnalistik",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "PKPI0326",
            "nama": "Ilmu Broadcasting",
            "sks": 2,
            "semester": 2
        },
        {
            "kode": "PKPI0327",
            "nama": "Komunikasi Massa",
            "sks": 2,
            "semester": 3
        },
        {
            "kode": "PKPI0328",
            "nama": "Komunikasi Islam",
            "sks": 3,
            "semester": 3
        },
        {
            "kode": "PKPI0329",
            "nama": "Komunikasi Antarbudaya",
            "sks": 2,
            "semester": 3
        },
        {
            "kode": "PKPI0330",
            "nama": "Komunikasi Organisasi",
            "sks": 2,
            "semester": 3
        },
        {
            "kode": "PKPI0331",
            "nama": "Komunikasi Politik",
            "sks": 2,
            "semester": 3
        },
        {
            "kode": "PKPI0332",
            "nama": "Filsafat dan Etika Komunikasi Islam",
            "sks": 2,
            "semester": 3
        },
        {
            "kode": "PKPI0333",
            "nama": "Sosiologi Komunikasi",
            "sks": 2,
            "semester": 3
        }
    ];
    // await prisma.mataKuliah.createMany({
    //     data: MK_TI
    // })
    const dosen = [
        { nama: "Prof. Dr. Suprapto, M.Ag." },
        { nama: "Prof. Dr. H. Mutawali, M.Ag." },
        { nama: "Prof. Dr. H. Miftahul Huda, M.Ag." },
        { nama: "Prof. Dr. H. Fahrurrozi, M.A." },
        { nama: "Prof. Dr. H. Masnun, M.Ag." },
        { nama: "Prof. Hj. Atun Wardatun, M.Ag., M.A., Ph.D." },
        { nama: "Prof. Dr. H. Jamaluddin, M.A." },
        { nama: "Prof. Dr. H. Ahmad Amir Aziz, M.Ag." },
        { nama: "Prof. Dr. H. Musawar, M.Ag." },
        { nama: "Prof. Dr. H. Adi Fadli, M.Ag." },
        { nama: "Prof. Dr. Suhirman, S.Pd., M.Si." },
        { nama: "Prof. Dr. Ismail, M.Pd." },
        { nama: "Prof. Dr. H. Muhammad, M.Pd., M.S." },
        { nama: "Prof. Moh. Abdun Nasir, M.Ag., Ph.D." },
        { nama: "Prof. Dr. H. Abdul Fattah, M.Fil.I." },
        { nama: "Prof. Dr. Lalu Supriadi Bin Mujib, M.A." },
        { nama: "Prof. Dr. H. Abdul Wahid, M.Ag., M.Pd." },
        { nama: "Prof. Dr. H. MS. Udin, M.Ag." },
        { nama: "Prof. Dr. H. Kadri, S.Ag., M.Si." },
        { nama: "Prof. Dr. Winengan, M.Si." },
        { nama: "Prof. Dr. H. Subhan Abdullah Acim, M.A." },
        { nama: "Prof. Dr. M. Sobry, S.Ag., M.Pd." },
        { nama: "Prof. Dr. H. Maimun, S.Ag., M.Pd." },
        { nama: "Prof. Dr. Syarifudin, S.S., M.Pd." },
        { nama: "Prof. Dr. Hj. Nurul Lailatul Khusniah, M.Pd." },
        { nama: "Prof. Dr. Ahmad Sulhan, S.Ag., M.Pd.I." },
        { nama: "Prof. Dr. H. Zaenudin Mansyur, M.Ag." },
        { nama: "Prof. Dr. H. Zainal Arifin, Lc., M.Ag." },
        { nama: "Prof. Dr. Riduan Mas'ud, M.Ag." },
        { nama: "Prof. Dr. Bahtiar, M.Pd.Si" },
        { nama: "Prof. Dr. Abdul Malik, M.Ag., M.Pd." },
        { nama: "Prof. Dr. Khairul Hamim, M.A." },
        { nama: "Prof. Dr. Saparudin, M.Ag." },
        { nama: "Prof. Dr. H. S. Ali Jadid Al Idrus, M.Pd." },
        { nama: "Prof. Dr. Moh. Iwan Fitriani, S.Pd., M.Pd." },
        { nama: "Prof. Dr. Baharudin, M.Ag." },
        { nama: "Prof. Dr. H. Nazar Naamy, M.Si." },
        { nama: "Prof. Dr. Muh. Salahuddin, M.Ag." },
        { nama: "Prof. Dr. H. Muslihun, M.Ag." },
        { nama: "Prof. Dr. H. Usman, M.Ag." },
        { nama: "Dr. Muh. Azkar, S.Pd., M.Pd.I." },
        { nama: "Prof. Dr. Jumarim, M.H.I." },
        { nama: "Prof. Dr. Akhmad Asyari, S.Ag., M.Pd." },
        { nama: "Dr. Syukri, M.Pd." },
        { nama: "Dr. Wildan, M.Pd." },
        { nama: "Dr. Fathurrahman Muhtar, M.Ag." },
        { nama: "Dr. H. Lalu Muktar, M.Pd." },
        { nama: "Dr. Nurhilaliati, M.Ag." },
        { nama: "Dr. Muhsinin, M.A." },
        { nama: "Dr. H. Subki, M.Pd.I." },
        { nama: "Dr. Emawati, M.Ag." },
        { nama: "Dr. H. Salimul Jihad, Lc., M.Ag." },
        { nama: "Dr. Lalu Muhammad Nurul Wathoni, M.Pd.I." },
        { nama: "Dr. Yusuf, M.Pd." },
        { nama: "Prof. Dr. Abdul Quddus, M.A." },
        { nama: "Dr. H. Abdul Azis, M.Pd.I." },
        { nama: "Dr. H. Moh. Fakhri, M.Pd." },
        { nama: "Dr. Muhammad Thohri, S.S., M.Pd." },
        { nama: "Dr. Abdulloh Fuadi, M.A." },
        { nama: "Dr. Fathul Maujud, M.A." },
        { nama: "Dr. Ika Rama Suhandra, M.Pd." },
        { nama: "Prof. Dr. Supardi, M.Pd." },
        { nama: "Drs. H. Baehaqi, M.Pd." },
        { nama: "Prof. Dr. Edi Muhamad Jayadi, M.P" },
        { nama: "Dr. H. Ridwan, M.Pd." },
        { nama: "Dr. Ribahan, S.S., M.Pd." },
        { nama: "Dr. Mohammad Liwa Irrubai, S.Ag., M.Pd." },
        { nama: "Dr. H. Yudin Citriadin, S.P., M.Pd." },
        { nama: "Dr. Erma Suriani, S.Ag,. M.S.I." },
        { nama: "Dr. H. Dedy Wahyudin, M.A." },
        { nama: "Prof. Dr. Hj. Lubna, M.Pd." },
        { nama: "Dr. Hj. Nurul Yakin, M.Pd." },
        { nama: "Dr. Mukhlis, M.Ag." },
        { nama: "Dr. Kristayulita, M.Si." },
        { nama: "Dr. Muhammad Mutawali, M.A." },
        { nama: "Dr. Yek Amin Aziz, S.Pd., M.Pd." },
        { nama: "Drs. H. Ramli, M.Pd." },
        { nama: "Dr. Moh. Asyiq Amrulloh, M.Ag." },
        { nama: "Dr. Hj. Teti Indrawati P., S.H., M.Hum." },
        { nama: "Dr. H. Ahmad Muhasim, S.Ag., M.H.I." },
        { nama: "Dr. Saprudin, S.Ag., M.Si." },
        { nama: "Dr. Arino Bemi Sado, S.Ag., M.H." },
        { nama: "Prof. Dr. Muhammad Harfin Zuhdi, M.A." },
        { nama: "Dr. H. Lalu Ahmad Zaenuri, Lc., M.A." },
        { nama: "Dr. Faizah, M.A." },
        { nama: "Prof. Dr. Muhamad Saleh, M.A." },
        { nama: "Prof. Dr. Ahyar, M.Pd." },
        { nama: "Dr. Siti Nurul Yaqinah, M.Ag." },
        { nama: "Dr. Musta'in, M.Ag." },
        { nama: "Prof. Dr. Syamsul Arifin, M.Ag." },
        { nama: "Dr. Zainudin, M.Ag." },
        { nama: "Dr. Satriawan, S.S., M.A." },
        { nama: "Prof. Dr. Muhammad Mugni Assapari, M.Pd.B.I" },
        { nama: "Prof. Dr. Dwi Wahyudiati, M.Pd." },
        { nama: "Dr. Deddy Ramdhani, M.Pd.I" },
        { nama: "Dr. Syukri, M.Ag." },
        { nama: "Prof. Dr. Gazali, M.H." },
        { nama: "Dr. Baiq Ratna Mulhimmah, M.H." },
        { nama: "Dr. H. Sainun, M.Ag." },
        { nama: "Prof. Dr. H. Lukman Hakim, M.Pd." },
        { nama: "Dr. H. Muhammad Taufiq, Lc., M.H.I." },
        { nama: "Dr. H. Badrun, M.Pd." },
        { nama: "Prof. Dr. Nikmatullah, S.Ag., M.A." },
        { nama: "Dr. Rendra Khaldun, M.Ag." },
        { nama: "Dr. H. Muhammad Sa'i, M.A." },
        { nama: "Dr. Mira Mareta, M.A." },
        { nama: "Prof. Dr. Baiq Elbadriati, M.E.I." },
        { nama: "Dr. Muhammad Yusup, M.Si." },
        { nama: "Dr. Hj. Zulpawati, M.A." },
        { nama: "Dr. Sanurdi, M.Si." },
        { nama: "Dr. M. Firdaus, M.Si." },
        { nama: "Dr. Muammar, M.Pd." },
        { nama: "Ramdhani Sucilestari, S.Si., M.Pd" },
        { nama: "Dr. Hilmiati, M.Pd." },
        { nama: "Amalia Taufik, S.Hum., M.A." },
        { nama: "Ziyad, M.Ag." },
        { nama: "Mulabbiyah, S.Pd.I., M.Pd." },
        { nama: "Dr. Alwan Mahsul, M.Pd." },
        { nama: "Dr. Murzal, M.Ag." },
        { nama: "Muhammad Anwar Sani, M.Pd.I." },
        { nama: "Hamzan, M.Pd." },
        { nama: "Syudirman, M.Pd." },
        { nama: "Djuita Hidayati, M.Pd." },
        { nama: "Muhamad Ahyar Rasidi, M.Pd." },
        { nama: "Lalu Asriadi, M.Pd.I." },
        { nama: "Siti Ruqoiyyah, M.Pd." },
        { nama: "Silka Yuanti Draditaswari, M.Pd." },
        { nama: "Ati Sukmawati, M.Pd." },
        { nama: "Dr. Helmi, M.Pd." },
        { nama: "Akmaluddin, M.Pd." },
        { nama: "Rosa Desmawanti, M.Pd." },
        { nama: "Dr. Azhar, M.Pd.B.I." },
        { nama: "Dr. Akhmad Syahri, M.Pd.I." },
        { nama: "Dr. H. Muhammad Taisir, M.Ag." },
        { nama: "Dr. Erlan Muliadi, M.Pd.I." },
        { nama: "Dr. Erwin Padli, M.Hum." },
        { nama: "Dr. H. Muhammad Fahrurrozi, M.Pd." },
        { nama: "Dr. Muslehuddin, M.Pd." },
        { nama: "Dr. Zahraini, M.Pd.I." },
        { nama: "Dr. Syakban Abdul Karim, M.Ag." },
        { nama: "Siti Hajaroh, S.Pd., M.Pd." },
        { nama: "Fathurrahman, M.Ag." },
        { nama: "Dr. Nurmaidah, M.Pd.I." },
        { nama: "Sukardi, M.Pd.I." },
        { nama: "Muhammad, M.Pd.I" },
        { nama: "Muhammad Ghazali, M.Si." },
        { nama: "Hairul Hidayah, M.Pd.I." },
        { nama: "Dr. Hadi Kusuma Ningrat, M.Pd." },
        { nama: "Nani Husnaini, M.Pd." },
        { nama: "Erna Anggraini, M.Pd." },
        { nama: "Dr. Khairil Anwar, S.Pd.I., M.Si." },
        { nama: "Baiq Roni Indira Astriya, M.Pd." },
        { nama: "Wahyu Hananingsih, M.Pd." },
        { nama: "Nurul Fikriati Ayu Hapsari, MA" },
        { nama: "Sarifudin, M.Pd." },
        { nama: "Dr. Era Mutiara Pratiwi, M.Si." },
        { nama: "Yuga Anggana Sosani, M.Sn." },
        { nama: "Farida Rohayani, M.Pd." },
        { nama: "Rifki Ayu Rosmita, M.Pd." },
        { nama: "Khaerani Saputri Imran, M.Pd." },
        { nama: "Wahyuni Murniati, M.Pd." },
        { nama: "Nur Kholidah Nasution, M.Pd." },
        { nama: "Dr. Nurrahmah, M.Pd." },
        { nama: "Nur Hayati Mufida, M.Pd." },
        { nama: "Dr. Ahmad Zohdi, M.Ag." },
        { nama: "Dr. Al Kusaeri, M.Pd." },
        { nama: "Dr. Alfira Mulya Astuti, M.Si" },
        { nama: "Dr. Nur Hardiani, M.Pd." },
        { nama: "Dr. Parhaini Andriani, M.Pd.Si." },
        { nama: "Dr. M. Syawahid, S.Pd., M.Pd." },
        { nama: "Dr. Habibi Ratu Perwira Negara, M.Pd" },
        { nama: "H. M. Habib Husnial Pardi, M.A." },
        { nama: "Lalu Sucipto, M.Pd." },
        { nama: "Afifurrahman, M.Pd., Ph.D" },
        { nama: "Sofyan Mahfudy, S.Pd., M.Pd." },
        { nama: "Dr. Erpin Evendi, S.Pd., M.Pd." },
        { nama: "Ahmad Nasrullah, M.Pd." },
        { nama: "Baiq Rofina Arvy, M.Pd." },
        { nama: "Dr. Yandika Nugraha, M.Pd." },
        { nama: "Dr. Mulhamah, M.Pd." },
        { nama: "Dr. Fadrik Adi Fahrudin, M.Pd" },
        { nama: "Susilahuddin Putrawangsa, M.Sc., Ph.D" },
        { nama: "H. Samsul Irpan, M.Pd." },
        { nama: "Drs. H. Moh. Nasikin, M.Ag." },
        { nama: "Dra. Hj. Rabiatul Adawiyah, M.A." },
        { nama: "Drs. H. Lalu Ahmad Busyairy, M.A." },
        { nama: "H. Sudi Yahya Husein, Lc., M.Pd." },
        { nama: "Suparmanto, M.Pd.I" },
        { nama: "Dr. Sulthan, MA." },
        { nama: "Abdul Hakim, Ph.D." },
        { nama: "Baiq Widia Nita Kasih, M.Pd." },
        { nama: "Muhamad Arfan, M.Hum." },
        { nama: "Lalu Ahmad Didik Meiliyadi, M.S." },
        { nama: "Kurniawan Arizona, M.Pd." },
        { nama: "Nur Khasanah, M.Sc." },
        { nama: "Dr. Nurul Imtihan, M.Pd." },
        { nama: "Irwan, M.Si., Ph.D" },
        { nama: "Muhammad Zaini, M.Pd." },
        { nama: "Ilham, M.Sc." },
        { nama: "Dr. Nining Purwati, M.Pd." },
        { nama: "Dr. M. Harja Efendi, M.Pd." },
        { nama: "Dr. Lutvia Krismayanti, M. Si" },
        { nama: "Ervina Titi Jayanti, M.Sc." },
        { nama: "Risa Umami, S.Si., M.Sc." },
        { nama: "Sri Sofiati Umami, S.Si., M.Biomed." },
        { nama: "Mukminah, S.Pd.I., M.P.H." },
        { nama: "Nurdiana, S.P., M.P." },
        { nama: "Ali Harris, M.Si." },
        { nama: "Dr. Mohan Taufiq Mashuri, M.Pd." },
        { nama: "Dr. H. Hanafi, M.Pd.I" },
        { nama: "Nurlita Lestariani, M.Pd." },
        { nama: "Najah Sholehah, M.Pd." },
        { nama: "Muhammad Nurman, S.H., M.Pd." },
        { nama: "Firman Ali Rahman, M.Si." },
        { nama: "Dr. Munawir Sazali, M.Si." },
        { nama: "Yahdi, M.Si." },
        { nama: "Lukman Taufik, M.Ag." },
        { nama: "Syarifatul Mubarak, M.Pd." },
        { nama: "Baiq Ayu Aprilia Mustariani, M.Si." },
        { nama: "Yuli Kusuma Dewi, M.Si." },
        { nama: "Dr. Mujakir, M.Pd.Si" },
        { nama: "Multazam, M.Si." },
        { nama: "Sulistiyana, M.Si" },
        { nama: "Novia Suryani, M.Sc." },
        { nama: "Devi Qurniati, M.Pd." },
        { nama: "Raehanah, S.Pd., M.Pd." },
        { nama: "H. Ibnu Hizam, S.Ag., M.Pd." },
        { nama: "Dr. H. Pauzan, M.Hum., M.Pd." },
        { nama: "Hery Rahmat, M.Hum." },
        { nama: "Soni Ariawan, S.Pd., M.Ed." },
        { nama: "Najamuddin, S.Pd., M.Hum." },
        { nama: "Dr. Afif Ikhwanul Muslimin, SS.,M.Pd." },
        { nama: "Dr. Titik Agustina, M.Pd." },
        { nama: "Muhamad Zulpiani Hamdi, M.Pd" },
        { nama: "Tuning Ridha Addhiny, M.Pd." },
        { nama: "Miftahul Jannah, S.Pd., M.Pd." },
        { nama: "Dr. Habib Alwi, M. Si" },
        { nama: "Dr. H. Lalu Agus Satriawan, Lc., M.Ag." },
        { nama: "Ahmad Khalakul Khairi, M.Ag." },
        { nama: "Dr. Mawardi Saleh, M.Pd." },
        { nama: "Rahmat Akbar Kurniawan, M.Sc." },
        { nama: "Siti Husna Ainu Syukri, S.T., M.T." },
        { nama: "Sakdiah, M.Si." },
        { nama: "Muh. Zainur Rahman, M.Pd." },
        { nama: "Saiful Bahri, M.Pd." },
        { nama: "Fatana Suastrini, M.M." },
        { nama: "Jamiluddin, M.Pd." },
        { nama: "Emilia Fatriani, M.Pd." },
        { nama: "Rima Buana Prahastiwi, M.Pd." },
        { nama: "Ade Alimah, M.A." },
        { nama: "Hesikumalasari, M.Si." },
        { nama: "Siska Triana Niagara, M.Psi." },
        { nama: "Muh. Wahyudi, M.Pd." },
        { nama: "Nevi Ernita, M.Pd." },
        { nama: "Sunandar Azma'ul Hadi, M.Pd." },
        { nama: "Muhammad Kafrawi, M.Pd." },
        { nama: "Syamsuddin, M.Pd." },
        { nama: "Sri Hastuti Novila Anggraini, S., M.TESOL" },
        { nama: "Rohana, M.IP" },
        { nama: "Drs. H. Muktamar, M.H." },
        { nama: "Dr. Tuti Harwati, M.Ag." },
        { nama: "Hj. Ani Wafiroh, M.Ag." },
        { nama: "Dr. Nuruddin, M.H." },
        { nama: "Ahmad Nurjihadi, M.Ag." },
        { nama: "Nisfawati Laili Jalilah, M.H." },
        { nama: "Nunung Susfita, S.H.I., M.S.I." },
        { nama: "Darmini, M.H.I" },
        { nama: "Dr. Abdullah, M.H." },
        { nama: "Muhammad Nor, M.HI." },
        { nama: "Hery Zarkasih, S.H., M.H." },
        { nama: "Fariz Al-Hasni, S.HI., M.H." },
        { nama: "Dr. H. Muhammad Fikri, M.A." },
        { nama: "Imron Hadi, S.H.I., M.H.I." },
        { nama: "Ma'shum Ahmad, M.H." },
        { nama: "Arief Taufikurrahman, M.Eng." },
        { nama: "Siti Rabi'atul Adawiyah, M.Si." },
        { nama: "Nurnadiyah Syuhada, M.T." },
        { nama: "Ahmad Saifulhaq Almuhtadi, M.S.I." },
        { nama: "Muhamad Saleh Sofyan, M.H." },
        { nama: "Heru Sunardi, S.H., M.H." },
        { nama: "Dr. Jaya Miharja, M.S.I." },
        { nama: "Apipuddin, S.H.I., LL.M" },
        { nama: "Parida Angriani, M.H." },
        { nama: "Wawan Andriawan, M.Kn." },
        { nama: "Syahrul Hanafi, M.E.K." },
        { nama: "Muhammad Dimas Hidayatullah Wildan, M.H.I." },
        { nama: "Ahmad Fiqqih Alfathoni, S.Pd., M.A." },
        { nama: "Husnul Hidayati, S.Ag., M.Ag." },
        { nama: "H. M. Arif Al Kausari, M.H." },
        { nama: "Deva Nabila, M.H." },
        { nama: "Dr. Ulya Sofiana, MH" },
        { nama: "Ahmad Ashril Rizal, M.Cs." },
        { nama: "Dr. Erma Yanuarni, M.Si." },
        { nama: "Dr. Dahlia Bonang, M.S.I." },
        { nama: "Dr. Safroni Isrososiawan, M.M" },
        { nama: "Dr. Khairy Juanda, M.Si." },
        { nama: "Dr. H. Irpan, S.Ag., M.A." },
        { nama: "Guruh Sugiharto, S.E., M.M." },
        { nama: "H. Masruri, Lc., M.A." },
        { nama: "Dr. Hj. Saimun, M.Si." },
        { nama: "Muhammad Awwad, M.Pd.I." },
        { nama: "Syamsul Hadi, M.Pd." },
        { nama: "Sarapudin, M.A." },
        { nama: "Iqbal Bafadal, M.Si." },
        { nama: "Dyah Luthfia Kirana, M.Pd." },
        { nama: "Herlina Fitriana, M.Si." },
        { nama: "Maliki, M.Pd.I." },
        { nama: "Fathurrahman, M.Sos." },
        { nama: "Dwi Widarna Lita Putri, S.Psi., M.Psi." },
        { nama: "Lalu Abdurrachman Wahid, M.A." },
        { nama: "Baiq Arwindy Prayona, M.A." },
        { nama: "Dr. Najamudin, S.Th.I, M.S.I." },
        { nama: "Dr. H. Muhammad Syarifudin, M.Pd." },
        { nama: "Athik Hidayatul Ummah, M.Si." },
        { nama: "Muhamad Irhamdi, M.Sos." },
        { nama: "Sahril Halim, M.I.Kom." },
        { nama: "Gemuh Surya Wahyudi, M.A." },
        { nama: "Muhtar Tayib, M.Si." },
        { nama: "Mohammad Alawi, M.Sos." },
        { nama: "Dr. H. Imran, M.Si." },
        { nama: "Abdul Rahim, M.A." },
        { nama: "Dr. Muchammadun, M.M." },
        { nama: "Muhammad Malthuf, M.Sc." },
        { nama: "Lukman Nulhakim, MA." },
        { nama: "Azwandi, S.Ag., M.Hum." },
        { nama: "Zaenudin Amrulloh, M.A." },
        { nama: "Novia Suhastini, M.Si." },
        { nama: "Riska Mutiah, M.Si." },
        { nama: "Siti Aminah, M.Si." },
        { nama: "Hamdani Khaerul Fikri, Lc., M.Kom.I." },
        { nama: "Dr. H. Syamsu Syauqani, Lc., M.A." },
        { nama: "Dr. H. Bustami Saladin, M.A." },
        { nama: "Dr. H. Zulyadain, M.A." },
        { nama: "Dr. Nursyamsu, M.Ud." },
        { nama: "Mutma'innah, M.Th.I." },
        { nama: "Dr. Fitrah Sugiarto, M.Th.I." },
        { nama: "Mohamad Khoiril Anwar, M.Ag." },
        { nama: "Hulaimi Al-Amin, M.A." },
        { nama: "Dr. Abdul Rasyid Ridho, M.A." },
        { nama: "H. Lalu Muhamad Fazlurrahman, Lc., M.A." },
        { nama: "Prof. Dr. Nuruddin, S.Ag., M.Si." },
        { nama: "Dr. Murdianto, M.Si." },
        { nama: "Dr. Kamarudin Zaelani, M.Ag." },
        { nama: "Ar Rosikh, S.Ag., M.Fil.I." },
        { nama: "Muhammad Sukri, S.Fil.I., M.Hum." },
        { nama: "Halimatuzzahro, M.Ag." },
        { nama: "Lutfatul Azizah, M.Hum." },
        { nama: "Suparman Jayadi, M.Sos." },
        { nama: "H. Lalu Abdul Razzak, Lc., M.A." },
        { nama: "Radiyatun Adabiyah, M.Ag." },
        { nama: "Dr. H. Muhammad Rizky HK, MA." },
        { nama: "Dr. Agus, M.Si." },
        { nama: "Abdul Karim, S.S., M.Hum." },
        { nama: "Zakaria Ansori, S.Ag., M.Hum." },
        { nama: "Muh. Alwi Parhanudin, M.S.I." },
        { nama: "Saipul Arip Watoni, M.S.I." },
        { nama: "Agus Dedi Putrawan, M.S.I." },
        { nama: "Dr. M. Syamsurrijal, M.H.I." },
        { nama: "Dr. Ihsan Hamid, MA.Pol." },
        { nama: "Purnami Safitri, M.A." },
        { nama: "Very Wahyudi, M.A." },
        { nama: "Ulfatun Hasanah, MPA." },
        { nama: "Dr. H. Muhammad Said, Lc., M.A." },
        { nama: "Iskandar Dinata, SH., M.AP" },
        { nama: "Dr. Dahlia Hidayati, M.Fil.I." },
        { nama: "Maliki, M.Ag." },
        { nama: "Dr. Jamaluddin, M.Ed." },
        { nama: "Prof. Dr. H. M. Zaidi, M.Ag." },
        { nama: "Muh. Baihaqi, S.H.I., M.Si" },
        { nama: "Suriani, M.E.I." },
        { nama: "Gatot Suhirman, M.S.I." },
        { nama: "Imronjana Syapriatama, M.Sei." },
        { nama: "Sabrang Gilang Gemilang, M.Acc." },
        { nama: "Muhammad Muhajir Aminy, M.E." },
        { nama: "Didi Suwardi, M.Sc." },
        { nama: "H. Samahudin, M.E." },
        { nama: "Dewi Sartika Nasution, M.Ec." },
        { nama: "Naili Rahmawati, M.Ag." },
        { nama: "Tati Atmayanti, M.Ec.Dev." },
        { nama: "Siti Ahdina Saadatirrohmi, M.E." },
        { nama: "Lalu Ahmad Ramadani, M.E." },
        { nama: "Safwira Guna Putra, M.Ec.Dev." },
        { nama: "Intan Kusuma Pratiwi, M.Sei." },
        { nama: "Shofia Mauizotun Hasanah, M.E.I." },
        { nama: "Kharisma Rindang Sejati, Se., M.E." },
        { nama: "Rusman Azizoma, M.Acc." },
        { nama: "Muhammad Rido, M.M." },
        { nama: "Nur'aeda, M.E." },
        { nama: "Dr. Hj. Siti Nurul Khaerani, S.E., M.M." },
        { nama: "Salwa Hayati, S.E.I., M.E." },
        { nama: "Drs. Agus Mahmud, M.Ag." },
        { nama: "Nurul Susianti, M.E." },
        { nama: "Resti Kartika Dewi, S.E., M.Ak" },
        { nama: "Abdul Hadi Sukmana, M.E." },
        { nama: "Lalu Suprawan, M.E.I." },
        { nama: "Sirrul Hayati, M.Ak." },
        { nama: "Drs. H. Hariono, M.S.I." },
        { nama: "Yunia Ulfa Variana, S.E., M.Sc." },
        { nama: "Din Hary Fitriady, M.Ag." },
        { nama: "Syukriati, S.Pd., M.Hum." },
        { nama: "Muhammad Helmy Reza, M.M." },
        { nama: "Muhamad Johari, M.S.I." },
        { nama: "Wahyu Khalik, Sst.Par., M.Par." },
        { nama: "Hj. Suharti, S.Ag., M.Ag." },
        { nama: "Restu Fahdiansyah, M.S.A." },
        { nama: "M. Setyo Nugroho, M.Par." },
        { nama: "Afifudin, M.Ec.Dev." },
        { nama: "Jumaidin, M.M.Par." },
        { nama: "Drs. Ma'ruf, S.H., M.Ag." },
        { nama: "Dr. Ummu Rosyidah, M.E.I." }
    ];
    // await prisma.dosen.createMany({
    //     data: dosen
    // })
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
