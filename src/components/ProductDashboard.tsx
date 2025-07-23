import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Upload, Edit2, Trash2, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { Product } from "@/types/product";
import ProductEditDialog from "./ProductEditDialog";
import BulkUploadDialog from "./BulkUploadDialog";
import { useToast } from "@/hooks/use-toast";

const ProductDashboard = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: "PROD001", name: "Wireless Headphones", price: 99.99, brand: "TechBrand", availability: "In Stock" },
    { id: "PROD002", name: "Smartphone", price: 699.99, brand: "PhoneCorp", availability: "Low Stock" },
    { id: "PROD003", name: "Laptop", price: 1299.99, brand: "CompuTech", availability: "In Stock" },
    { id: "PROD004", name: "Tablet", price: 399.99, brand: "TabletCo", availability: "Out of Stock" },
    { id: "PROD005", name: "Smart Watch", price: 249.99, brand: "WearTech", availability: "In Stock" },
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => p.availability === "In Stock").length;
    const lowStock = products.filter(p => p.availability === "Low Stock").length;
    const outOfStock = products.filter(p => p.availability === "Out of Stock").length;
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);

    return { total, inStock, lowStock, outOfStock, totalValue };
  }, [products]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsEditDialogOpen(true);
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      // Update existing product
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? product : p));
      toast({
        title: "Product updated",
        description: `${product.name} has been updated successfully.`,
      });
    } else {
      // Add new product
      if (products.some(p => p.id === product.id)) {
        toast({
          title: "Product ID already exists",
          description: "Please choose a different product ID.",
          variant: "destructive"
        });
        return;
      }
      setProducts(prev => [...prev, product]);
      toast({
        title: "Product added",
        description: `${product.name} has been added successfully.`,
      });
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({
      title: "Product deleted",
      description: `${product?.name} has been deleted.`,
    });
  };

  const handleBulkUpload = (newProducts: Product[]) => {
    // Check for duplicate IDs
    const existingIds = new Set(products.map(p => p.id));
    const uniqueProducts = newProducts.filter(p => !existingIds.has(p.id));
    const duplicates = newProducts.filter(p => existingIds.has(p.id));

    if (duplicates.length > 0) {
      toast({
        title: "Duplicate products found",
        description: `${duplicates.length} products with existing IDs were skipped.`,
        variant: "destructive"
      });
    }

    setProducts(prev => [...prev, ...uniqueProducts]);
  };

  const getAvailabilityBadge = (availability: Product['availability']) => {
    const variants = {
      "In Stock": "default",
      "Low Stock": "secondary",
      "Out of Stock": "destructive"
    } as const;

    return (
      <Badge variant={variants[availability]}>
        {availability}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Dashboard</h1>
            <p className="text-muted-foreground">Manage your product inventory efficiently</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleAddProduct} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsBulkUploadOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Stock</CardTitle>
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <div className="h-2 w-2 rounded-full bg-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">{product.id}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>£{product.price.toFixed(2)}</TableCell>
                      <TableCell>{getAvailabilityBadge(product.availability)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No products found matching your search.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ProductEditDialog
        product={editingProduct}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveProduct}
      />

      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        onUpload={handleBulkUpload}
      />
    </div>
  );
};

export default ProductDashboard;