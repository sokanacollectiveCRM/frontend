'use client';
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
import { PasswordInput } from '@/common/components/form/PasswordInput';
import { SelectDropdown } from '@/common/components/form/SelectDropdown';
import { Button } from '@/common/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/common/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/common/components/ui/form';
import { Input } from '@/common/components/ui/input';
import { toast } from '@/common/hooks/toast/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { userTypes } from '../data/data';
var formSchema = z
    .object({
    firstName: z.string().min(1, { message: 'First Name is required.' }),
    lastName: z.string().min(1, { message: 'Last Name is required.' }),
    username: z.string().min(1, { message: 'Username is required.' }),
    phoneNumber: z.string().min(1, { message: 'Phone number is required.' }),
    email: z
        .string()
        .min(1, { message: 'Email is required.' })
        .email({ message: 'Email is invalid.' }),
    password: z.string().transform(function (pwd) { return pwd.trim(); }),
    role: z.string().min(1, { message: 'Role is required.' }),
    confirmPassword: z.string().transform(function (pwd) { return pwd.trim(); }),
    isEdit: z.boolean(),
})
    .superRefine(function (_a, ctx) {
    var isEdit = _a.isEdit, password = _a.password, confirmPassword = _a.confirmPassword;
    if (!isEdit || (isEdit && password !== '')) {
        if (password === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Password is required.',
                path: ['password'],
            });
        }
        if (password.length < 8) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Password must be at least 8 characters long.',
                path: ['password'],
            });
        }
        if (!password.match(/[a-z]/)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Password must contain at least one lowercase letter.',
                path: ['password'],
            });
        }
        if (!password.match(/\d/)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Password must contain at least one number.',
                path: ['password'],
            });
        }
        if (password !== confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Passwords don't match.",
                path: ['confirmPassword'],
            });
        }
    }
});
export function UsersActionDialog(_a) {
    var currentRow = _a.currentRow, open = _a.open, onOpenChange = _a.onOpenChange;
    var isEdit = !!currentRow;
    var form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit
            ? __assign(__assign({}, currentRow), { password: '', confirmPassword: '', isEdit: isEdit }) : {
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            role: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            isEdit: isEdit,
        },
    });
    var onSubmit = function (values) {
        form.reset();
        toast({
            title: 'You submitted the following values:',
            description: (_jsx("pre", { className: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4', children: _jsx("code", { className: 'text-white', children: JSON.stringify(values, null, 2) }) })),
        });
        onOpenChange(false);
    };
    var isPasswordTouched = !!form.formState.dirtyFields.password;
    return (_jsx(Dialog, { open: open, onOpenChange: function (state) {
            form.reset();
            onOpenChange(state);
        }, children: _jsxs(DialogContent, { className: 'sm:max-w-lg', children: [_jsxs(DialogHeader, { className: 'text-left', children: [_jsx(DialogTitle, { children: isEdit ? 'Edit User' : 'Add New User' }), _jsxs(DialogDescription, { children: [isEdit ? 'Update the user here. ' : 'Create new user here. ', "Click save when you're done."] })] }), _jsx("div", { className: '-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4', children: _jsx(Form, __assign({}, form, { children: _jsxs("form", { id: 'user-form', onSubmit: form.handleSubmit(onSubmit), className: 'space-y-4 p-0.5', children: [_jsx(FormField, { control: form.control, name: 'firstName', render: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(FormItem, { className: 'grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0', children: [_jsx(FormLabel, { className: 'col-span-2 text-right', children: "First Name" }), _jsx(FormControl, { children: _jsx(Input, __assign({ placeholder: 'John', className: 'col-span-4', autoComplete: 'off' }, field)) }), _jsx(FormMessage, { className: 'col-span-4 col-start-3' })] }));
                                    } }), _jsx(FormField, { control: form.control, name: 'lastName', render: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(FormItem, { className: 'grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0', children: [_jsx(FormLabel, { className: 'col-span-2 text-right', children: "Last Name" }), _jsx(FormControl, { children: _jsx(Input, __assign({ placeholder: 'Doe', className: 'col-span-4', autoComplete: 'off' }, field)) }), _jsx(FormMessage, { className: 'col-span-4 col-start-3' })] }));
                                    } }), _jsx(FormField, { control: form.control, name: 'username', render: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(FormItem, { className: 'grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0', children: [_jsx(FormLabel, { className: 'col-span-2 text-right', children: "Username" }), _jsx(FormControl, { children: _jsx(Input, __assign({ placeholder: 'john_doe', className: 'col-span-4' }, field)) }), _jsx(FormMessage, { className: 'col-span-4 col-start-3' })] }));
                                    } }), _jsx(FormField, { control: form.control, name: 'email', render: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(FormItem, { className: 'grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0', children: [_jsx(FormLabel, { className: 'col-span-2 text-right', children: "Email" }), _jsx(FormControl, { children: _jsx(Input, __assign({ placeholder: 'john.doe@gmail.com', className: 'col-span-4' }, field)) }), _jsx(FormMessage, { className: 'col-span-4 col-start-3' })] }));
                                    } }), _jsx(FormField, { control: form.control, name: 'phoneNumber', render: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(FormItem, { className: 'grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0', children: [_jsx(FormLabel, { className: 'col-span-2 text-right', children: "Phone Number" }), _jsx(FormControl, { children: _jsx(Input, __assign({ placeholder: '+123456789', className: 'col-span-4' }, field)) }), _jsx(FormMessage, { className: 'col-span-4 col-start-3' })] }));
                                    } }), _jsx(FormField, { control: form.control, name: 'role', render: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(FormItem, { className: 'grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0', children: [_jsx(FormLabel, { className: 'col-span-2 text-right', children: "Role" }), _jsx(SelectDropdown, { defaultValue: field.value, onValueChange: field.onChange, placeholder: 'Select a role', className: 'col-span-4', items: userTypes.map(function (_a) {
                                                        var label = _a.label, value = _a.value;
                                                        return ({
                                                            label: label,
                                                            value: value,
                                                        });
                                                    }) }), _jsx(FormMessage, { className: 'col-span-4 col-start-3' })] }));
                                    } }), _jsx(FormField, { control: form.control, name: 'password', render: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(FormItem, { className: 'grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0', children: [_jsx(FormLabel, { className: 'col-span-2 text-right', children: "Password" }), _jsx(FormControl, { children: _jsx(PasswordInput, __assign({ placeholder: 'e.g., S3cur3P@ssw0rd', className: 'col-span-4' }, field)) }), _jsx(FormMessage, { className: 'col-span-4 col-start-3' })] }));
                                    } }), _jsx(FormField, { control: form.control, name: 'confirmPassword', render: function (_a) {
                                        var field = _a.field;
                                        return (_jsxs(FormItem, { className: 'grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0', children: [_jsx(FormLabel, { className: 'col-span-2 text-right', children: "Confirm Password" }), _jsx(FormControl, { children: _jsx(PasswordInput, __assign({ disabled: !isPasswordTouched, placeholder: 'e.g., S3cur3P@ssw0rd', className: 'col-span-4' }, field)) }), _jsx(FormMessage, { className: 'col-span-4 col-start-3' })] }));
                                    } })] }) })) }), _jsx(DialogFooter, { children: _jsx(Button, { type: 'submit', form: 'user-form', children: "Save changes" }) })] }) }));
}
