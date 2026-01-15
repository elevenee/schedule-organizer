/* eslint-disable */
export function useCapacityCheck(item: any, pengaturan: any) {
    const settings = pengaturan?.data?.find((p: any) => p.jenisDosen === item.status);
    const minSks = settings?.minSks;
    const maxSks = settings?.maxSks;

    const isOverCapacity = maxSks ? item.totalSKS > maxSks : false;
    let capacityStyle = "bg-green-100 dark:bg-green-900";
    if (isOverCapacity) {
        capacityStyle = "bg-rose-100 dark:bg-rose-900";
    } else {
        if (item.totalSKS < minSks) {
            capacityStyle = "bg-orange-200 dark:bg-orange-800";
        }
    }

    return { capacityStyle, isOverCapacity, minSks, maxSks };
}