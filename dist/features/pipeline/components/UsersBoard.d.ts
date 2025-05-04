import { UserStatus, UserSummary } from '../data/schema';
type Props = {
    usersByStatus: Record<UserStatus, UserSummary[]>;
    onStatusChange: (userId: string, newStatus: UserStatus) => void;
};
export declare function UsersBoard({ usersByStatus, onStatusChange }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=UsersBoard.d.ts.map