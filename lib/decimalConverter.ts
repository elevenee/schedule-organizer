// lib/decimalUtils.ts
export function convertDecimalsToNumbers<T extends object>(
    obj: T,
    decimalFields: (keyof T)[]
): T {
    if (!obj) return obj

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = { ...obj } as any

    decimalFields.forEach(field => {
        if (result[field] && typeof result[field] === 'object' && 'toNumber' in result[field]) {
            result[field] = result[field].toNumber()
        }
    })

    return result as T
}

export function convertDecimalsInArray<T extends object>(
    array: T[],
    decimalFields: (keyof T)[]
): T[] {
    if (!array) return []
    return array.map(item => convertDecimalsToNumbers(item, decimalFields))
}

// Utility untuk nested relations
export function convertNestedDecimals<T extends object>(
    obj: T,
    config: {
        [K in keyof T]?: (keyof NonNullable<T[K]> extends object ? NonNullable<T[K]> : never)[]
    }
): T {
    if (!obj) return obj

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = { ...obj } as any

    // Process nested relations
    Object.entries(config).forEach(([key, decimalFields]) => {
        if (result[key] && Array.isArray(result[key])) {
            // Handle array relations (hasMany)
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result[key] = result[key].map((item: any) =>
                convertDecimalsToNumbers(item, decimalFields as string[])
            )
        } else if (result[key] && typeof result[key] === 'object') {
            // Handle single relation (hasOne, belongsTo)
            result[key] = convertDecimalsToNumbers(result[key], decimalFields as string[])
        }
    })

    return result as T
}