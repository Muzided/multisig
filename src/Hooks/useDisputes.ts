import { useQuery } from "@tanstack/react-query";
import { getUserDisputes } from "@/services/Api/dispute/dispute";
import { UserDisputeResponse } from "@/types/dispute";

export const useUserDisputes = () => {
    return useQuery<UserDisputeResponse>({
        queryKey: ['userDisputes'],
        queryFn: async () => {
            const response = await getUserDisputes();
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    });
}; 