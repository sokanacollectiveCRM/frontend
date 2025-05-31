import { useUser } from '@/common/hooks/user/useUser';

export default function Home() {
  const { user } = useUser();

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstname || 'User'}!</h1>
        <p className="text-muted-foreground">What would you like to do today?</p>
      </div>
    </div>
  );
}
