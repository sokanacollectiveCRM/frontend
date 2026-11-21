import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { useUser } from '@/common/hooks/user/useUser';
import { safePostLoginPath } from '@/common/auth/postLoginRedirect';
import {
  enterOrganization,
  type OrganizationChoice,
} from '@/api/organizationContext';
import { AuthFormLogo } from '@/common/components/brand/Sokana360Logo';
import { Button } from '@/common/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';

export default function ChooseOrganization() {
  const { user, loadOrganizations, selectOrganization } = useUser();
  const [choices, setChoices] = useState<OrganizationChoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [params] = useSearchParams();
  const next = safePostLoginPath(params.get('next'));

  useEffect(() => {
    let active = true;
    void loadOrganizations()
      .then((items) => {
        if (active) setChoices(items);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : 'Could not load organizations.'
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // Fetch on entry only; context callbacks change as session state updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = async (id: string) => {
    setSelected(id);
    setError('');
    try {
      await selectOrganization(id);
      enterOrganization(
        next && !next.startsWith('/choose-organization') ? next : '/'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not select this organization.'
      );
      setSelected(null);
    }
  };

  return (
    <div className='mx-auto flex min-h-dvh w-full max-w-md items-center px-4 py-10'>
      <Card className='w-full'>
        <CardHeader>
          <AuthFormLogo />
          <CardTitle className='text-2xl'>
            <h1>Choose your organization</h1>
          </CardTitle>
          <CardDescription>
            Select the organization you want to work with. Each organization has
            its own workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {loading ? (
            <p role='status' className='flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Loading organizations…
            </p>
          ) : (
            choices.map((org) => (
              <Button
                key={org.id}
                variant='outline'
                className='h-auto w-full justify-start gap-3 whitespace-normal py-4 text-left'
                disabled={selected !== null}
                onClick={() => void choose(org.id)}
              >
                {selected === org.id ? (
                  <Loader2 className='h-5 w-5 shrink-0 animate-spin' />
                ) : (
                  <Building2 className='h-5 w-5 shrink-0' />
                )}
                <span>
                  {org.name}
                  {user?.tenant?.id === org.id && (
                    <span className='ml-2 text-xs text-muted-foreground'>
                      Current
                    </span>
                  )}
                </span>
              </Button>
            ))
          )}
          {error && (
            <p role='alert' className='text-sm text-destructive'>
              {error}
            </p>
          )}
          {!loading && choices.length === 0 && (
            <Button asChild variant='outline' className='w-full'>
              <Link to='/login'>Go to sign in</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
