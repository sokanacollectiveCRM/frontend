import { UserContext } from '@/common/contexts/UserContext';
import { useContext } from 'react';
export var useUser = function () {
    var context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
