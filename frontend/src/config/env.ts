interface EnvConfig {
  apiURL: string;
  appName: string;
  adminUrl: string;
}

function loadEnv(): EnvConfig {
  const apiURL = import.meta.env.VITE_API_URL;
  const appName = import.meta.env.VITE_APP_NAME;
  const adminURL = import.meta.env.ADMIN_URL;

  return { apiURL, appName, adminUrl: adminURL };
}

export const env = loadEnv();
