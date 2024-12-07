import type { Component} from "vue";

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


export interface IColumnTable {
    field: string;
    header: string;
    sortable?: boolean;
    component?: Component;
}
