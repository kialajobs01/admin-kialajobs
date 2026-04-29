"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { SearchModal } from "./search/search-modal";
import { useState } from "react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  search: z.string(),
});

export default function AdminSearch() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => { 
  };

  const handleItemSelect = (type: string, id: string) => {
    // Navegar para a página correspondente
    switch (type) {
      case 'user':
        router.push(`/dashboard/users/${id}`);
        break;
      case 'job':
        router.push(`/dashboard/jobs/${id}`);
        break;
      case 'payment':
        router.push(`/dashboard/transactions?payment=${id}`);
        break;
      case 'subscription':
        router.push(`/dashboard/subscriptions?subscription=${id}`);
        break;
      default:
        console.log(`Navigating to ${type} with id ${id}`);
    }
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="relative">
          <div className="w-2/3 md:w-1/3 lg:w-1/3">
            <Input
              type="search"
              placeholder="Pesquisar..."
              {...form.register("search")}
              onFocus={(e) => {
                e.preventDefault();
                setIsSearchModalOpen(true);
              }}
              onClick={(e) => {
                e.preventDefault();
                setIsSearchModalOpen(true);
              }}
              readOnly
            />
          </div>
        </div>
      </form>

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onItemSelect={handleItemSelect}
      />
    </>
  );
}
