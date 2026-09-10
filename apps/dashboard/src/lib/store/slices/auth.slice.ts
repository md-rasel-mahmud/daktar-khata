import { type Gender } from "@/enums/gender.enums"
import { type RolesEnum } from "@/enums/role.enum"
import { createSlice } from "@reduxjs/toolkit"
import { type PayloadAction } from "@reduxjs/toolkit"

interface AuthState {
  user?: null | {
    user: {
      _id: string
      phone: string
      email?: string
      role: RolesEnum
      merchant: string | null
      permissions?: string[]
      staffRole?: string
      customRoleName?: string
    }
    profile: {
      _id: string
      name: string
      phone: string
      gender?: Gender
      dob?: string // ISO date string
      profileType: RolesEnum
      address?: string
    }
  }
  token?: string | null
  isLoading?: boolean
}

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
} satisfies AuthState as unknown as AuthState

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        user: AuthState["user"]
        token?: string | null
      } | null>
    ) => {
      state.user = action.payload?.user ?? null

      if (action.payload?.token) {
        // If user is provided, we assume the token is also provided
        state.token = action.payload.token
        localStorage.setItem("token", action.payload.token)
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    logout: (state) => {
      state.user = null
      state.isLoading = false

      localStorage.removeItem("token")
      // Optionally, you can add more logic here, like clearing tokens or redirecting
    },

    resetUser: (state) => {
      state.user = null
      state.token = null
      state.isLoading = false

      localStorage.removeItem("token")
    },
  },
})

export const { setUser, setLoading, logout, resetUser } = authSlice.actions
export default authSlice.reducer
