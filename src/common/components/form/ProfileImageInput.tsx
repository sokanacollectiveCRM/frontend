import UserAvatar from '@/common/components/user/UserAvatar';
import { cn } from '@/lib/utils';
import { Camera, ImagePlus, Loader2 } from 'lucide-react';
import * as React from 'react';

const DEFAULT_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp';

export type ProfileImageInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> & {
  selectedFile?: File | null;
  currentImageUrl?: string | null;
  fullName?: string;
  isUploading?: boolean;
  showAvatar?: boolean;
  onFileChange: (file: File | undefined) => void;
};

export const ProfileImageInput = React.forwardRef<
  HTMLInputElement,
  ProfileImageInputProps
>(function ProfileImageInput(
  {
    id,
    accept = DEFAULT_ACCEPT,
    disabled,
    selectedFile,
    currentImageUrl,
    fullName = '',
    isUploading = false,
    showAvatar = false,
    onFileChange,
    className,
    ...inputProps
  },
  ref
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const isDisabled = Boolean(disabled || isUploading);
  const hasExistingPhoto = Boolean(currentImageUrl);
  const actionLabel = isUploading
    ? 'Uploading...'
    : hasExistingPhoto || selectedFile
      ? 'Change photo'
      : 'Click to upload photo';

  const setInputRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onFileChange(file || undefined);
    event.target.value = '';
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        showAvatar ? 'w-fit' : 'w-full',
        className
      )}
    >
      {showAvatar ? (
        <label
          htmlFor={inputId}
          className={cn(
            'relative flex w-fit flex-col items-center gap-2 group',
            isDisabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'
          )}
        >
          <div className='relative rounded-full ring-2 ring-border group-hover:ring-primary transition-all'>
            <UserAvatar
              fullName={fullName}
              className='h-24 w-24'
              profile_picture={currentImageUrl || undefined}
            />
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center rounded-full transition-colors',
                isUploading
                  ? 'bg-black/50'
                  : hasExistingPhoto || selectedFile
                    ? 'bg-transparent group-hover:bg-black/50'
                    : 'bg-black/30 group-hover:bg-black/40'
              )}
            >
              {isUploading ? (
                <Loader2 className='h-8 w-8 animate-spin text-white' />
              ) : (
                <Camera
                  className={cn(
                    'h-8 w-8 text-white',
                    hasExistingPhoto || selectedFile
                      ? 'opacity-0 group-hover:opacity-100'
                      : 'opacity-100'
                  )}
                />
              )}
            </div>
          </div>
          <span className='text-sm font-medium text-primary group-hover:underline'>
            {actionLabel}
          </span>
        </label>
      ) : null}

      <label
        htmlFor={inputId}
        className={cn(
          'flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-input bg-background px-3 py-2 text-left shadow-xs transition-colors',
          showAvatar ? 'w-fit max-w-xs' : 'w-full',
          'hover:border-primary hover:bg-accent/50',
          'has-[:focus-visible]:border-ring has-[:focus-visible]:ring-ring/50 has-[:focus-visible]:ring-[3px]',
          isDisabled && 'pointer-events-none cursor-not-allowed opacity-50'
        )}
      >
        <span className='inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs'>
          {isUploading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <ImagePlus className='h-4 w-4' />
          )}
          {isUploading ? 'Uploading...' : 'Choose photo'}
        </span>
        <span className='min-w-0 text-sm text-muted-foreground'>
          {isUploading
            ? 'Uploading photo...'
            : selectedFile
              ? selectedFile.name
              : 'No file chosen — JPEG, PNG, or WebP'}
        </span>
        <input
          {...inputProps}
          ref={setInputRef}
          id={inputId}
          type='file'
          accept={accept}
          disabled={isDisabled}
          onChange={handleChange}
          className='sr-only'
        />
      </label>
    </div>
  );
});
