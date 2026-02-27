import React, { useState } from 'react';
import { tokens } from '@sfds2/tokens';
import { Button } from '@sfds2/components/Button';
import { Input } from '@sfds2/components/Input';
import { useAuth } from '@sfds2/hooks/useAuth';

export const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: tokens.color.neutral1,
        fontFamily: tokens.typography.fontFamilyBase,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: tokens.spacing.spacingXXLarge,
          backgroundColor: tokens.color.neutral0,
          borderRadius: tokens.radius.radiusLarge,
          boxShadow: tokens.elevation.elevationDropdown,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: tokens.spacing.spacingXLarge }}>
          <h1
            style={{
              fontSize: tokens.typography.fontSizeXXLarge,
              fontWeight: tokens.typography.fontWeightBold,
              color: tokens.color.textDefault,
            }}
          >
            Erencio Backoffice
          </h1>
          <p
            style={{
              marginTop: tokens.spacing.spacingXSmall,
              color: tokens.color.textPlaceholder,
              fontSize: tokens.typography.fontSizeMedium,
            }}
          >
            SFDS2 Interface — Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.spacingMedium }}>
          {error && (
            <div
              style={{
                padding: tokens.spacing.spacingSmall,
                backgroundColor: tokens.color.errorLight,
                color: tokens.color.error,
                borderRadius: tokens.radius.radiusMedium,
                fontSize: tokens.typography.fontSizeSmall,
                border: `1px solid ${tokens.color.borderError}`,
              }}
            >
              {error}
            </div>
          )}
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            placeholder="you@example.com"
            required
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            placeholder="Your password"
            required
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            label="Sign in"
            type="submit"
            variant="brand"
            size="large"
            loading={loading}
            disabled={!email || !password}
          />
        </form>

        <p
          style={{
            marginTop: tokens.spacing.spacingMedium,
            textAlign: 'center',
            fontSize: tokens.typography.fontSizeSmall,
            color: tokens.color.textPlaceholder,
          }}
        >
          This is the SFDS2 interface. You can switch back to the default interface from your profile settings.
        </p>
      </div>
    </div>
  );
};
