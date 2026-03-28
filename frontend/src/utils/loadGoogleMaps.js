// Dynamically load Google Maps API
let isLoading = false;
let isLoaded = false;

export const loadGoogleMapsAPI = () => {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (isLoaded) {
      resolve();
      return;
    }

    // Currently loading
    if (isLoading) {
      const checkLoaded = setInterval(() => {
        if (isLoaded) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      return;
    }

    isLoading = true;

    const script = document.createElement('script');
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found in environment variables');
      reject(new Error('Google Maps API key not configured'));
      return;
    }

    window.__initGoogleMaps = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
      delete window.__initGoogleMaps;
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=__initGoogleMaps`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps API'));
      delete window.__initGoogleMaps;
    };

    document.head.appendChild(script);
  });
};

export default loadGoogleMapsAPI;
