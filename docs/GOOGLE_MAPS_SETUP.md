# Google Maps API Configuration Guide

## Current Issue
The Google Maps API key is deployed but showing two errors:
1. **BillingNotEnabledMapError** - Billing not enabled
2. **REQUEST_DENIED** - Geocoding API not enabled

## Steps to Fix

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Select Your Project
Make sure you're in the correct project where the API key `AIzaSyAeEqtXFK2UsFqiA6tG3esL2fErUf-eL90` was created.

### 3. Enable Billing
1. Go to **Billing** in the left menu
2. Link a billing account (Google provides $200 free credit per month)
3. Note: Google Maps has a generous free tier (28,000 map loads per month)

### 4. Enable Required APIs
Go to **APIs & Services** > **Library** and enable:

#### Already Enabled ✓
- Maps JavaScript API

#### Need to Enable ✗
- **Geocoding API** (for address lookups)
- **Places API** (optional, for autocomplete)

### 5. Configure API Key Restrictions
Go to **APIs & Services** > **Credentials** > Click your API key

#### Application Restrictions
- Select **HTTP referrers (web sites)**
- Add these referrers:
  ```
  https://marlocookies.vercel.app/*
  https://marlocookies-*.vercel.app/*
  http://localhost:3005/*
  ```

#### API Restrictions
- Select **Restrict key**
- Enable these APIs:
  - Maps JavaScript API ✓
  - Geocoding API (ADD THIS)
  - Places API (optional)

### 6. Save and Wait
- Click **Save**
- Changes may take up to 5 minutes to propagate

### 7. Test the Map
1. Go to https://marlocookies.vercel.app/checkout
2. Select "Maldonado" as department
3. The map should now load without errors
4. You should be able to drag the marker and see the address

## Cost Estimate
With Google's free tier:
- **$200 free credit per month**
- Maps JavaScript API: $7 per 1,000 loads
- Geocoding API: $5 per 1,000 requests
- **28,000+ free map loads per month**

For a small e-commerce site, you'll likely stay within the free tier.

## Alternative Solution (If You Don't Want to Enable Billing)

If you prefer not to add billing, you can simplify the checkout by removing the map and using a manual address input. Let me know if you want to implement this fallback option.

## Current API Key
```
AIzaSyAeEqtXFK2UsFqiA6tG3esL2fErUf-eL90
```

## Environment Variable (Already Configured in Vercel)
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAeEqtXFK2UsFqiA6tG3esL2fErUf-eL90
```

## Support Links
- [Google Maps Pricing](https://mapsplatform.google.com/pricing/)
- [Enable Billing](https://console.cloud.google.com/billing)
- [API Library](https://console.cloud.google.com/apis/library)
- [Credentials](https://console.cloud.google.com/apis/credentials)
