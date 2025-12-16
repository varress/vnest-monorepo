import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { DEFAULT_API_URL, setApiUrl as updateGlobalApiUrl } from '@/config';
import { loadControllers } from '@/services/exerciseManagementService';
import { loadAVPControllers } from '@/services/avpService';

export type DataSourceType = 'local' | 'api';

interface DataSourceConfig {
  dataSource: DataSourceType;
  apiUrl: string;
  setDataSource: (source: DataSourceType) => Promise<void>;
  setApiUrl: (url: string) => Promise<void>;
}

const DataSourceContext = createContext<DataSourceConfig | undefined>(undefined);

const DATA_SOURCE_KEY = '@vnest_data_source';
const API_URL_KEY = '@vnest_api_url';

export function DataSourceProvider({ children }: { children: React.ReactNode }) {
  const [dataSource, setDataSourceState] = useState<DataSourceType>('local');
  const [apiUrl, setApiUrlState] = useState<string>(DEFAULT_API_URL);

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedDataSource = await AsyncStorage.getItem(DATA_SOURCE_KEY);
      const savedApiUrl = await AsyncStorage.getItem(API_URL_KEY);
      
      let finalDataSource: DataSourceType;
      if (savedDataSource) {
        finalDataSource = savedDataSource as DataSourceType;
        setDataSourceState(finalDataSource);
      } else {
        // Default to 'api' for web, 'local' for mobile
        finalDataSource = Platform.OS === 'web' ? 'api' : 'local';
        setDataSourceState(finalDataSource);
      }
      
      let finalApiUrl: string;
      if (savedApiUrl) {
        finalApiUrl = savedApiUrl;
        setApiUrlState(finalApiUrl);
      } else {
        finalApiUrl = DEFAULT_API_URL;
      }
      
      // Initialize global configuration
      updateGlobalApiUrl(finalApiUrl);
      loadControllers(finalDataSource);
      loadAVPControllers(finalDataSource);
      
      console.log(`📱 Initialized data source: ${finalDataSource}, API URL: ${finalApiUrl}`);
    } catch (error) {
      console.error('Error loading data source settings:', error);
    }
  };

  const setDataSource = async (source: DataSourceType) => {
    try {
      await AsyncStorage.setItem(DATA_SOURCE_KEY, source);
      setDataSourceState(source);
      
      // Switch controllers based on data source
      loadControllers(source);
      loadAVPControllers(source);
      
      const modeDescription = source === 'api' ? 
        'Backend API (data from server)' : 
        'Local Database (JSON files on web, Realm on mobile)';
      
      console.log(`🔄 Data Source Changed: Switched to ${modeDescription}`);
      console.log(`💡 Tip: Start a new exercise set to see the updated data source in action`);
    } catch (error) {
      console.error('Error saving data source:', error);
    }
  };

  const setApiUrl = async (url: string) => {
    try {
      await AsyncStorage.setItem(API_URL_KEY, url);
      setApiUrlState(url);
      
      // Update global API URL configuration
      updateGlobalApiUrl(url);
      
      console.log(`🌐 Updated API URL to: ${url}`);
    } catch (error) {
      console.error('Error saving API URL:', error);
    }
  };

  return (
    <DataSourceContext.Provider value={{
      dataSource,
      apiUrl,
      setDataSource,
      setApiUrl
    }}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource(): DataSourceConfig {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
}