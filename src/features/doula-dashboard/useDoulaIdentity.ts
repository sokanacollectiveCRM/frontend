import { useEffect, useState } from 'react';
import { isDoulaRole } from '@/common/auth/roles';
import { useUser } from '@/common/hooks/user/useUser';
import { getDoulaProfile } from '@/api/doulas/doulaService';

export function useDoulaIdentity() {
  const { user } = useUser();
  const isDoula = isDoulaRole(user?.role);
  const [profile, setProfile] = useState<{
    firstname?: string;
    lastname?: string;
    profile_picture?: string | null;
  } | null>(null);

  useEffect(() => {
    let active = true;
    if (!isDoula) {
      setProfile(null);
      return () => {
        active = false;
      };
    }
    getDoulaProfile()
      .then((data) => {
        if (active && data) setProfile(data);
      })
      .catch(() => {
        if (active) setProfile(null);
      });
    return () => {
      active = false;
    };
  }, [isDoula, user?.id]);

  const name =
    isDoula && profile
      ? `${profile.firstname ?? ''} ${profile.lastname ?? ''}`.trim()
      : `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim();

  return {
    name: name || user?.email || 'User',
    profilePicture: isDoula
      ? (profile?.profile_picture ?? user?.profile_picture)
      : user?.profile_picture,
  };
}
