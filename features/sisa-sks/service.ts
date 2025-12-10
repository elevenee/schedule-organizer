import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableOptions, MutationOptions, handleFetchData, handleMutation, handleMutationError, handleMutationSuccess, handleSettled, showProcessAlert, validateForm } from "@/services/base";
import { SisaSksSchema } from "./validations";
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
export const useGetSisaSks = (params: GetAllProps) => {
    return handleFetchData(
        () => GET_PAGINATE(params as any),
        [
            "sisa-sks",
            {
                params,
            },
        ])
}

const handleValidation = (formData: any) => {
    const validationErrors = validateForm(SisaSksSchema, formData);

    if (validationErrors) throw { ...validationErrors };
};

const createSisaSks = async (formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (create(formData)),
        showProccessAlert,
        "Storing Data",
        "Data sedang diproses"
    );
};

const updateSisaSks = async (id: number, formData: any, showProccessAlert: boolean) => {
    handleValidation(formData);
    return handleMutation(
        () => (update(id, formData)),
        showProccessAlert,
        "Updating Data",
        "Data sedang diproses"
    );
};

export const useStoreSisaSks = async (options: StoreOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };
    return useMutation({
        mutationFn: (data: any) => createSisaSks(data, showProccessAlert),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["sisa-sks"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Sisa Sks gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

export const useUpdateSisaSks = async (options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showProccessAlert = true, showAlert = true } = { showProccessAlert: true, showAlert: true, ...options };

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateSisaSks(id, data, showProccessAlert),
        onSettled: async (_, error, variables) => handleSettled(error, queryClient, ["sisa-sks"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Sisa Sks gagal disimpan"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert),
    });
};

const deleteSisaSks = async (id: number | null, action: () => Promise<any>, alertTitle: string) => {
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

export const useDeleteSisaSks = (id: number, options: MutationOptions = {}) => {
    const queryClient = useQueryClient();
    const { showAlert = true } = { showAlert: true, ...options };

    return useMutation({
        mutationFn: () => deleteSisaSks(id, () => destroy(id), "Deleting Data"),
        onSettled: async (_, error) => handleSettled(error, queryClient, ["sisa-sks"], showAlert),
        onError: (error: any) => handleMutationError(error, showAlert, "Sisa Sks gagal dihapus"),
        onSuccess: (res: any) => handleMutationSuccess(res, showAlert, "Sisa Sks berhasil dihapus"),
    });
};