import { AddDocumentModal } from './AddDocumentModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, SortAsc, SortDesc, LogOut, User, LayoutGrid, LayoutList } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useDocuments } from '@/contexts/UseContext';

export const DocumentHeader = () => {
  const { 
    documents = [],
    categories = [],
    filters = { search: '', type: '', category: '' },
    setFilters,
    sorting = { field: 'createdAt', order: 'desc' },
    setSorting,
    filteredDocuments = [],
    isLoading = false,
    viewMode = 'grid',
    setViewMode,
  } = useDocuments() || {};
  
  const { user, logout } = useAuth();

  const handleCategoryFilter = (category: string | null) => {
    setFilters({
      ...filters,
      category: category || ''
    });
  };

  const toggleSortOrder = () => {
    const newOrder = sorting.order === 'asc' ? 'desc' : 'asc';
    console.log('Changement de tri:', { 
      currentField: sorting.field, 
      currentOrder: sorting.order, 
      newOrder 
    });
    setSorting({
      ...sorting,
      order: newOrder
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header avec utilisateur */}
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
        <div className="flex-1">
          <a href="/">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              DocManager
            </h1>
          </a>
         
          <p className="text-muted-foreground mt-1 text-sm">
            {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''} • {documents.length} total
          </p>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
          <div className="hidden sm:flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode && setViewMode('grid')}
              className="px-2"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>

            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode && setViewMode('list')}
              className="px-2"
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 text-sm sm:text-base">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.name}</span>
                <span className="sm:hidden">{user?.name?.split(' ')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Recherche et Ajouter un document */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 w-full"
            />
          </div>

          <AddDocumentModal>
            <Button variant="gradient" className="whitespace-nowrap w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Ajouter un document</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </AddDocumentModal>
        </div>

        {/* Tri et ordre */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Select 
            value={sorting.field} 
            onValueChange={(value: 'name' | 'modifiedAt' | 'createdAt' | 'size' | 'type') => {
              console.log('Changement de champ de tri:', { 
                currentField: sorting.field, 
                newField: value 
              });
              setSorting({ ...sorting, field: value });
            }}
          >
            <SelectTrigger className="w-32 sm:w-40 flex-shrink-0">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nom</SelectItem>
              <SelectItem value="modifiedAt">Modifié</SelectItem>
              <SelectItem value="createdAt">Créé</SelectItem>
              <SelectItem value="size">Taille</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="px-3 flex-shrink-0"
          >
            {sorting.order === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={!filters.category ? "default" : "secondary"}
          className="cursor-pointer transition-all hover:scale-105 text-xs sm:text-sm"
          onClick={() => handleCategoryFilter(null)}
        >
          Tous ({documents.length})
        </Badge>
        {categories.map((category) => {
          const count = documents.filter(doc => doc.category === category.id).length;
          return (
            <Badge
              key={category.id}
              variant={
                filters.category === category.id
                  ? (["default", "secondary", "destructive", "outline"].includes(category.color)
                      ? (category.color as "default" | "secondary" | "destructive" | "outline")
                      : "default")
                  : "secondary"
              }
              className="cursor-pointer transition-all hover:scale-105 text-xs sm:text-sm"
              onClick={() => handleCategoryFilter(category.id)}
            >
              {category.name} ({count})
            </Badge>
          );
        })}
      </div>
    </div>
  );
};