import { AxiosError } from "axios";

export function convertUnixToDate(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleString("en-US", {
    weekday: "long", // Example: "Tuesday"
    year: "numeric", // Example: "2080"
    month: "long", // Example: "June"
    day: "numeric", // Example: "26"
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
}


export const getStatusStyles = (status: string) => {
  const baseClasses = "border bg-opacity-10 dark:bg-opacity-10"

  switch (status.toLowerCase()) {
    case "active":
      return `${baseClasses} border-green-500 bg-green-500/10 text-green-600 dark:border-green-500 dark:text-green-500`
    case "under_review":
      return `${baseClasses} border-green-500 bg-green-500/10 text-green-600 dark:border-green-500 dark:text-green-500`
    case "pending":
      return `${baseClasses} border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:border-yellow-500 dark:text-yellow-500`
    case "completed":
      return `${baseClasses} border-blue-500 bg-blue-500/10 text-blue-600 dark:border-blue-500 dark:text-blue-500`
    case "in dispute":
      return `${baseClasses} border-red-500 bg-red-500/10 text-red-600 dark:border-red-500 dark:text-red-500`
    case "expired":
      return `${baseClasses} border-red-500 bg-red-500/10 text-red-600 dark:border-red-500 dark:text-red-500`
    case "reolved":
      return `${baseClasses} border-red-500 bg-red-500/10 text-red-600 dark:border-red-500 dark:text-red-500`
    default:
      return `${baseClasses} border-gray-500 bg-gray-500/10 text-gray-600 dark:border-gray-500 dark:text-gray-500`
  }
}




export const unixToDate = (unixTimestamp: number): Date => {
    return new Date(unixTimestamp * 1000); // Convert seconds to milliseconds
};


export const dateToUnix = (date: Date): number => {
    return Math.floor(date.getTime() / 1000); // Convert milliseconds to seconds
};

