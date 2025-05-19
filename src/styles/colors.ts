export const colors = {
  primary: {
    DEFAULT: '#BB7333',
    50: '#F5E6D9',
    100: '#EFD9C7',
    200: '#E3C0A3',
    300: '#D7A77F',
    400: '#CB8E5B',
    500: '#BB7333', // Main color
    600: '#965C29',
    700: '#71451F',
    800: '#4C2E15',
    900: '#27170B',
  },
  // You can add more color categories here
} as const;

// Type for the color object
export type ColorScheme = typeof colors; 