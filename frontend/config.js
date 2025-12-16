// Default API URL 
export const DEFAULT_API_URL = "http://195.148.20.75:8080";

// This will be dynamically set by DataSourceContext
export let API_URL = DEFAULT_API_URL;

export function setApiUrl(url) {
  API_URL = url;
}