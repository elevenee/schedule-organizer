import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableOptions, MutationOptions, handleFetchData, handleMutation, handleMutationError, handleMutationSuccess, handleSettled, showProcessAlert, validateForm } from "@/services/base";
import { mataKuliahSchema } from "../validations";
import { create } from "../actions/create";
import { update } from "../actions/update";
import { destroy } from "../actions/delete";
import { GET_PAGINATE, GET_STATISTIC } from "../actions/get";
import { SYNC } from "../actions/sync";

interface StoreOptions extends MutationOptions { }

interface GetAllProps extends DataTableOptions {
    search?: string,
    jenjang?: string | null,
    semester?: string | null,
    jurusanId?: number | null,
    kurikulumId?: number | null
}
export const useGetMataKuliah = (params: GetAllProps) => {
    return handleFetchData(
        () => GET_PAGINATE(params as any),
        [
            "mata-kuliah",
            {
                params,
            },
        ])
}
export const useGetStatMataKuliah = (params: GetAllProps) => {
    return handleFetchData(
        () => GET_STATISTIC(params as any),
        [
            "mata-kuliah",
            {
                params,
            },
        ])
}

const handleValidation = (formData: any) => {
    const validationErrors = validateForm(mataKuliahSchema, formData);

    if (validationErrors) throw { ...validationErrors };
};

const createMataKuliah = async (formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (create(formData)),
        showProccessAlert,
        "Storing Data",
        "Data sedang diproses"
    );
};

const updateMataKuliah = async (id: number, formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (update(id, formData)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useStoreMataKuliah = async (options: StoreOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };
    return useMutation({
        mutationFn: (data: any) => createMataKuliah(data, showProccessAlert),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["mata-kuliah"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Mata Kuliah gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

export const useUpdateMataKuliah = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateMataKuliah(id, data, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["mata-kuliah"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Mata Kuliah gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

const deleteMataKuliah = async (id: number | null, action: () => Promise<any>, alertTitle: string) => {
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

export const useDeleteMataKuliah = (id: number, options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showAlert = true } = { showAlert: true, ...options };

    return useMutation({
        mutationFn: () => deleteMataKuliah(id, () => destroy(id), "Deleting Data"),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["mata-kuliah"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Mata Kuliah gagal dihapus"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert, "Mata Kuliah berhasil dihapus"),
    });
};

const syncMatkul = async (action: () => Promise<any>, alertTitle: string) => {
    try {
        showProcessAlert(alertTitle, "Proses syncronisasi data..");
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

export const useSyncMatkul = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showAlert = true } = { showAlert: true, ...options };

    return useMutation({
        mutationFn: () => syncMatkul(() => SYNC(), "Syncroning Data"),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["mata-kuliah"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Mata Kuliah gagal disingkronkan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert, "Mata Kuliah berhasil disingkronkan"),
    });
};