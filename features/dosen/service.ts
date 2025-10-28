import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableOptions, MutationOptions, handleFetchData, handleMutation, handleMutationError, handleMutationSuccess, handleSettled, showProcessAlert, validateForm } from "@/services/base";
import { dosenSchema } from "./validations";
import { create } from "./actions/create";
import { update } from "./actions/update";
import { destroy } from "./actions/delete";
import { GET_PAGINATE } from "./actions/get";

interface StoreOptions extends MutationOptions { }

interface GetAllProps extends DataTableOptions {
    nama?: string,
}
export const useGetDosen = (params: GetAllProps) => {
    return handleFetchData(
        () => GET_PAGINATE(params as any),
        [
            "dosen",
            {
                params,
            },
        ])
}

const handleValidation = (formData: any) => {
    const validationErrors = validateForm(dosenSchema, formData);
    
    if (validationErrors) throw { ...validationErrors };
};

const createDosen = async (formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (create(formData)),
        showProccessAlert,
        "Storing Data",
        "Data sedang diproses"
    );
};

const updateDosen = async (id: number, formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (update(id, formData)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useStoreDosen = async (options: StoreOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };
    return useMutation({
        mutationFn: (data: any) => createDosen(data, showProccessAlert),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["dosen"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Dosen gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

export const useUpdateDosen = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateDosen(id, data, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["dosen"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Dosen gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

const deleteDosen = async (id: number | null, action: () => Promise<any>, alertTitle: string) => {
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

export const useDeleteDosen = (id: number, options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showAlert = true } = { showAlert: true, ...options };

    return useMutation({
        mutationFn: () => deleteDosen(id, () => destroy(id), "Deleting Data"),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["dosen"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Dosen gagal dihapus"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert, "Dosen berhasil dihapus"),
    });
};