import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { User } from './../types.d';

//authstate define the structure of authentication state//
interface AuthState {  
    user: User | null;
};

const initialState: AuthState = {
    user: null, // User is initially set null
  };

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {  //functions to handle state updates//
        setAuthUser :(state,action:PayloadAction<User | null>) => {
            state.user = action.payload;
        },
    },
});

export const { setAuthUser } = authSlice.actions;

export default authSlice.reducer


