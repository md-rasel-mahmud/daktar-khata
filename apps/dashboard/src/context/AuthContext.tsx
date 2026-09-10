import { createContext } from "react"

interface AuthContextType {
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
