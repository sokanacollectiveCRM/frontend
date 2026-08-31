import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import { CheckCircle, Mail, MessageCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function ContractSignedPage() {
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get('contract_id');
  const serviceType = searchParams.get('service_type') || 'contract';

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='w-full max-w-2xl'>
        <Card className='border-0 shadow-xl'>
          <CardHeader className='pb-4 text-center'>
            <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100'>
              <CheckCircle className='h-12 w-12 text-green-600' />
            </div>

            <CardTitle className='mb-2 text-3xl font-bold text-gray-900'>
              Contract Successfully Signed
            </CardTitle>
            <p className='text-lg text-gray-600'>
              Your {serviceType} has been signed and is now active.
            </p>
          </CardHeader>

          <CardContent className='space-y-6'>
            {contractId && (
              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-2 flex items-center font-semibold text-gray-900'>
                  <Mail className='mr-2 h-4 w-4' />
                  Contract Details
                </h3>
                <p className='text-sm text-gray-600'>
                  Contract ID:{' '}
                  <span className='rounded bg-gray-200 px-2 py-1 font-mono'>
                    {contractId}
                  </span>
                </p>
              </div>
            )}

            <div className='rounded-lg bg-blue-50 p-6'>
              <h3 className='mb-4 font-semibold text-blue-900'>
                What happens next
              </h3>
              <ul className='space-y-3 text-left text-blue-800'>
                <li className='flex items-start'>
                  <div className='mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600' />
                  <span>
                    A copy of your signed contract has been emailed to you as a
                    PDF attachment. You can download it directly from that
                    message.
                  </span>
                </li>
                <li className='flex items-start'>
                  <div className='mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600' />
                  <span>
                    Sokana has also been notified that your contract is
                    complete.
                  </span>
                </li>
                <li className='flex items-start'>
                  <div className='mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600' />
                  <span>
                    If you have any questions, contact us and we will help with
                    next steps.
                  </span>
                </li>
              </ul>
            </div>

            <div className='flex justify-center pt-4'>
              <Button
                onClick={() =>
                  window.open('mailto:info@sokanacollective.com', '_blank')
                }
                variant='outline'
                className='rounded-lg border-gray-300 px-8 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50'
              >
                <MessageCircle className='mr-2 h-4 w-4' />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
