'use client';

export const dynamic = 'force-dynamic'


import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CategoriesTable } from '@/components/features/categories/categories-table';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Category } from '@/components/features/categories/categories-table';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/category');
        setCategories(response.data.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleNewCategory = () => {
    setIsModalOpen(true);
  };

  return (
    <div className=" ">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Categorias</h1>
            <Button onClick={handleNewCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <CategoriesTable 
              categories={categories} 
              isModalOpen={isModalOpen} 
              setIsModalOpen={setIsModalOpen}
              setCategories={setCategories}
            />
          </div>
        </main>
      </div>
  );
}