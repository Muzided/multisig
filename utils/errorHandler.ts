import { AxiosError } from "axios";
import { ApiError } from "@/types/error";
import { toast } from "react-toastify";

export const handleError = (error: any) => {
    // Convert error to string if it's not already
    const errorString = error.toString().toLowerCase();

    // Check for common error patterns in the string
    if (errorString.includes("user rejected") || errorString.includes("user denied")) {
        toast.error("User rejected the request.");
    }
    else if (errorString.includes("insufficient funds") || errorString.includes("insufficient balance")) {
        toast.error("Insufficient funds to complete the transaction.");
    }
    else if (errorString.includes("gas required exceeds allowance")) {
        toast.error("Gas limit too low. Please try again with higher gas limit.");
    }
    else if (errorString.includes("nonce has already been used")) {
        toast.error("Transaction already processed. Please try again.");
    }
    else if (errorString.includes("execution reverted")) {
        // Extract the revert reason if available
        const revertReason = errorString.split("execution reverted:")[1]?.trim();
        toast.error(revertReason || "Transaction reverted by the contract.");
    }
    else if (errorString.includes("network error") || errorString.includes("network changed")) {
        toast.error("Network error. Please check your connection.");
    }
    else if (errorString.includes("invalid address")) {
        toast.error("Invalid address provided.");
    }
    else if (errorString.includes("invalid value")) {
        toast.error("Invalid value provided for the transaction.");
    }
    else {
        // For any other errors, show the original error message
        toast.error(` ${error.message || errorString || "An unknown error occurred"}`);
    }
};

export function extractErrorMessage(error: AxiosError): string {
    const data = error.response?.data;


    if (typeof data === 'string') {
       
        return data;
    }

    if (typeof data === 'object' && data !== null) {
       
        if ('message' in data) {
            return (data as any).message;
        }

        if ('error' in data) {
            return (data as any).error;
        }
    }

    return 'An unexpected error occurred';
}

export function showApiErrorToast(error: ApiError): void {
    const { message, status, code } = error;
  
    console.error('API Error:', { message, status, code });
  
    toast.error(message || 'Something went wrong');
  }
