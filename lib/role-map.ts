import { Role } from "@prisma/client";

// mapping role yang boleh akses folder/page
export const roleAccessMap: Record<string, Role[]> = {
    "/admin": [Role.ADMIN],
    "/fakultas": [Role.ADMIN, Role.FAKULTAS],
    "/prodi": [Role.ADMIN, Role.PRODI],
};
