export interface DeviceInfo {
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  browser: string;
  os: string;
}

export function parseUserAgent(ua: string): DeviceInfo {
  if (!ua || ua === 'unknown') {
    return { deviceType: 'Desktop', browser: 'Unknown Browser', os: 'Unknown OS' };
  }

  // 1. Device Type Detection
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  if (/ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/iphone|ipod|android.*mobile|windows phone|blackberry|mobile/i.test(ua)) {
    deviceType = 'Mobile';
  }

  // 2. Browser Detection
  let browser = 'Other / WebKit';
  if (/edg([ea]|ios)?\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/opr\/|opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/samsungbrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) {
    browser = deviceType === 'Mobile' ? 'Mobile Safari' : 'Apple Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Mozilla Firefox';
  }

  // 3. OS Detection
  let os = 'Other';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { deviceType, browser, os };
}
