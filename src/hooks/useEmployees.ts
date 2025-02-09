import { useCallback, useState } from "react"
import { Employee } from "../utils/types"
import { getEmployees } from "../utils/requests"

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[] | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const employeesData = await getEmployees()
      setEmployees(employeesData)
    } finally {
      setLoading(false)
    }
  }, [])

  const invalidateData = useCallback(() => {
    setEmployees(null)
  }, [])

  return { data: employees, loading, fetchAll, invalidateData }
}
