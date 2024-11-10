export interface IPagination<T> {
    value: T[],
    pageLinkSize: number,
    rowsPerPageOptions: number[],
    lazy: boolean,
    loading: boolean,
    first: number,
    rows: number,
    totalRecords: number,
    search?: string | null | undefined
}
