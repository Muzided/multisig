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