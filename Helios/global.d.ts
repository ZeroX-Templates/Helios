// global.d.ts
interface Window {
  env?: {
    [key: string]: string | undefined;
    WORKOS_CLIENT_ID?: string;
    WORKOS_REDIRECT_URI?: string;
    // You can add other REPL_PUBLIC_ vars here if needed
  };
}
