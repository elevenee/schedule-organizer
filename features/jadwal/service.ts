import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableOptions, MutationOptions, handleFetchData, handleMutation, handleMutationError, handleMutationSuccess, handleSettled, showProcessAlert, validateForm } from "@/services/base";
import { jadwalSchema } from "./validations";
import { create } from "./actions/create";
import { update } from "./actions/update";
import { destroy } from "./actions/delete";
import { GET_PAGINATE } from "./actions/get";

interface StoreOptions extends MutationOptions { }

interface GetAllProps extends DataTableOptions {
    nama?: string,
    jenisDosen?: string,
    tahunAkademik?: number | null,
    fakultas?: number | null,
    programStudi?: number | null,
    fakultasBase?: number | null,
    programStudiBase?: number | null,
    matakuliah?: string | null,
    dosen?: number | null,
    semester?: string | null,
    kelas?: string[]
}
export const useGetJadwal = (params: GetAllProps) => {
    
    return handleFetchData(
        () => GET_PAGINATE(params as any),
        [
            "jadwal",
            {
                params,
            },
        ])
}

const handleValidation = (formData: any) => {
    const validationErrors = validateForm(jadwalSchema, formData);
    
    if (validationErrors) throw { ...validationErrors };
};

const createJadwal = async (formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (create(formData)),
        showProccessAlert,
        "Storing Data",
        "Data sedang diproses"
    );
};

const updateJadwal = async (id: number, formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (update(id, formData)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useStoreJadwal = async (options: StoreOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };
    return useMutation({
        mutationFn: (data: any) => createJadwal(data, showProccessAlert),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["jadwal"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Jadwal gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

export const useUpdateJadwal = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateJadwal(id, data, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["jadwal"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Jadwal gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

const deleteJadwal = async (id: number | null, action: () => Promise<any>, alertTitle: string) => {
    try {
        showProcessAlert(alertTitle, "Data sedang diproses..");
        const response = await action();
        if (response) {
            return response;
        } else {
            throw new Error(`Data gagal diproses: ${response.statusText}`);
        }
    } catch (error) {
        throw new Error(`Data gagal diproses: ${error}`);
    }
};

export const useDeleteJadwal = (id: number, options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showAlert = true } = { showAlert: true, ...options };

    return useMutation({
        mutationFn: () => deleteJadwal(id, () => destroy(id), "Deleting Data"),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["jadwal"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Jadwal gagal dihapus"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert, "Jadwal berhasil dihapus"),
    });
};