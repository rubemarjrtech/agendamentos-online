interface EnvConfig {
  apiURL: string;
  appName: string;
  adminUrl: string;
}

function loadEnv(): EnvConfig {
  const apiURL = import.meta.env.VITE_API_URL;
  const appName = import.meta.env.VITE_APP_NAME;
  const adminUrl = import.meta.env.VITE_ADMIN_URL;

  return { apiURL, appName, adminUrl };
}

export const env = loadEnv();
