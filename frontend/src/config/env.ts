interface EnvConfig {
  apiURL: string;
  appName: string;
}

function loadEnv(): EnvConfig {
  const apiURL = import.meta.env.VITE_API_URL;
  const appName = import.meta.env.VITE_APP_NAME;

  return { apiURL, appName };
}

export const env = loadEnv();
