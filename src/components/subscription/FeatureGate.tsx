import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionTier, hasFeatureAccess, FEATURE_REQUIREMENTS } from '@/config/subscription';
import UpgradePrompt from './UpgradePrompt';

interface FeatureGateProps {
  children: ReactNode;
  feature: keyof typeof FEATURE_REQUIREMENTS;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

const FeatureGate = ({
  children,
  feature,
  fallback,
  showUpgradePrompt = true,
}: FeatureGateProps) => {
  const { user, profile } = useAuth();

  // Get user's current tier from profile or default to free
  const userTier: SubscriptionTier = (profile?.subscription_tier as SubscriptionTier) || 'free';
  const requiredTier = FEATURE_REQUIREMENTS[feature];

  // Check if user has access
  const hasAccess = hasFeatureAccess(userTier, requiredTier);

  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return <UpgradePrompt requiredTier={requiredTier} feature={feature} />;
  }

  return null;
};

export default FeatureGate;
