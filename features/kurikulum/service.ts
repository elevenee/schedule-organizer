import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableOptions, MutationOptions, handleFetchData, handleMutation, handleMutationError, handleMutationSuccess, handleSettled, showProcessAlert, validateForm } from "@/services/base";
import { kurikulumSchema } from "./validations";
import { create } from "./actions/create";
import { update, updateStatus } from "./actions/update";
import { destroy } from "./actions/delete";
import { GET_KURIKULUM_AKTIF, GET_PAGINATE } from "./actions/get";

interface StoreOptions extends MutationOptions { }

interface GetAllProps extends DataTableOptions {
    nama?: string,
    jurusanId?: number |null
}
export const useGetKurikulum = (params: GetAllProps) => {
    return handleFetchData(
        () => GET_PAGINATE(params as any),
        [
            "kurikulum",
            {
                params,
            },
        ])
}

export const useGetKurikulumAktif = (params: GetAllProps) => {
    return handleFetchData(
        () => GET_KURIKULUM_AKTIF(params as any),
        [
            "kurikulum-aktif",
            {
                params,
            },
        ])
}

const handleValidation = (formData: any) => {
    const validationErrors = validateForm(kurikulumSchema, formData);
    
    if (validationErrors) throw { ...validationErrors };
};

const createKurikulum = async (formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (create(formData)),
        showProccessAlert,
        "Storing Data",
        "Data sedang diproses"
    );
};

const updateKurikulum = async (id: number, formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (update(id, formData)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useStoreKurikulum = async (options: StoreOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };
    return useMutation({
        mutationFn: (data: any) => createKurikulum(data, showProccessAlert),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["kurikulum"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Tahun akademik gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

export const useUpdateKurikulum = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateKurikulum(id, data, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["kurikulum"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Tahun akademik gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

const deleteKurikulum = async (id: number | null, action: () => Promise<any>, alertTitle: string) => {
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

export const useDeleteKurikulum = (id: number, options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showAlert = true } = { showAlert: true, ...options };

    return useMutation({
        mutationFn: () => deleteKurikulum(id, () => destroy(id), "Deleting Data"),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["kurikulum"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Tahun akademik gagal dihapus"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert, "Tahun akademik berhasil dihapus"),
    });
};

const updateStatusKurikulum = async (id: number, showProccessAlert: boolean) => {
    return handleMutation(
        () => (updateStatus(id)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useUpdateStatusKurikulum = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id }: { id: number }) => updateStatusKurikulum(id, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["kurikulum"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Status Tahun akademik gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};