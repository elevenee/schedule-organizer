import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableOptions, MutationOptions, handleFetchData, handleMutation, handleMutationError, handleMutationSuccess, handleSettled, showProcessAlert, validateForm } from "@/services/base";
import { pengaturanJadwalSchema } from "./validations";
import { create } from "./actions/create";
import { update } from "./actions/update";
import { destroy } from "./actions/delete";
import { GET_PAGINATE } from "./actions/get";

interface StoreOptions extends MutationOptions { }

interface GetAllProps extends DataTableOptions {
    jenisDosen?: string,
}
export const useGetPengaturanJadwal = (params: GetAllProps) => {
    return handleFetchData(
        () => GET_PAGINATE(params as any),
        [
            "pengaturan-jadwal",
            {
                params,
            },
        ])
}

const handleValidation = (formData: any) => {
    const validationErrors = validateForm(pengaturanJadwalSchema, formData);
    
    if (validationErrors) throw { ...validationErrors };
};

const createPengaturanJadwal = async (formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (create(formData)),
        showProccessAlert,
        "Storing Data",
        "Data sedang diproses"
    );
};

const updatePengaturanJadwal = async (id: number, formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (update(id, formData)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useStorePengaturanJadwal = async (options: StoreOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };
    return useMutation({
        mutationFn: (data: any) => createPengaturanJadwal(data, showProccessAlert),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["pengaturan-jadwal"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Pengaturan jadwal gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

export const useUpdatePengaturanJadwal = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updatePengaturanJadwal(id, data, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["pengaturan-jadwal"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Pengaturan jadwal gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

const deletePengaturanJadwal = async (id: number | null, action: () => Promise<any>, alertTitle: string) => {
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

export const useDeletePengaturanJadwal = (id: number, options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showAlert = true } = { showAlert: true, ...options };

    return useMutation({
        mutationFn: () => deletePengaturanJadwal(id, () => destroy(id), "Deleting Data"),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["pengaturan-jadwal"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Pengaturan jadwal gagal dihapus"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert, "Pengaturan jadwal berhasil dihapus"),
    });
};