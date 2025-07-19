import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  SortAsc,
  SortDesc,
  Video,
  Headphones,
  X
} from 'lucide-react';
import GalleryItem, { GalleryItemData } from './gallery-item';

interface GalleryGridProps {
  items: GalleryItemData[];
  onPreviewItem?: (item: GalleryItemData) => void;
}

type SortOption = 'date' | 'title' | 'duration' | 'size';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'video' | 'audio' | 'completed' | 'processing' | 'failed';
type ViewMode = 'grid' | 'list';

export default function GalleryGrid({ items, onPreviewItem }: GalleryGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort items
  const filteredAndSortedItems = items
    .filter(item => {
      // Search filter
      const searchMatch = !searchTerm || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Type/status filter
      const typeMatch = filter === 'all' || 
        filter === item.format || 
        filter === item.status;

      return searchMatch && typeMatch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'duration':
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
        case 'size':
          comparison = (a.fileSize || 0) - (b.fileSize || 0);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
  };

  const getFilterCount = (filterType: FilterType) => {
    if (filterType === 'all') return items.length;
    return items.filter(item => 
      filterType === item.format || filterType === item.status
    ).length;
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search your content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Toggle */}
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
          {/* Format/Status Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Filter by Type</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', icon: null },
                { key: 'video', label: 'Videos', icon: Video },
                { key: 'audio', label: 'Podcasts', icon: Headphones },
                { key: 'completed', label: 'Completed', icon: null },
                { key: 'processing', label: 'Processing', icon: null },
                { key: 'failed', label: 'Failed', icon: null }
              ].map(({ key, label, icon: Icon }) => (
                <Badge
                  key={key}
                  variant={filter === key ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    filter === key 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                  }`}
                  onClick={() => setFilter(key as FilterType)}
                >
                  {Icon && <Icon className="w-3 h-3 mr-1" />}
                  {label} ({getFilterCount(key as FilterType)})
                </Badge>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Sort by</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'date', label: 'Date Created' },
                { key: 'title', label: 'Title' },
                { key: 'duration', label: 'Duration' },
                { key: 'size', label: 'File Size' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={sortBy === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleSort(key as SortOption)}
                  className={`${
                    sortBy === key 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  {label}
                  {sortBy === key && (
                    sortDirection === 'asc' ? 
                      <SortAsc className="w-3 h-3 ml-1" /> : 
                      <SortDesc className="w-3 h-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          {filteredAndSortedItems.length} of {items.length} items
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        {filter !== 'all' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter('all')}
            className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 text-xs"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Content Grid/List */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-800/50 rounded-lg p-8">
            <h3 className="text-lg font-medium text-gray-300 mb-2">No content found</h3>
            <p className="text-gray-500 text-sm">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Generate your first piece of content to get started'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
            : 'space-y-4'
        } w-full`}>
          {filteredAndSortedItems.map((item) => (
            <GalleryItem
              key={item.id}
              item={item}
              onPreview={onPreviewItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}