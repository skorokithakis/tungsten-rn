import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screen } from '@/stores/screensStore';

const SCREENS_STORAGE_KEY = '@screens';

export async function saveScreens(screens: Screen[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SCREENS_STORAGE_KEY, JSON.stringify(screens));
  } catch (error) {
    console.error('Failed to save screens:', error);
  }
}

export async function loadScreens(): Promise<Screen[]> {
  try {
    const screensJson = await AsyncStorage.getItem(SCREENS_STORAGE_KEY);
    return screensJson ? JSON.parse(screensJson) : [];
  } catch (error) {
    console.error('Failed to load screens:', error);
    return [];
  }
}
