import { Fragment, useCallback, useEffect, useMemo, useState, useRef } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, loading: employeesLoading, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, loading: paginatedLoading, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, loading: employeeTransactionsLoading, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const lastScrollPosition = useRef(0)

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  // Save scroll position before loading more
  const saveScrollPosition = useCallback(() => {
    if (gridRef.current) {
      lastScrollPosition.current = gridRef.current.scrollTop
    }
  }, [])

  // Restore scroll position after loading more
  const restoreScrollPosition = useCallback(() => {
    if (gridRef.current && lastScrollPosition.current) {
      gridRef.current.scrollTop = lastScrollPosition.current
    }
  }, [])

  const loadAllTransactions = useCallback(async () => {
    setIsInitialLoading(true)
    setError(null)
    setCurrentEmployeeId(null)
    transactionsByEmployeeUtils.invalidateData()

    try {
      await employeeUtils.fetchAll()
      await paginatedTransactionsUtils.fetchAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions")
    } finally {
      setIsInitialLoading(false)
    }
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadMoreTransactions = useCallback(async () => {
    setError(null)
    saveScrollPosition()
    
    try {
      if (currentEmployeeId && currentEmployeeId !== EMPTY_EMPLOYEE.id) {
        await transactionsByEmployeeUtils.fetchById(currentEmployeeId)
      } else {
        await paginatedTransactionsUtils.fetchAll()
      }
      // Use setTimeout to ensure DOM has updated
      setTimeout(restoreScrollPosition, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more transactions")
    }
  }, [currentEmployeeId, paginatedTransactionsUtils, transactionsByEmployeeUtils, saveScrollPosition, restoreScrollPosition])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      setError(null)
      setCurrentEmployeeId(employeeId)
      paginatedTransactionsUtils.invalidateData()
      
      try {
        await transactionsByEmployeeUtils.fetchById(employeeId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load employee transactions")
      }
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeesLoading) {
      loadAllTransactions()
    }
  }, [employeesLoading, employees, loadAllTransactions])

  // Compute loading states
  const isEmployeeFilterLoading = isInitialLoading || employeesLoading
  const isTransactionsLoading = employeeTransactionsLoading || (paginatedLoading && !transactions)

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isEmployeeFilterLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }

            if (newValue.id === EMPTY_EMPLOYEE.id) {
              await loadAllTransactions()
              return
            }

            await loadTransactionsByEmployee(newValue.id)
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid" ref={gridRef}>
          {error && (
            <div className="RampError">
              {error}
              <button className="RampButton" onClick={() => loadAllTransactions()}>
                Retry
              </button>
            </div>
          )}

          <div className="RampGrid--transactions">
            <Transactions transactions={transactions} />
            {isTransactionsLoading && (
              <div className="RampLoading--container">Loading transactions...</div>
            )}
          </div>

          {transactions !== null && paginatedTransactions?.nextPage !== null && (
            <div style={{ textAlign: 'center' }}>
              <button
                className={`RampButton ${paginatedLoading ? 'RampButton--loading' : ''}`}
                disabled={paginatedLoading}
                onClick={loadMoreTransactions}
              >
                View More
                {!paginatedLoading && paginatedTransactions && (
                  <span className="RampTransactionCount">
                    ({transactions.length} of {transactions.length + (paginatedTransactions.nextPage * 5)})
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </Fragment>
  )
}
