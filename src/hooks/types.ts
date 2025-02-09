import { Employee, PaginatedResponse, Transaction } from "../utils/types"

type UseTypeBaseResult<TValue> = {
  data: TValue
  loading: boolean
  invalidateData: () => void
}

type UseTypeBaseAllResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchAll: () => Promise<void>
}

type UseTypeBaseByIdResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchById: (id: string) => Promise<void>
}

export type EmployeeResult = UseTypeBaseAllResult<Employee[] | null>

export type PaginatedTransactionsResult = UseTypeBaseAllResult<PaginatedResponse<Transaction[]> | null>

export type TransactionsByEmployeeResult = {
  data: Transaction[] | null
  loading: boolean
  fetchById: (employeeId: string) => Promise<void>
  updateTransaction: (transactionId: string, newAttributes: Partial<Transaction>) => void
  invalidateData: () => void
}

export type UseCustomFetchResult = {
  fetchWithCache: <TData, TParams extends object = object>(
    endpoint: string,
    params?: TParams
  ) => Promise<TData | null>
  fetchWithoutCache: <TData, TParams extends object = object>(
    endpoint: string,
    params?: TParams
  ) => Promise<TData | null>
  loading: boolean
  clearCache: () => void
  clearCacheByEndpoint: (endpointsToClear: string[]) => void
}
