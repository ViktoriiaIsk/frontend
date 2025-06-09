'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PaymentService } from '@/lib/services/payment';
import { useState } from 'react';
import { Copy, CreditCard, AlertTriangle, Shield } from 'lucide-react';

interface TestCardInfoProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export function TestCardInfo({ isVisible = false, onToggle }: TestCardInfoProps) {
  const [copiedCard, setCopiedCard] = useState<string | null>(null);
  const testCards = PaymentService.getTestCards();

  const copyToClipboard = async (text: string, cardType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCard(cardType);
      setTimeout(() => setCopiedCard(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (!isVisible) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={onToggle}
        className="mb-4"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        Show Test Cards
      </Button>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Test Credit Cards</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-neutral-600 hover:text-neutral-900"
        >
          Hide
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Success Cards */}
        <Card className="border-green-200 bg-green-50" padding="md">
          <Card.Header className="pb-3">
            <Card.Title className="text-sm font-medium text-green-800 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Successful Cards
            </Card.Title>
          </Card.Header>
          <Card.Content className="space-y-3">
            {Object.entries(testCards.success).map(([key, value]) => {
              if (key === 'description') return null;
              return (
                <div key={key} className="space-y-1">
                  <div className="text-xs font-medium text-green-700 capitalize">
                    {key === 'visaDebit' ? 'Visa Debit' : key}
                  </div>
                  <div className="flex items-center justify-between bg-white rounded p-2 border border-green-200">
                    <code className="text-xs font-mono text-green-800">{value}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(value as string, key)}
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  {copiedCard === key && (
                    <div className="text-xs text-green-600">Copied!</div>
                  )}
                </div>
              );
            })}
          </Card.Content>
        </Card>

        {/* Decline Cards */}
        <Card className="border-red-200 bg-red-50" padding="md">
          <Card.Header className="pb-3">
            <Card.Title className="text-sm font-medium text-red-800 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Decline Cards
            </Card.Title>
          </Card.Header>
          <Card.Content className="space-y-3">
            {Object.entries(testCards.decline).map(([key, value]) => {
              if (key === 'description') return null;
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return (
                <div key={key} className="space-y-1">
                  <div className="text-xs font-medium text-red-700">
                    {label}
                  </div>
                  <div className="flex items-center justify-between bg-white rounded p-2 border border-red-200">
                    <code className="text-xs font-mono text-red-800">{value}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(value as string, key)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  {copiedCard === key && (
                    <div className="text-xs text-red-600">Copied!</div>
                  )}
                </div>
              );
            })}
          </Card.Content>
        </Card>

        {/* Auth Required Cards */}
        <Card className="border-blue-200 bg-blue-50" padding="md">
          <Card.Header className="pb-3">
            <Card.Title className="text-sm font-medium text-blue-800 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Auth Required
            </Card.Title>
          </Card.Header>
          <Card.Content className="space-y-3">
            <div className="space-y-1">
              <div className="text-xs font-medium text-blue-700">3D Secure</div>
              <div className="flex items-center justify-between bg-white rounded p-2 border border-blue-200">
                <code className="text-xs font-mono text-blue-800">{testCards.auth.requireAuth}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(testCards.auth.requireAuth, 'auth')}
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              {copiedCard === 'auth' && (
                <div className="text-xs text-blue-600">Copied!</div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card className="border-neutral-200 bg-neutral-50" padding="md">
        <Card.Content className="pt-4">
          <div className="text-sm text-neutral-700">
            <strong>Important:</strong> {testCards.info}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
} 