var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SelectDropdown } from '@/common/components/form/SelectDropdown';
import { Button } from '@/common/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/common/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/common/components/ui/form';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import { toast } from '@/common/hooks/toast/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailPlus, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { userTypes } from '../data/data';
var formSchema = z.object({
    email: z
        .string()
        .min(1, { message: 'Email is required.' })
        .email({ message: 'Email is invalid.' }),
    role: z.string().min(1, { message: 'Role is required.' }),
    desc: z.string().optional(),
});
export function UsersInviteDialog(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange;
    var form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { email: '', role: '', desc: '' },
    });
    var onSubmit = function (values) {
        form.reset();
        toast({
            title: 'You submitted the following values:',
            description: (_jsx("pre", { className: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4', children: _jsx("code", { className: 'text-white', children: JSON.stringify(values, null, 2) }) })),
        });
        onOpenChange(false);
    };
    return (_jsx(Dialog, { open: open, onOpenChange: function (state) {
            form.reset();
            onOpenChange(state);
        }, children: _jsxs(DialogContent, { className: 'sm:max-w-md', children: [_jsxs(DialogHeader, { className: 'text-left', children: [_jsxs(DialogTitle, { className: 'flex items-center gap-2', children: [_jsx(MailPlus, {}), " Invite User"] }), _jsx(DialogDescription, { children: "Invite new user to join your team by sending them an email invitation. Assign a role to define their access level." })] }), _jsx(Form, __assign({}, form, { children: _jsxs("form", { id: 'user-invite-form', onSubmit: form.handleSubmit(onSubmit), className: 'space-y-4', children: [_jsx(FormField, { control: form.control, name: 'email', render: function (_a) {
                                    var field = _a.field;
                                    return (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, __assign({ type: 'email', placeholder: 'eg: john.doe@gmail.com' }, field)) }), _jsx(FormMessage, {})] }));
                                } }), _jsx(FormField, { control: form.control, name: 'role', render: function (_a) {
                                    var field = _a.field;
                                    return (_jsxs(FormItem, { className: 'space-y-1', children: [_jsx(FormLabel, { children: "Role" }), _jsx(SelectDropdown, { defaultValue: field.value, onValueChange: field.onChange, placeholder: 'Select a role', items: userTypes.map(function (_a) {
                                                    var label = _a.label, value = _a.value;
                                                    return ({
                                                        label: label,
                                                        value: value,
                                                    });
                                                }) }), _jsx(FormMessage, {})] }));
                                } }), _jsx(FormField, { control: form.control, name: 'desc', render: function (_a) {
                                    var field = _a.field;
                                    return (_jsxs(FormItem, { className: '', children: [_jsx(FormLabel, { children: "Description (optional)" }), _jsx(FormControl, { children: _jsx(Textarea, __assign({ className: 'resize-none', placeholder: 'Add a personal note to your invitation (optional)' }, field)) }), _jsx(FormMessage, {})] }));
                                } })] }) })), _jsxs(DialogFooter, { className: 'gap-y-2', children: [_jsx(DialogClose, { asChild: true, children: _jsx(Button, { variant: 'outline', children: "Cancel" }) }), _jsxs(Button, { type: 'submit', form: 'user-invite-form', children: ["Invite ", _jsx(Send, {})] })] })] }) }));
}
