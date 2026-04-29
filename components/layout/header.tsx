import { ModeToggle } from '@/components/ui/mode-toggle';  
import { UserDropdown } from './user-dropdown';
import AdminSearch from '../features/admin-search';

export const Header = () => {
  return (
    <header className="flex h-14 items-center gap-4 border-b   px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex-1">
        <AdminSearch />
      </div>
      <ModeToggle />
      <UserDropdown />
    </header>
  );
};