// Read from environment — never hardcode payment keys in source.
// Set VITE_FLUTTERWAVE_PUBLIC_KEY in your .env.local file.
export const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '';
