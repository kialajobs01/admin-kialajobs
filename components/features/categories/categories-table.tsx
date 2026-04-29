'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CategoryFormModal } from './category-form-modal';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export type Category = {
    id: number;
    name: string;
    description: string;
    isApproved: boolean;
    createdAt: string;
};

interface CategoriesTableProps {
    categories: Category[];
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    setCategories: (categories: Category[]) => void;
}

export function CategoriesTable({ 
    categories, 
    isModalOpen, 
    setIsModalOpen,
    setCategories 
}: CategoriesTableProps) {
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

    const handleEdit = (category: Category) => {
        setCurrentCategory(category);
        setIsModalOpen(true);
    };

    const handleNewCategory = () => {
        setCurrentCategory(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setCategoryToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await api.delete(`/category/delete/${categoryToDelete}`);
            setCategories(categories.filter(cat => cat.id !== categoryToDelete));
            toast.success('Categoria deletada com sucesso');
        } catch (error) {
            toast.error('Erro ao deletar categoria');
        } finally {
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    const handleSuccess = (newCategory: Category, isEdit: boolean) => {
        if (isEdit) {
            setCategories(categories.map(cat =>
                cat.id === newCategory.id ? newCategory : cat
            ));
        } else {
            setCategories([newCategory, ...categories]);
        }
        setIsModalOpen(false);
        setCurrentCategory(null);
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.description}</TableCell>
                            <TableCell>
                                <Badge variant={category.isApproved ? 'default' : 'outline'}>
                                    {category.isApproved ? 'Aprovado' : 'Pendente'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {new Date(category.createdAt).toLocaleDateString('pt')}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleEdit(category)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDeleteClick(category.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <CategoryFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                category={currentCategory}
                onSuccess={handleSuccess}
            />

            <DeleteConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={confirmDelete}
                title="Deletar Categoria"
                message="Tem certeza que deseja deletar esta categoria?"
            />
        </>
    );
}