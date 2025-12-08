import { Inbox as InboxIcon } from 'lucide-react';

export default function InboxPage() {
  return (
    <div className='p-6'>
      <div className='flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg border border-gray-200'>
        <div className='text-center max-w-md mx-auto px-4'>
          <div className='mb-4'>
            <InboxIcon className='h-16 w-16 text-gray-400 mx-auto' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No notifications
          </h3>
          <p className='text-sm text-gray-500'>
            You're all caught up! There are no new notifications at this time.
          </p>
        </div>
      </div>
    </div>
  );
}
