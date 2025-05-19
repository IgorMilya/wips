import { createSlice, PayloadAction } from '@reduxjs/toolkit'


interface userAction {
  user: null
  auth: string | null
}

const initialState: userAction = {
  user: null,
  auth: localStorage.getItem("isAuth")
}

const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<null>) => {
      state.user = action.payload
      state.auth = "true"
    },
    logoutUser: (state) => {
      state.user = null
      state.auth = null
    },
  },
})

export const { loginUser, logoutUser } = userSlice.actions

export default userSlice.reducer
