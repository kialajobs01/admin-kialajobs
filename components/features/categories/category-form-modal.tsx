'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Category } from './categories-table';
import { useEffect } from 'react';

const categoryFormSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    isApproved: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category | null;
    onSuccess: (category: Category, isEdit: boolean) => void;
}

export function CategoryFormModal({ open, onOpenChange, category, onSuccess }: CategoryFormModalProps) {
    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            name: category?.name || '',
            description: category?.description || '',
            isApproved: category?.isApproved || false,
        },
    });

    const isEdit = !!category;

    useEffect(() => {
        if (category) {
            form.reset({
                name: category.name,
                description: category.description,
                isApproved: category.isApproved,
            });
        } else {
            form.reset({
                name: '',
                description: '',
                isApproved: false,
            });
        }
    }, [category, form]);

    const onSubmit = async (values: CategoryFormValues) => {
        try {
            let response;

            if (isEdit) {
                response = await api.put(`/category/update/${category.id}`, values);
                toast.success(
                    `Categoria atualizada com sucesso`,
                    {
                        description: response.data.message,
                    });
            } else {
                response = await api.post('/category/create', values);
                toast.success(
                    `Categoria criada com sucesso`,
                    {
                        description: response.data.message,
                    });
            }

            onSuccess(response.data.data.category, isEdit);
            onOpenChange(false);
        } catch (error: any) {
            toast.warning(
                `Erro ao ${isEdit ? 'atualizar' : 'criar'} categoria`,
                {
                    description: error.response.data.message,
                });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Editar Categoria' : 'Nova Categoria'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nome da categoria" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Descrição da categoria" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isApproved"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Aprovado</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {isEdit ? 'Atualizar' : 'Criar'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}