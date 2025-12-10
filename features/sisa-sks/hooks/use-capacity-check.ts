/* eslint-disable */
export function useCapacityCheck(item: any, pengaturan: any) {
    const settings = pengaturan?.data?.find((p: any) => p.jenisDosen === item.status);
    const minSks = settings?.minSks;
    const maxSks = settings?.maxSks;

    const isOverCapacity = maxSks ? item.totalSKS >= maxSks : false;
    const capacityStyle = isOverCapacity ? "bg-rose-100 dark:bg-rose-900" : "bg-green-100 dark:bg-green-900";

    return { capacityStyle, isOverCapacity, minSks, maxSks };
}