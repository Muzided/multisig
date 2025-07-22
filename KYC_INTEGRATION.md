# KYC Integration with Sumsub

This document explains how to use the KYC (Know Your Customer) integration system built with Sumsub Web SDK.

## Overview

The KYC system provides:
- **Mandatory KYC checks** based on global configuration
- **Non-disruptive UI/UX** - KYC modals don't block the entire application
- **Automatic KYC status management** 
- **Flexible integration** with existing components

## Configuration

### Global KYC Setting

In `src/Web3/web3-config.ts`:
```typescript
export const kyc_status = false; // Set to true to enable mandatory KYC
```

### User KYC Status

The user interface includes a KYC status field:
```typescript
export interface User {
  id: string;
  email: string;
  kyc_status: boolean; // User's KYC verification status
  wallet_address: string;
}
```

## How It Works

### KYC Requirement Logic

KYC is **mandatory** when:
- `kyc_status` (global config) = `true` 
- `user.kyc_status` = `false`

### Non-Disruptive Flow

1. **App loads normally** - users can see and interact with the UI
2. **KYC check runs in background** - determines if KYC is required
3. **Modal appears if needed** - overlays current content without blocking
4. **User completes KYC** - can continue using the app
5. **Status updates automatically** - KYC status reflects in real-time

## Components

### 1. useKYC Hook

The main hook that manages KYC state and logic:

```typescript
import { useKYC } from '@/Hooks/useKYC';

const {
  isKYCMandatory,
  isKYCRequired,
  isKYCModalOpen,
  isKYCLoading,
  kycStatus,
  error,
  openKYCModal,
  closeKYCModal,
  checkKYCRequirement,
  refreshKYCStatus,
} = useKYC();
```

**States:**
- `isKYCMandatory`: Whether KYC is globally required
- `isKYCRequired`: Whether current user needs KYC
- `kycStatus`: 'pending' | 'approved' | 'rejected' | 'not_started'
- `error`: Any KYC-related errors

### 2. KYCModal Component

The modal that contains the Sumsub verification interface:

```typescript
import { KYCModal } from '@/components/Global/kyc-modal';

<KYCModal
  isOpen={isKYCModalOpen}
  onClose={handleClose}
  isMandatory={isKYCMandatory}
/>
```

### 3. KYCProvider Component

Wraps the app and handles mandatory KYC checks:

```typescript
import { KYCProvider } from '@/components/Global/kyc-provider';

// In your layout
<KYCProvider>
  <YourApp />
</KYCProvider>
```

### 4. KYCStatusIndicator Component

Shows current KYC status with optional action button:

```typescript
import { KYCStatusIndicator } from '@/components/Global/kyc-status-indicator';

// Show status only
<KYCStatusIndicator showButton={false} />

// Show status with verification button
<KYCStatusIndicator showButton={true} />
```

### 5. WithKYCProtection Component

Protects specific routes/components that require KYC:

```typescript
import { WithKYCProtection } from '@/components/Global/with-kyc-protection';

// Protect a component
<WithKYCProtection requireKYC={true}>
  <ProtectedComponent />
</WithKYCProtection>

// Or use as HOC
const ProtectedComponent = withKYCProtection(MyComponent, true);
```

## Integration Examples

### 1. Add KYC Status to Header

```typescript
// In your header component
import { KYCStatusIndicator } from '@/components/Global/kyc-status-indicator';

<div className="flex items-center gap-2">
  <KYCStatusIndicator showButton={false} className="hidden md:flex" />
  <ThemeToggle />
</div>
```

### 2. Protect a Dashboard Page

```typescript
// In your dashboard page
import { WithKYCProtection } from '@/components/Global/with-kyc-protection';

export default function DashboardPage() {
  return (
    <WithKYCProtection requireKYC={true}>
      <div>
        {/* Your dashboard content */}
      </div>
    </WithKYCProtection>
  );
}
```

### 3. Custom KYC Button

```typescript
import { useKYC } from '@/Hooks/useKYC';

function CustomKYCButton() {
  const { openKYCModal, kycStatus } = useKYC();

  if (kycStatus === 'approved') {
    return <Badge>KYC Verified ✓</Badge>;
  }

  return (
    <Button onClick={openKYCModal}>
      Complete KYC Verification
    </Button>
  );
}
```

## Backend API Requirements

The KYC system expects these API endpoints:

### 1. Generate Access Token
```
POST /api/kyc/access-token
Authorization: Bearer <token>
Body: {
  userId: string,
  walletAddress: string
}
Response: {
  accessToken: string
}
```

### 2. Update KYC Status
```
PUT /api/user/update-kyc
Authorization: Bearer <token>
Body: {
  kyc_status: boolean
}
```

### 3. Get KYC Status
```
GET /api/user/kyc-status
Authorization: Bearer <token>
Response: {
  kyc_status: boolean
}
```

## Sumsub Configuration

### 1. SDK Loading

The SDK is automatically loaded from:
```
https://static.sumsub.com/idensic/static/sns-websdk-builder.js
```

### 2. Container Setup

The modal provides a container with ID `sumsub-container` for the SDK to mount.

### 3. Event Handling

The hook handles these Sumsub events:
- `idCheck.onApproved` - KYC approved
- `idCheck.onRejected` - KYC rejected  
- `idCheck.onError` - KYC error
- `idCheck.onApplicantLoaded` - Applicant loaded

## Styling

The KYC components use your existing design system:
- Primary color: `#BB7333`
- Hover color: `#965C29`
- Consistent with your existing UI components

## Error Handling

The system handles various error scenarios:
- SDK loading failures
- Network errors
- Token expiration
- Invalid responses

Errors are displayed in the modal and logged to console.

## Testing

### Enable KYC Testing

1. Set `kyc_status = true` in `web3-config.ts`
2. Ensure user has `kyc_status = false`
3. The mandatory KYC modal should appear

### Disable KYC Testing

1. Set `kyc_status = false` in `web3-config.ts`
2. KYC will be optional regardless of user status

## Best Practices

1. **Always wrap your app** with `KYCProvider`
2. **Use the hook** for KYC state management
3. **Handle loading states** appropriately
4. **Provide clear user feedback** for KYC status
5. **Test both mandatory and optional flows**

## Troubleshooting

### KYC Modal Not Appearing
- Check if `kyc_status` is set correctly
- Verify user authentication
- Check browser console for errors

### SDK Loading Issues
- Ensure internet connection
- Check if Sumsub domain is accessible
- Verify script loading in network tab

### API Errors
- Check authentication tokens
- Verify API endpoints are implemented
- Review network requests in dev tools 