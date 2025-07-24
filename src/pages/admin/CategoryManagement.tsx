import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit3, Trash2, FolderTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockCategories = [
  { id: 1, name: "Action", slug: "action", description: "Fast-paced action games", gameCount: 15, icon: "⚡" },
  { id: 2, name: "Puzzle", slug: "puzzle", description: "Brain-teasing puzzle games", gameCount: 12, icon: "🧩" },
  { id: 3, name: "Racing", slug: "racing", description: "High-speed racing games", gameCount: 8, icon: "🏎️" },
  { id: 4, name: "Adventure", slug: "adventure", description: "Epic adventure games", gameCount: 7, icon: "🗺️" },
  { id: 5, name: "Arcade", slug: "arcade", description: "Classic arcade games", gameCount: 5, icon: "🕹️" }
];

const CategoryManagement = () => {
  const [categories, setCategories] = useState(mockCategories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: ""
  });

  const handleAddCategory = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCategory = {
        id: categories.length + 1,
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        icon: formData.icon || "📁",
        gameCount: 0
      };

      setCategories([...categories, newCategory]);
      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: "Category added successfully",
        description: `${formData.name} category has been created.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { 
              ...cat, 
              name: formData.name,
              slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
              description: formData.description,
              icon: formData.icon || cat.icon
            }
          : cat
      ));
      
      setEditingCategory(null);
      resetForm();
      
      toast({
        title: "Category updated successfully",
        description: `${formData.name} has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCategories(categories.filter(cat => cat.id !== categoryId));
      
      toast({
        title: "Category deleted",
        description: "The category has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: ""
    });
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Category Management</h1>
          <p className="text-muted-foreground">
            Organize your games into categories for better navigation.
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <CategoryDialog 
            isEdit={false}
            formData={formData}
            setFormData={setFormData}
            onSave={handleAddCategory}
            isLoading={isLoading}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{categories.length}</div>
            <p className="text-sm text-muted-foreground">Total Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {categories.reduce((sum, cat) => sum + cat.gameCount, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Games</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {Math.round(categories.reduce((sum, cat) => sum + cat.gameCount, 0) / categories.length)}
            </div>
            <p className="text-sm text-muted-foreground">Avg Games per Category</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderTree className="h-5 w-5 mr-2" />
            Categories ({categories.length})
          </CardTitle>
          <CardDescription>
            Manage game categories and their properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Games</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.gameCount} games</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {category.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog open={editingCategory?.id === category.id} onOpenChange={(open) => {
                        if (!open) setEditingCategory(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(category)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <CategoryDialog 
                          isEdit={true}
                          formData={formData}
                          setFormData={setFormData}
                          onSave={handleEditCategory}
                          isLoading={isLoading}
                        />
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{category.name}"? This action cannot be undone.
                              Games in this category will be uncategorized.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const CategoryDialog = ({ isEdit, formData, setFormData, onSave, isLoading }: any) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Category" : "Add New Category"}</DialogTitle>
        <DialogDescription>
          {isEdit ? "Update category information" : "Create a new game category"}
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter category name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Category description"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="icon">Icon (Emoji)</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({...formData, icon: e.target.value})}
            placeholder="🎮"
            maxLength={2}
          />
          <p className="text-xs text-muted-foreground">
            Choose an emoji to represent this category
          </p>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? "Saving..." : (isEdit ? "Update Category" : "Add Category")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default CategoryManagement;