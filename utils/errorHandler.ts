import { toast } from "react-toastify";

export const handleError = (error: any) => {
    // Check if it's a MetaMask error
    if (error.code) {
        switch (error.code) {
            case 4001:
                toast.error("User rejected the request.");
                break;
            case -32603:
                toast.error("Internal JSON-RPC error.");
                break;
            default:
                toast.error(`MetaMask Error: ${error.message || "Unknown error"}`);
        }
    } 
    // Check if it's a contract error
    else if (error.reason) {
        toast.error(`Contract Error: ${error.reason}`);
    } 
    // Handle other errors
    else {
        toast.error(`Error: ${error.message || "An unknown error occurred"}`);
    }
};
