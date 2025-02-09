import { useCallback, useState } from "react"
import { RequestByEmployeeParams, Transaction } from "../utils/types"
import { TransactionsByEmployeeResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function useTransactionsByEmployee(): TransactionsByEmployeeResult {
  const { fetchWithCache, loading, clearCacheByEndpoint } = useCustomFetch()
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)

  const fetchById = useCallback(
    async (employeeId: string) => {
      const data = await fetchWithCache<Transaction[], RequestByEmployeeParams>(
        "transactionsByEmployee",
        { employeeId }
      )

      setTransactions(data)
    },
    [fetchWithCache]
  )

  const updateTransaction = useCallback(
    (transactionId: string, newAttributes: Partial<Transaction>) => {
      setTransactions((prevTransactions) => {
        if (!prevTransactions) return prevTransactions
        return prevTransactions.map((transaction) => {
          if (transaction.id === transactionId) {
            return { ...transaction, ...newAttributes }
          }
          return transaction
        })
      })
    },
    []
  )

  const invalidateData = useCallback(() => {
    clearCacheByEndpoint(["transactionsByEmployee"])
    setTransactions(null)
  }, [clearCacheByEndpoint])

  return {
    data: transactions,
    loading,
    fetchById,
    updateTransaction,
    invalidateData,
  }
}
