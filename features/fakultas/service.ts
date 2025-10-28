import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableOptions, MutationOptions, handleFetchData, handleMutation, handleMutationError, handleMutationSuccess, handleSettled, showProcessAlert, validateForm } from "@/services/base";
import { fakultasSchema } from "./validations";
import { create } from "./actions/create";
import { update } from "./actions/update";
import { destroy } from "./actions/delete";
import { GET_PAGINATE } from "./actions/get";

interface StoreOptions extends MutationOptions { }

interface GetAllProps extends DataTableOptions {
    name?: string,
}
export const useGetFakultas = (params: GetAllProps) => {
    return handleFetchData(
        () => GET_PAGINATE(params as any),
        [
            "fakultas",
            {
                params,
            },
        ])
}

const handleValidation = (formData: any) => {
    const validationErrors = validateForm(fakultasSchema, formData);
    
    if (validationErrors) throw { ...validationErrors };
};

const createFakultas = async (formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (create(formData)),
        showProccessAlert,
        "Storing Data",
        "Data sedang diproses"
    );
};

const updateFakultas = async (id: number, formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (update(id, formData)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useStoreFakultas = async (options: StoreOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };
    return useMutation({
        mutationFn: (data: any) => createFakultas(data, showProccessAlert),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["fakultas"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Fakultas gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

export const useUpdateFakultas = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateFakultas(id, data, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["fakultas"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Fakultas gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

const deleteFakultas = async (id: number | null, action: () => Promise<any>, alertTitle: string) => {
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

export const useDeleteFakultas = (id: number, options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showAlert = true } = { showAlert: true, ...options };

    return useMutation({
        mutationFn: () => deleteFakultas(id, () => destroy(id), "Deleting Data"),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["fakultas"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Fakultas gagal dihapus"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert, "Fakultas berhasil dihapus"),
    });
};