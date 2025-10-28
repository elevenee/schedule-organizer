import { QueryClient, useQuery, UseQueryResult } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ZodObject } from "zod";
import toast from 'react-hot-toast';

export interface MutationOptions {
    serverAction?: boolean;
    showProccessAlert?: boolean;
    showAlert?: boolean;
}

export interface DataTableOptions {
    page: number;
    limit?: number;
    search?: string;
    remove_pagination?: boolean,
    sort?: {
        field: string,
        orderBy: string
    } | null | undefined
}

export const showProcessAlert = (title: string = "Please Wait", text: string = "Permintaan anda sedang di proses..") => {
    toast.loading(text);
};
export const proccessing = (title: string = "Please wait", text: string = "Permintaan anda sedang di proses..") => {
    Swal.fire({
        title: title,
        text: text,
        iconHtml: '<i class="bx bx-loader-circle bx-spin bx-lg border-0">',
        showConfirmButton: false,
        allowOutsideClick: false,
    });
};

export const showAlertDialog = (title: string, text: string, icon: "success" | "error") => {
    toast.dismiss()
    Swal.fire({
        title,
        text,
        icon,
        timer: 3000
    });
};

export const successMessage = (res: any, text: string = "Data berhasil disimpan") => {
    toast.dismiss()
    if (res?.errors) {
        const errorMessage = res.errors?.detail || "Pastikan data yang diinputkan telah sesuai";
        toast.error(errorMessage);
        return res;
    } else if (res?.errors_message) {
        toast.error(res.errors_message);
        return res;
    }
    toast.success(text)
    
};

export const errorMessage = (res: any, title: string = "Gagal", text: string = "Permintaan gagal dilakukan") => {
    Swal.close();
    const errorText = res?.response?.data?.errors ? "Pastikan data yang diinputkan telah sesuai" : res?.response?.data?.message || text;
    showAlertDialog(title, errorText, "error");
    return res?.response?.data || res;
};

export const handleFetchData = (
    action: () => Promise<any>,
    queryKey: (string | {
        params: any;
    })[]
): UseQueryResult<any, Error> => {
    const fetchData = async () => {
        try {
            const result = await action()
            if (!result) {
                throw new Error(`${result.message}`);
            }
            return result;
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Unknown error");
            }

            console.error("Failed to fetch data:", error);
            throw error instanceof Error ? error : new Error("Unknown error");
        }
    }
    return useQuery({
        queryKey: queryKey,
        queryFn: fetchData,
    })
}

export const handleMutationError = (error: any, showAlert: boolean, errorMessage: string) => {

    if (showAlert) {
        Swal.close();
        showAlertDialog("Gagal", errorMessage, "error");
    }
    return error;
};

export const handleMutationSuccess = async (res: any, showAlert: boolean, text?: string) => {
    if (res?.error) {
        const errorMessage = res.errors?.detail || "Pastikan data yang diinputkan telah sesuai";
        if (showAlert) {
            Swal.close();
            showAlertDialog("Gagal", errorMessage, "error");
        }
        return res;
    } else if (res?.errors_message) {
        if (showAlert) {
            Swal.close();
            showAlertDialog("Gagal", res.errors_message, "error");
        }
        return res;
    }
    
    if (showAlert) {
        Swal.close();
        return successMessage(res, text);
    }
    return res;
};

export const validateForm = (scheme: ZodObject, formData: any) => {
    const result = scheme.safeParse(formData);
    if (!result.success) {
        return result.error.flatten().fieldErrors
    }
    return null;
};

export const handleSettled = async (error: any, queryClient: QueryClient, queryKey: any, showAlert: boolean) => {
    if (error) {
        if (error.type === "ValidationError") {
            console.log(error);
            
            handleMutationError(error, showAlert, "Pastikan data yang diinput telah sesuai");
        } else {
            return error;
        }
    } else {
        await queryClient.invalidateQueries({ queryKey })
    }
};

export const handleMutation = async (action: () => Promise<any>, showProccessAlert: boolean, alertTitle: string, alertMessage: string) => {
    try {
        if (showProccessAlert) showProcessAlert(alertTitle, alertMessage);
        return await action();
    } catch (error) {
        throw error;
    }
};
