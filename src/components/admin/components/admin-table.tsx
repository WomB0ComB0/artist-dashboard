'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { debounce } from '@/utils';
import { api } from '@/utils/api';
import { createClient } from '@/utils/supabase/client';
import { Edit, Image, Menu, RefreshCw, Search, Trash } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ImageUpload {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  title: string;
  description: string;
  created_at: string;
}

interface FetchParams {
  page: number;
  limit: number;
  sortBy: keyof ImageUpload;
  sortDirection: 'asc' | 'desc';
  search: string;
}

const MemoizedTableRow = memo(
  ({
    item,
    selectedItems,
    handleSelect,
    handleEdit,
    handleDelete,
    handleImagePreview,
  }: {
    item: ImageUpload;
    selectedItems: Set<string>;
    handleSelect: (id: string) => void;
    handleEdit: (item: ImageUpload) => void;
    handleDelete: (id: string) => void;
    handleImagePreview: (item: ImageUpload) => void;
  }) => (
    <TableRow key={item.id}>
      <TableCell>
        <Checkbox
          checked={selectedItems.has(item.id)}
          onCheckedChange={() => handleSelect(item.id)}
        />
      </TableCell>
      <TableCell>{item.title}</TableCell>
      <TableCell className="hidden sm:table-cell">{item.file_name}</TableCell>
      <TableCell className="hidden md:table-cell">{item.description}</TableCell>
      <TableCell className="hidden lg:table-cell">
        {new Date(item.created_at).toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
          <Trash className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleImagePreview(item)}>
          <Image className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  ),
);

