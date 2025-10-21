export const clearUserLocaleCookie = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'userLocale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};
