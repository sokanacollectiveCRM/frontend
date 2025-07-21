import { StoredCard } from '@/api/payments/stripe';
import { Badge } from '@/common/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { CheckCircle, CreditCard, Star } from 'lucide-react';
import React from 'react';

interface CurrentPaymentMethodProps {
  card: StoredCard;
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

export default function CurrentPaymentMethod({
  card,
}: CurrentPaymentMethodProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CheckCircle className='w-5 h-5 text-green-600' />
          Current Payment Method
        </CardTitle>
        <CardDescription>
          This is your active payment method for transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center space-x-4 p-4 border rounded-lg bg-green-50/30 border-green-200'>
          <div className='flex-shrink-0'>
            {brandIcons[card.brand.toLowerCase()] || (
              <CreditCard className='w-8 h-8 text-gray-600' />
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center space-x-2 mb-1'>
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
                  className='bg-green-100 text-green-800 border-green-300'
                >
                  <Star className='w-3 h-3 mr-1 fill-current' />
                  Default
                </Badge>
              )}
            </div>
            <p className='text-sm text-gray-600'>
              Expires {card.expMonth.toString().padStart(2, '0')}/{card.expYear}
            </p>
            <div className='flex items-center justify-between mt-2'>
              <div className='flex items-center'>
                <CheckCircle className='w-4 h-4 text-green-600 mr-1' />
                <span className='text-xs text-green-700 font-medium'>
                  ACTIVE
                </span>
              </div>
              <p className='text-xs text-gray-500'>
                Added {new Date(card.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
