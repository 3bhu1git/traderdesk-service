export interface ScreenerData {
  _id: string;
  name: string;
  description?: string;
  chartinkUrl: string;
  triggerTime: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customFrequency?: {
    interval: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  createdAt: Date;
  updatedAt?: Date;
  formData?: string;
}

export interface UIScreenerData {
  name: string;
  description: string;
  formData: string;
  tags: string[];
  schedule: {
    interval: number;
    startTime: string;
    endTime: string;
    enabled: boolean;
  };
  isActive: boolean;
}

class ScreenerService {
  // Change baseUrl to match actual backend structure
  private static baseUrl = '/screeners'; // Remove /api prefix

  static async getScreeners(params: { page?: number; limit?: number; isActive?: boolean } = {}) {
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

      const response = await fetch(`${this.baseUrl}?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch screeners');
      }

      return result;
    } catch (error) {
      console.error('[ScreenerService] Error fetching screeners:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch screeners'
      };
    }
  }

  static async createScreener(data: any) {
    try {
      console.log('[ScreenerService] Creating screener with data:', data);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      console.log('[ScreenerService] Create response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create screener');
      }

      return result;
    } catch (error) {
      console.error('[ScreenerService] Error creating screener:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create screener'
      };
    }
  }

  static async updateScreener(id: string, data: any) {
    try {
      console.log('[ScreenerService] Updating screener:', id, data);
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      console.log('[ScreenerService] Update response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update screener');
      }

      return result;
    } catch (error) {
      console.error('[ScreenerService] Error updating screener:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update screener'
      };
    }
  }

  static async deleteScreener(id: string) {
    try {
      console.log('[ScreenerService] Deleting screener:', id);
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      console.log('[ScreenerService] Delete response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete screener');
      }

      return result;
    } catch (error) {
      console.error('[ScreenerService] Error deleting screener:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete screener'
      };
    }
  }

  static async runScreener(id: string) {
    try {
      console.log('[ScreenerService] Running screener:', id);
      
      const response = await fetch(`${this.baseUrl}/${id}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      console.log('[ScreenerService] Run response:', result);
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to run screener');
      }

      return result;
    } catch (error) {
      console.error('[ScreenerService] Error running screener:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to run screener'
      };
    }
  }

  // Convert between UI and API formats
  static convertToApiFormat(uiData: UIScreenerData): Partial<ScreenerData> {
    console.log('[ScreenerService] Converting UI data to API format:', uiData);
    
    return {
      name: uiData.name,
      description: uiData.description,
      chartinkUrl: 'https://chartink.com/screener/custom', // Placeholder
      triggerTime: uiData.schedule.startTime,
      frequency: 'custom',
      customFrequency: {
        interval: uiData.schedule.interval,
        unit: 'minutes'
      },
      isActive: uiData.isActive,
      formData: uiData.formData
    };
  }

  static convertFromApiFormat(apiData: ScreenerData): UIScreenerData {
    console.log('[ScreenerService] Converting API data to UI format:', apiData);
    
    return {
      name: apiData.name,
      description: apiData.description || '',
      formData: apiData.formData || '',
      tags: [], // Extract from description or separate field if available
      schedule: {
        interval: apiData.customFrequency?.interval || 30,
        startTime: apiData.triggerTime,
        endTime: '15:30', // Default end time
        enabled: apiData.isActive
      },
      isActive: apiData.isActive
    };
  }
}

export default ScreenerService;
