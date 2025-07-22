import { LoginResponse, RegistrationVerificationResponse, SumsubAccessTokenResponse, User } from "@/types/user";
import { axiosService } from "../apiConfig";
import { AxiosError } from "axios";


export const RegisterUser = async (wallet_address: string) => {
    try {
        const response = await axiosService.post<RegistrationVerificationResponse>('/api/auth/authenticate', {
            wallet_address
        })

        return response
    } catch (error) {
        console.log("error while logging in", error)
        return null
    }
}


export const AuthenticatieUser = async (wallet_address: string, signature: string) => {
    try {
        const response = await axiosService.post<LoginResponse>('/api/auth/authenticate', {
            wallet_address,
            signature
        })

        return response
    } catch (error) {
        console.log("error while logging in", error)
        return null
    }
}
export const updateUserEmail = async (email: string) => {
    try {
        const response = await axiosService.put<LoginResponse>('/api/user/updateEmail', {
            newEmail: email
        })

        return response
    } catch (error) {
        console.log("error while updating email", error)
        throw error
    }
}
export function isUserRejectedSignatureError(error: any) {
    // Check for ethers.js v6 style error (ACTION_REJECTED)
    if (error.code === 'ACTION_REJECTED') {
        return true;
    }

    // Check for error code 4001 (standard MetaMask/EIP-1193 rejection code)
    if (error.code === 4001) {
        return true;
    }

    // Check for specific error message patterns
    const errorMsg = String(error.message || '').toLowerCase();
    const rejectionPatterns = [
        'user rejected',
        'user denied',
        'user cancelled',
        'user rejected the request',
        'ethers-user-denied'
    ];

    return rejectionPatterns.some(pattern => errorMsg.includes(pattern));
}


export const generateSumsubAccessToken = async () => {
    try {
        const response = await axiosService.get<SumsubAccessTokenResponse>('api/user/kyc/token')
        return response.data.token
    } catch (error) {
        console.log("error while generating sumsub access token", error)
        throw error
    }
}

