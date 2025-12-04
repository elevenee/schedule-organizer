import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableOptions, MutationOptions, handleFetchData, handleMutation, handleMutationError, handleMutationSuccess, handleSettled, showProcessAlert, validateForm } from "@/services/base";
import { programStudiSchema } from "../validations";
import { create } from "../actions/create";
import { update } from "../actions/update";
import { destroy } from "../actions/delete";
import { GET_PAGINATE } from "../actions/get";
import { SYNC } from "../actions/sync";

interface StoreOptions extends MutationOptions { }

interface GetAllProps extends DataTableOptions {
    search?: string,
    name?: string,
    fakultas?: number
}
export const useGetProdi = (params: GetAllProps) => {
    return handleFetchData(
        () => GET_PAGINATE(params as any),
        [
            "program-studi",
            {
                params,
            },
        ])
}

const handleValidation = (formData: any) => {
    const validationErrors = validateForm(programStudiSchema, formData);
    if (validationErrors) throw { ...validationErrors };
};

const createProgramStudi = async (formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (create(formData)),
        showProccessAlert,
        "Storing Data",
        "Data sedang diproses"
    );
};

const updateProgramStudi = async (id: number, formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (update(id, formData)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useStoreProgramStudi = async (options: StoreOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };
    return useMutation({
        mutationFn: (data: any) => createProgramStudi(data, showProccessAlert),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["program-studi"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Program Studi gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

export const useUpdateProgramStudi = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateProgramStudi(id, data, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["program-studi"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Program Studi gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

const deleteProgramStudi = async (id: number | null, action: () => Promise<any>, alertTitle: string) => {
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

export const useDeleteProgramStudi = (id: number, options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showAlert = true } = { showAlert: true, ...options };

    return useMutation({
        mutationFn: () => deleteProgramStudi(id, () => destroy(id), "Deleting Data"),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["program-studi"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Program Studi gagal dihapus"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert, "Program Studi berhasil dihapus"),
    });
};
const syncProgramStudi = async (action: () => Promise<any>, alertTitle: string) => {
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

export const useSyncProgramStudi = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showAlert = true } = { showAlert: true, ...options };

    return useMutation({
        mutationFn: () => syncProgramStudi(() => SYNC(), "Syncroning Data"),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["program-studi"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Program Studi gagal disingkronkan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert, "Program Studi berhasil disingkronkan"),
    });
};