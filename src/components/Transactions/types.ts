import { FunctionComponent } from "react"
import { Transaction } from "../../utils/types"

export type SetTransactionApprovalFunction = (params: {
  transactionId: string
  value: boolean
}) => Promise<void>

export type TransactionPaneProps = {
  transaction: Transaction
  loading: boolean
  setTransactionApproval: SetTransactionApprovalFunction
}

export type TransactionPaneComponent = FunctionComponent<TransactionPaneProps>

export type TransactionsProps = { transactions: Transaction[] | null }

export type TransactionsComponent = FunctionComponent<TransactionsProps>
