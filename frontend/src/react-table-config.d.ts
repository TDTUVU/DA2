import {
    UseColumnOrderInstanceProps,
    UseColumnOrderState,
    UseExpandedHooks,
    UseExpandedInstanceProps,
    UseExpandedOptions,
    UseExpandedRowProps,
    UseExpandedState,
    UseFiltersColumnOptions,
    UseFiltersColumnProps,
    UseFiltersInstanceProps,
    UseFiltersOptions,
    UseFiltersState,
    UseGlobalFiltersColumnOptions,
    UseGlobalFiltersInstanceProps,
    UseGlobalFiltersOptions,
    UseGlobalFiltersState,
    UseGroupByCellProps,
    UseGroupByColumnOptions,
    UseGroupByColumnProps,
    UseGroupByHooks,
    UseGroupByInstanceProps,
    UseGroupByOptions,
    UseGroupByRowProps,
    UseGroupByState,
    UsePaginationInstanceProps,
    UsePaginationOptions,
    UsePaginationState,
    UseResizeColumnsColumnOptions,
    UseResizeColumnsColumnProps,
    UseResizeColumnsState,
    UseRowSelectHooks,
    UseRowSelectInstanceProps,
    UseRowSelectOptions,
    UseRowSelectRowProps,
    UseRowSelectState,
    UseRowStateCellProps,
    UseRowStateInstanceProps,
    UseRowStateOptions,
    UseRowStateRowProps,
    UseRowStateState,
    UseSortByColumnOptions,
    UseSortByColumnProps,
    UseSortByHooks,
    UseSortByInstanceProps,
    UseSortByOptions,
    UseSortByState
} from 'react-table'

declare module 'react-table' {
    // take a look at the react-table-config.d.ts file here: https://react-table.tanstack.com/docs/api/ct-react-table-config.d.ts
    // In v7, you need to manually augment types which is no longer required in v8
    export interface TableOptions<D extends Record<string, unknown>>
        extends UseExpandedOptions<D>,
            UseFiltersOptions<D>,
            UseGlobalFiltersOptions<D>,
            UseGroupByOptions<D>,
            UsePaginationOptions<D>,
            UseResizeColumnsOptions<D>,
            UseRowSelectOptions<D>,
            UseRowStateOptions<D>,
            // note that having Record here allows you to add anything to the options, this matches the spirit of the v8 being headless
            Record<string, any> {}

    export interface Hooks<D extends Record<string, unknown> = {}>
        extends UseExpandedHooks<D>,
            UseGroupByHooks<D>,
            UseRowSelectHooks<D>,
            UseSortByHooks<D> {}

    export interface TableInstance<D extends Record<string, unknown> = {}>
        extends UseColumnOrderInstanceProps<D>,
            UseExpandedInstanceProps<D>,
            UseFiltersInstanceProps<D>,
            UseGlobalFiltersInstanceProps<D>,
            UseGroupByInstanceProps<D>,
            UsePaginationInstanceProps<D>,
            UseRowSelectInstanceProps<D>,
            UseRowStateInstanceProps<D>,
            UseSortByInstanceProps<D> {}

    export interface TableState<D extends Record<string, unknown> = {}>
        extends UseColumnOrderState<D>,
            UseExpandedState<D>,
            UseFiltersState<D>,
            UseGlobalFiltersState<D>,
            UseGroupByState<D>,
            UsePaginationState<D>,
            UseResizeColumnsState<D>,
            UseRowSelectState<D>,
            UseRowStateState<D>,
            UseSortByState<D> {}

    export interface ColumnInterface<D extends Record<string, unknown> = {}>
        extends UseFiltersColumnOptions<D>,
            UseGlobalFiltersColumnOptions<D>,
            UseGroupByColumnOptions<D>,
            UseResizeColumnsColumnOptions<D>,
            UseSortByColumnOptions<D> {}

    export interface ColumnInstance<D extends Record<string, unknown> = {}>
        extends UseFiltersColumnProps<D>,
            UseGroupByColumnProps<D>,
            UseResizeColumnsColumnProps<D>,
            UseSortByColumnProps<D> {}

    export interface Cell<D extends Record<string, unknown> = {}, V = any>
        extends UseGroupByCellProps<D>,
            UseRowStateCellProps<D> {}

    export interface Row<D extends Record<string, unknown> = {}>
        extends UseExpandedRowProps<D>,
            UseGroupByRowProps<D>,
            UseRowSelectRowProps<D>,
            UseRowStateRowProps<D> {}
} 