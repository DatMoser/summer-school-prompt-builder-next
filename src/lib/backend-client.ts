/**
 * Backend API client utility for authenticated requests
 */

export class BackendClient {
  private static getApiKey(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('promptrx-backend-api-key');
    } catch (error) {
      console.error('Error getting backend API key:', error);
      return null;
    }
  }

  private static getAuthHeaders(): Record<string, string> {
    const apiKey = this.getApiKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    return headers;
  }

  /**
   * Make an authenticated request to the backend API
   */
  static async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const authHeaders = this.getAuthHeaders();
    
    // If URL is relative, prepend backend URL
    let fullUrl = url;
    if (url.startsWith('/') && !url.startsWith('/api')) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (backendUrl) {
        fullUrl = `${backendUrl}${url}`;
      }
    }
    
    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };

    return fetch(fullUrl, mergedOptions);
  }

  /**
   * Check if the current API key is valid
   */
  static async validateApiKey(): Promise<boolean> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        console.error('Backend URL not configured');
        return false;
      }

      const apiKey = this.getApiKey();
      if (!apiKey) {
        console.error('No API key available for validation');
        return false;
      }

      // Check if in development mode and backend validation should be skipped
      const isDevelopment = process.env.NODE_ENV === 'development';
      const skipBackendValidation = process.env.NEXT_PUBLIC_SKIP_BACKEND_VALIDATION === 'true';
      
      if (isDevelopment && skipBackendValidation) {
        console.log('🔧 Development mode: Skipping backend validation');
        return true;
      }

      console.log('🔍 Validating API key with backend...');
      console.log('Backend URL:', backendUrl);

      // Use GET method for API key validation
      console.log('🚀 Making GET request to /validate endpoint...');
      const response = await fetch(`${backendUrl}/validate`, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
        },
      })

      console.log("response", response)

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Validation response:', response.status, responseData);
        return responseData.valid === true;
      }
      
      return false;
    } catch (error) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      console.error('Backend API key validation failed:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Make sure your backend server is running on:', backendUrl);
      return false;
    }
  }

  /**
   * Get the current API key (for display purposes)
   */
  static getCurrentApiKey(): string | null {
    return this.getApiKey();
  }

  /**
   * Check if an API key is configured
   */
  static hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  /**
   * Clear the stored API key
   */
  static clearApiKey(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('promptrx-backend-api-key');
    } catch (error) {
      console.error('Error clearing backend API key:', error);
    }
  }
}

export default BackendClient;