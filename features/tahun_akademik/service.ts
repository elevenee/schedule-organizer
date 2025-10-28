import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableOptions, MutationOptions, handleFetchData, handleMutation, handleMutationError, handleMutationSuccess, handleSettled, showProcessAlert, validateForm } from "@/services/base";
import { tahunAkademikSchema } from "./validations";
import { create } from "./actions/create";
import { update, updateStatus } from "./actions/update";
import { destroy } from "./actions/delete";
import { GET_PAGINATE } from "./actions/get";

interface StoreOptions extends MutationOptions { }

interface GetAllProps extends DataTableOptions {
    tahun?: string,
}
export const useGetTahunAkademik = (params: GetAllProps) => {
    return handleFetchData(
        () => GET_PAGINATE(params as any),
        [
            "tahun-akademik",
            {
                params,
            },
        ])
}

const handleValidation = (formData: any) => {
    const validationErrors = validateForm(tahunAkademikSchema, formData);
    
    if (validationErrors) throw { ...validationErrors };
};

const createTahunAkademik = async (formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (create(formData)),
        showProccessAlert,
        "Storing Data",
        "Data sedang diproses"
    );
};

const updateTahunAkademik = async (id: number, formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (update(id, formData)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useStoreTahunAkademik = async (options: StoreOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };
    return useMutation({
        mutationFn: (data: any) => createTahunAkademik(data, showProccessAlert),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["tahun-akademik"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Tahun akademik gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

export const useUpdateTahunAkademik = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateTahunAkademik(id, data, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["tahun-akademik"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Tahun akademik gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

const deleteTahunAkademik = async (id: number | null, action: () => Promise<any>, alertTitle: string) => {
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

export const useDeleteTahunAkademik = (id: number, options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showAlert = true } = { showAlert: true, ...options };

    return useMutation({
        mutationFn: () => deleteTahunAkademik(id, () => destroy(id), "Deleting Data"),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["tahun-akademik"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Tahun akademik gagal dihapus"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert, "Tahun akademik berhasil dihapus"),
    });
};

const updateStatusTahunAkademik = async (id: number, showProccessAlert: boolean) => {
    return handleMutation(
        () => (updateStatus(id)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useUpdateStatusTahunAkademik = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id }: { id: number }) => updateStatusTahunAkademik(id, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["tahun-akademik"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Status Tahun akademik gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};