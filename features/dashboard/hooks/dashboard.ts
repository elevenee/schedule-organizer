'use client'
import { handleFetchData } from "@/services/base"
import { GET_DASHBOARD } from "../actions/get"

interface GetAllProps {
    tahunAjaranId?: number,
    fakultasId?: number,
}
export const useGetDashboard = (params: GetAllProps) => {
    return handleFetchData(
        () => GET_DASHBOARD(params as any),
        [
            "dashboard",
            {
                params,
            },
        ])
}