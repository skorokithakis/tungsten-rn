import axios from 'axios';

const client = axios.create({
  timeout: 10000 // 10 seconds
});

export async function sendAutomationRequest(url: string): Promise<boolean> {
  try {
    await client.post(url);
    return true;
  } catch (error) {
    console.error('Automation request failed:', error);
    return false;
  }
}
