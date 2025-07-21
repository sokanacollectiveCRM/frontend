import {
  StoredCard,
  deleteStoredCard,
  setDefaultCard,
} from '@/api/payments/stripe';
import { Alert, AlertDescription } from '@/common/components/ui/alert';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { Icons } from '@/features/admin-payment/icons';
import { CreditCard, Star, StarOff, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface SavedCardsProps {
  cards: StoredCard[];
  customerId: string;
  onCardDeleted: () => void;
  onCardUpdated?: () => void;
  isLoading?: boolean;
}

const brandIcons: Record<string, React.ReactNode> = {
  visa: <CreditCard className='w-8 h-8 text-blue-600' />,
  mastercard: <CreditCard className='w-8 h-8 text-red-600' />,
  amex: <CreditCard className='w-8 h-8 text-green-600' />,
  discover: <CreditCard className='w-8 h-8 text-orange-600' />,
};

const getBrandColor = (brand: string): string => {
  const colors: Record<string, string> = {
    visa: 'bg-blue-50 text-blue-700 border-blue-200',
    mastercard: 'bg-red-50 text-red-700 border-red-200',
    amex: 'bg-green-50 text-green-700 border-green-200',
    discover: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return colors[brand] || 'bg-gray-50 text-gray-700 border-gray-200';
};

export default function SavedCards({
  cards,
  customerId,
  onCardDeleted,
  onCardUpdated,
  isLoading,
}: SavedCardsProps) {
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    setDeletingCardId(cardId);

    try {
      await deleteStoredCard(customerId, cardId);
      toast.success('Payment method deleted successfully');
      onCardDeleted();
    } catch (error: any) {
      console.error('Error deleting card:', error);
      toast.error(error.message || 'Failed to delete payment method');
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleSetDefault = async (cardId: string) => {
    setSettingDefaultId(cardId);

    try {
      await setDefaultCard(customerId, cardId);
      toast.success('Default payment method updated');
      onCardUpdated?.();
    } catch (error: any) {
      console.error('Error setting default card:', error);
      toast.error(error.message || 'Failed to set default payment method');
    } finally {
      setSettingDefaultId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Payment Methods</CardTitle>
          <CardDescription>Your stored credit and debit cards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <Icons.spinner className='w-6 h-6 animate-spin' />
            <span className='ml-2'>Loading payment methods...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Payment Methods</CardTitle>
        <CardDescription>Your stored credit and debit cards</CardDescription>
      </CardHeader>
      <CardContent>
        {cards.length === 0 ? (
          <Alert>
            <CreditCard className='h-4 w-4' />
            <AlertDescription>
              No saved payment methods. Add a card above to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <div className='space-y-4'>
            {cards.map((card) => (
              <div
                key={card.id}
                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                  card.isDefault
                    ? 'bg-blue-50/30 border-blue-200 hover:bg-blue-50/50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className='flex items-center space-x-4'>
                  <div className='flex-shrink-0'>
                    {brandIcons[card.brand.toLowerCase()] || (
                      <CreditCard className='w-8 h-8 text-gray-600' />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center space-x-2'>
                      <Badge
                        variant='outline'
                        className={getBrandColor(card.brand.toLowerCase())}
                      >
                        {card.brand.toUpperCase()}
                      </Badge>
                      <span className='text-sm font-medium'>
                        •••• •••• •••• {card.last4}
                      </span>
                      {card.isDefault && (
                        <Badge
                          variant='default'
                          className='bg-blue-100 text-blue-800 border-blue-300'
                        >
                          <Star className='w-3 h-3 mr-1 fill-current' />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className='text-sm text-gray-500'>
                      Expires {card.expMonth.toString().padStart(2, '0')}/
                      {card.expYear}
                    </p>
                    <p className='text-xs text-gray-400'>
                      Added {new Date(card.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  {!card.isDefault && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleSetDefault(card.id)}
                      disabled={settingDefaultId === card.id}
                      className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      title='Set as default'
                    >
                      {settingDefaultId === card.id ? (
                        <Icons.spinner className='w-4 h-4 animate-spin' />
                      ) : (
                        <StarOff className='w-4 h-4' />
                      )}
                    </Button>
                  )}

                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDeleteCard(card.id)}
                    disabled={deletingCardId === card.id}
                    className='text-destructive hover:text-destructive/80 hover:bg-destructive/10'
                  >
                    {deletingCardId === card.id ? (
                      <Icons.spinner className='w-4 h-4 animate-spin' />
                    ) : (
                      <Trash2 className='w-4 h-4' />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
