import type { UserContextType } from '@/common/types/auth';
import React, { ReactNode } from 'react';
export declare const UserContext: React.Context<UserContextType>;
interface UserProviderProps {
    children: ReactNode;
}
export declare function UserProvider({ children }: UserProviderProps): React.ReactElement;
export {};
//# sourceMappingURL=UserContext.d.ts.map