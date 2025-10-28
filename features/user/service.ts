import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableOptions, MutationOptions, handleFetchData, handleMutation, handleMutationError, handleMutationSuccess, handleSettled, showProcessAlert, validateForm } from "@/services/base";
import { userSchema } from "./validations";
import { create } from "./actions/create";
import { update, updateStatus } from "./actions/update";
import { destroy } from "./actions/delete";
import { GET_PAGINATE } from "./actions/get";

interface StoreOptions extends MutationOptions { }

interface GetAllProps extends DataTableOptions {
    status?: string,
    role?: string,
}
export const useGetUser = (params: GetAllProps) => {
    return handleFetchData(
        () => GET_PAGINATE(params as any),
        [
            "user",
            {
                params,
            },
        ])
}

const handleValidation = (formData: any) => {
    const validationErrors = validateForm(userSchema, formData);
    
    if (validationErrors) throw { ...validationErrors };
};

const createUser = async (formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (create(formData)),
        showProccessAlert,
        "Storing Data",
        "Data sedang diproses"
    );
};

const updateUser = async (id: number, formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (update(id, formData)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useStoreUser = async (options: StoreOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };
    return useMutation({
        mutationFn: (data: any) => createUser(data, showProccessAlert),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["user"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "User gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

export const useUpdateUser = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateUser(id, data, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["user"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "User gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

const deleteUser = async (id: number | null, action: () => Promise<any>, alertTitle: string) => {
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

export const useDeleteUser = (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showAlert = true } = { showAlert: true, ...options };

    return useMutation({
        mutationFn: (id: number) => deleteUser(id, () => destroy(id), "Deleting Data"),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["user"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "User gagal dihapus"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert, "User berhasil dihapus"),
    });
};

const updateStatusUser = async (id: number, showProccessAlert: boolean) => {
    return handleMutation(
        () => (updateStatus(id)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useUpdateStatusUser = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id }: { id: number }) => updateStatusUser(id, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["user"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Status User gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};