const MemoizedTableHeader = memo(
  ({
    handleSelectAll,
    handleSort,
    sortColumn,
    sortDirection,
    itemsLength,
    selectedItemsSize,
  }: {
    handleSelectAll: () => void;
    handleSort: (column: keyof ImageUpload) => void;
    sortColumn: keyof ImageUpload;
    sortDirection: 'asc' | 'desc';
    itemsLength: number;
    selectedItemsSize: number;
  }) => (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]">
          <Checkbox
            checked={selectedItemsSize === itemsLength && itemsLength > 0}
            onCheckedChange={handleSelectAll}
          />
        </TableHead>
        <TableHead onClick={() => handleSort('title')} className="cursor-pointer">
          Title {sortColumn === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
        </TableHead>
        <TableHead
          onClick={() => handleSort('file_name')}
          className="cursor-pointer hidden sm:table-cell"
        >
          File Name {sortColumn === 'file_name' && (sortDirection === 'asc' ? '↑' : '↓')}
        </TableHead>
        <TableHead className="hidden md:table-cell">Description</TableHead>
        <TableHead
          onClick={() => handleSort('created_at')}
          className="cursor-pointer hidden lg:table-cell"
        >
          Created At {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
        </TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  ),
);

const MemoizedSearchBar = memo(
  ({ handleSearch }: { handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="flex items-center space-x-2 w-full sm:w-auto">
      <Input placeholder="Search..." onChange={handleSearch} className="w-full sm:w-64" />
      <Button variant="outline" className="hidden sm:flex">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </div>
  ),
);

const EditItemForm = memo(
  ({ item, onSave }: { item: ImageUpload; onSave: (item: ImageUpload) => void }) => {
    const [editedItem, setEditedItem] = useState(item);

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(editedItem);
        }}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editedItem.title}
              onChange={(e) => setEditedItem({ ...editedItem, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedItem.description}
              onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="file-name">File Name</Label>
            <Input
              id="file-name"
              value={editedItem.file_name}
              onChange={(e) => setEditedItem({ ...editedItem, file_name: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-6">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    );
  },
);

const ImagePreview = memo(
  ({
    item,
    getImageUrl,
  }: { item: ImageUpload; getImageUrl: (filePath: string) => Promise<string> }) => {
    const [imageUrl, setImageUrl] = useState('/assets/svgs/placeholder.svg');

    useEffect(() => {
      const fetchImageUrl = async () => {
        const url = await getImageUrl(item.file_path);
        setImageUrl(url);
      };
      fetchImageUrl();
    }, [item.file_path, getImageUrl]);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm">{item.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm">{item.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">File Name</Label>
                  <p className="text-sm">{item.file_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">File Path</Label>
                  <p className="text-sm">{item.file_path}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created At</Label>
                  <p className="text-sm">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="aspect-square relative">
              <img
                src={imageUrl}
                alt={item.title}
                className="object-cover rounded-md"
                onError={(e) => {
                  console.error('Error loading image:', e);
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/assets/svgs/placeholder.svg';
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
);

function AdminTable() {
  const [items, setItems] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof ImageUpload>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editItem, setEditItem] = useState<ImageUpload | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const { toast } = useToast();

  const supabase = useMemo(() => createClient(), []);
  const cache = useRef<Map<string, ImageUpload[]>>(new Map());
  const urlCache = useRef<Map<string, string>>(new Map());

  async function fileExists(filePath: string): Promise<boolean> {
    const supabase = createClient();
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        return false;
      }

      const { data, error } = await supabase.storage.from('uploads').list('illustrations', {
        search: filePath,
        limit: 1,
        offset: 0,
      });

      if (error) {
        console.error('Error checking file existence:', error.message);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return false;
      }

      return data && data.length > 0;
    } catch (err) {
      console.error('Unexpected error in fileExists:', err);
      return false;
    }
  }

  const fetchItems = useCallback(async (params: FetchParams) => {
    try {
      setLoading(true);
      // @ts-ignore
      const response = await api('/api/image-uploads', {
        method: 'GET',
        query: params,
      });

      if (response.error) {
        throw response.error;
      }
      const cacheKey = JSON.stringify(params);
      setItems(response.data);
      cache.current.set(cacheKey, response.data);
      setError(null);
    } catch (err) {
      setError(`${err instanceof Error ? err.message : 'Unknown error [fetchItems]'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useMemo(
    () => debounce((params: FetchParams) => fetchItems(params), 300),
    [fetchItems],
  );

  useEffect(() => {
    debouncedFetch({
      page: currentPage,
      limit: itemsPerPage,
      sortBy: sortColumn,
      sortDirection,
      search: searchTerm,
    });
  }, [currentPage, itemsPerPage, sortColumn, sortDirection, searchTerm, debouncedFetch]);

  const handleSelect = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedItems((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((item) => item.id)),
    );
  }, [items]);

  const handleEdit = useCallback((item: ImageUpload) => {
    setEditItem(item);
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateImage = useCallback(
    async (updatedItem: ImageUpload) => {
      try {
        const response = await api('/api/image-uploads/:id', {
          method: 'PUT',
          params: { id: updatedItem.id },
          body: updatedItem,
        });

        if (response.error) {
          throw response.error;
        }

        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
          ),
        );
        setEditItem(null);
        setIsEditDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Image updated successfully.',
        });
      } catch (err) {
        console.error('Error updating image:', err);
        toast({
          title: 'Error',
          description: 'Failed to update image. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const response = await api('/api/image-uploads/:id', {
          method: 'DELETE',
          params: { id },
        });

        if (response.error) {
          throw response.error;
        }

        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
        toast({
          title: 'Success',
          description: 'Image deleted successfully.',
        });
      } catch (err) {
        console.error('Error deleting image:', err);
        toast({
          title: 'Error',
          description: 'Failed to delete image. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [toast],
  );

  const handleDeleteSelected = useCallback(async () => {
    try {
      // @ts-ignore
      const response = await api('/api/image-uploads', {
        method: 'DELETE',
        body: Array.from(selectedItems),
      });

      if (response.error) {
        throw response.error;
      }

      setItems((prevItems) => prevItems.filter((item) => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      toast({
        title: 'Success',
        description: `${selectedItems.size} items deleted successfully.`,
      });
    } catch (err) {
      console.error('Error deleting selected images:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete selected images. Please try again.',
        variant: 'destructive',
      });
    }
  }, [selectedItems, toast]);

  const handleSort = useCallback((column: keyof ImageUpload) => {
    setSortColumn((prev) => {
      if (prev === column) {
        setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortDirection('asc');
      }
      return column;
    });
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.file_name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [items, searchTerm],
  );

  const getImageUrl = useCallback(
    async (filePath: string) => {
      if (!filePath) {
        console.warn('Empty file path provided');
        return '/assets/svgs/placeholder.svg';
      }

      const cleanPath = filePath.replace(/^uploads\//, '').replace(/^illustrations\//, '');

      try {
        const exists = await fileExists(cleanPath);
        if (!exists) {
          console.warn(`File does not exist: ${cleanPath}`);
          return '/assets/svgs/placeholder.svg';
        }

        const uniqueKey = `${filePath}_${Date.now()}`;

        const { data, error } = await supabase.storage
          .from('uploads')
          .createSignedUrl(`illustrations/${cleanPath}`, 60 * 60, {
            transform: {
              width: 800,
              height: 600,
              resize: 'contain',
            },
          });

        if (error) {
          console.error('Error generating signed URL:', error.message);
          return '/assets/svgs/placeholder.svg';
        }

        if (!data || !data.signedUrl) {
          console.error('No signed URL returned from Supabase');
          return '/assets/svgs/placeholder.svg';
        }

        // Add a cache-busting query parameter
        const cacheBustedUrl = `${data.signedUrl}&_cb=${Date.now()}`;

        urlCache.current.set(uniqueKey, cacheBustedUrl);
        return cacheBustedUrl;
      } catch (err) {
        console.error('Unexpected error in getImageUrl:', err);
        return '/assets/svgs/placeholder.svg';
      }
    },
    [supabase],
  );

  const handleImagePreview = useCallback((item: ImageUpload) => {
    setEditItem(item);
    setIsImagePreviewOpen(true);
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <MemoizedSearchBar handleSearch={handleSearch} />
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
          {selectedItems.size > 0 && (
            <Button
              onClick={handleDeleteSelected}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete ({selectedItems.size})
            </Button>
          )}
          <Button
            onClick={() => {
              cache.current.clear();
              debouncedFetch({
                page: currentPage,
                limit: itemsPerPage,
                sortBy: sortColumn,
                sortDirection,
                search: searchTerm,
              });
            }}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            className="sm:hidden"
            variant="outline"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Card className="bg-white rounded-lg shadow">
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)] w-full">
            <Table>
              <MemoizedTableHeader
                handleSelectAll={handleSelectAll}
                handleSort={handleSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                itemsLength={items.length}
                selectedItemsSize={selectedItems.size}
              />
              <TableBody>
                {loading
                  ? Array.from({ length: itemsPerPage }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={6}>
                          <Skeleton className="h-12 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : filteredItems.map((item) => (
                      <MemoizedTableRow
                        key={item.id}
                        item={item}
                        selectedItems={selectedItems}
                        handleSelect={handleSelect}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleImagePreview={handleImagePreview}
                      />
                    ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => setItemsPerPage(Number(value))}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(items.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />
      </div>

      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => {
                handleDeleteSelected();
                setIsMobileMenuOpen(false);
              }}
              variant="destructive"
              className="w-full"
              disabled={selectedItems.size === 0}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Selected ({selectedItems.size})
            </Button>
            <Button
              onClick={() => {
                cache.current.clear();
                debouncedFetch({
                  page: currentPage,
                  limit: itemsPerPage,
                  sortBy: sortColumn,
                  sortDirection,
                  search: searchTerm,
                });
                setIsMobileMenuOpen(false);
              }}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {editItem && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Image Upload</DialogTitle>
            </DialogHeader>
            <EditItemForm item={editItem} onSave={handleUpdateImage} />
          </DialogContent>
        </Dialog>
      )}
      {editItem && (
        <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
          <DialogContent className="sm:max-w-[725px]">
            <DialogHeader>
              <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
            <ImagePreview item={editItem} getImageUrl={getImageUrl} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default memo(AdminTable);
