import { useCallback } from "react"
import { useCustomFetch } from "../../hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "../../utils/types"
import { TransactionPane } from "./TransactionPane"
import { TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading, clearCacheByEndpoint } = useCustomFetch()

  const setTransactionApproval = useCallback(
    async ({ transactionId, value }: SetTransactionApprovalParams) => {
      await fetchWithoutCache("setTransactionApproval", {
        transactionId,
        value,
      })
      
      // Clear relevant caches to force a refresh with the new approval state
      clearCacheByEndpoint(["paginatedTransactions", "transactionsByEmployee"])
    },
    [fetchWithoutCache, clearCacheByEndpoint]
  )

  if (transactions === null) {
    return null
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
