import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Upload,
  Edit2,
  Trash2,
  Package,
  TrendingUp,
  AlertTriangle,
  Download,
  ChevronUp,
  ChevronDown,
  EyeOff,
  Eye,
  Columns,
} from "lucide-react";
import { Product } from "@/types/product";
import ProductEditDialog from "./ProductEditDialog";
import BulkUploadDialog from "./BulkUploadDialog";
import { useToast } from "@/hooks/use-toast";
import asosLogo from "@/assets/asos-logo.png";

const ProductDashboard = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "PROD001",
      name: "Wireless Headphones",
      price: 99.99,
      brand: "TechBrand",
      availability: "In Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop",
    },
    {
      id: "PROD002",
      name: "Smartphone",
      price: 699.99,
      brand: "PhoneCorp",
      availability: "Low Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop",
    },
    {
      id: "PROD003",
      name: "Laptop",
      price: 1299.99,
      brand: "CompuTech",
      availability: "In Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop",
    },
    {
      id: "PROD004",
      name: "Tablet",
      price: 399.99,
      brand: "TabletCo",
      availability: "Out of Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=400&fit=crop",
    },
    {
      id: "PROD005",
      name: "Smart Watch",
      price: 249.99,
      brand: "WearTech",
      availability: "In Stock",
      imageUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [sortBy, setSortBy] = useState<keyof Product | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const columns = [
    { key: "image", label: "Image" },
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "brand", label: "Brand" },
    { key: "price", label: "Price" },
    { key: "availability", label: "Availability" },
  ];

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        let comparison = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          comparison = aVal - bVal;
        }

        return sortOrder === "desc" ? -comparison : comparison;
      });
    }

    return filtered;
  }, [products, searchTerm, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(
      (p) => p.availability === "In Stock"
    ).length;
    const lowStock = products.filter(
      (p) => p.availability === "Low Stock"
    ).length;
    const outOfStock = products.filter(
      (p) => p.availability === "Out of Stock"
    ).length;
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
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? product : p))
      );
      toast({
        title: "Product updated",
        description: `${product.name} has been updated successfully.`,
      });
    } else {
      // Add new product
      if (products.some((p) => p.id === product.id)) {
        toast({
          title: "Product ID already exists",
          description: "Please choose a different product ID.",
          variant: "destructive",
        });
        return;
      }
      setProducts((prev) => [...prev, product]);
      toast({
        title: "Product added",
        description: `${product.name} has been added successfully.`,
      });
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    toast({
      title: "Product deleted",
      description: `${product?.name} has been deleted.`,
    });
  };

  const handleBulkUpload = (newProducts: Product[]) => {
    console.log("Received products for bulk upload:", newProducts);
    // Check for duplicate IDs
    const existingIds = new Set(products.map((p) => p.id));
    const uniqueProducts = newProducts.filter((p) => !existingIds.has(p.id));
    const duplicates = newProducts.filter((p) => existingIds.has(p.id));

    console.log("Unique products to add:", uniqueProducts);
    console.log("Duplicate products found:", duplicates);

    if (duplicates.length > 0) {
      toast({
        title: "Duplicate products found",
        description: `${duplicates.length} products with existing IDs were skipped.`,
        variant: "destructive",
      });
    }

    setProducts((prev) => {
      const updated = [...prev, ...uniqueProducts];
      console.log("Updated products list:", updated);
      return updated;
    });

    if (uniqueProducts.length > 0) {
      toast({
        title: "Products added successfully",
        description: `${uniqueProducts.length} products have been added to your dashboard.`,
      });
    }
  };

  const handleSort = (column: keyof Product) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const downloadCSV = (
    productsToDownload: Product[],
    filename: string,
    description: string
  ) => {
    const csvContent = [
      ["ID", "Name", "Brand", "Price", "Availability", "Image URL"].join(","),
      ...productsToDownload.map((product) =>
        [
          product.id,
          `"${product.name}"`,
          `"${product.brand}"`,
          product.price,
          `"${product.availability}"`,
          `"${product.imageUrl || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description,
    });
  };

  const handleDownloadFiltered = () => {
    downloadCSV(
      filteredProducts,
      "products-filtered.csv",
      `Downloaded ${filteredProducts.length} filtered products as CSV file.`
    );
  };

  const handleDownloadAll = () => {
    downloadCSV(
      products,
      "products-all.csv",
      `Downloaded all ${products.length} products as CSV file.`
    );
  };

  const getSortIcon = (column: keyof Product) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const handleHideColumn = (columnKey: string) => {
    setHiddenColumns((prev) => new Set([...prev, columnKey]));
    toast({
      title: "Column hidden",
      description: `${
        columns.find((col) => col.key === columnKey)?.label
      } column has been hidden.`,
    });
  };

  const handleShowColumn = (columnKey: string) => {
    setHiddenColumns((prev) => {
      const newSet = new Set(prev);
      newSet.delete(columnKey);
      return newSet;
    });
    toast({
      title: "Column shown",
      description: `${
        columns.find((col) => col.key === columnKey)?.label
      } column is now visible.`,
    });
  };

  const isColumnHidden = (columnKey: string) => hiddenColumns.has(columnKey);

  const ImageThumbnail = ({ product }: { product: Product }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!product.imageUrl) {
      return (
        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      );
    }

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-12 h-12 object-cover rounded-md cursor-pointer"
        />
        {isHovered && (
          <div className="absolute z-50 top-14 left-0 bg-popover border rounded-lg shadow-lg p-2">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-48 h-48 object-cover rounded-md"
            />
            <p className="text-sm font-medium mt-2 text-center">
              {product.name}
            </p>
          </div>
        )}
      </div>
    );
  };

  const getAvailabilityBadge = (availability: Product["availability"]) => {
    const variants = {
      "In Stock": "default",
      "Low Stock": "secondary",
      "Out of Stock": "destructive",
    } as const;

    return <Badge variant={variants[availability]}>{availability}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src={asosLogo} alt="ASOS Logo" className="h-8 w-auto" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Product Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your product inventory efficiently
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleAddProduct}
              className="flex items-center gap-2"
            >
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDownloadFiltered}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Filtered ({filteredProducts.length} items)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDownloadAll}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download All ({products.length} items)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
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
              <div className="text-2xl font-bold text-green-600">
                {stats.inStock}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.lowStock}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Out of Stock
              </CardTitle>
              <div className="h-2 w-2 rounded-full bg-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.outOfStock}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{stats.totalValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Column Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Column Visibility Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Columns className="h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Show/Hide Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((column) => (
                  <DropdownMenuItem
                    key={column.key}
                    className="flex items-center gap-2 cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      checked={!isColumnHidden(column.key)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleShowColumn(column.key);
                        } else {
                          handleHideColumn(column.key);
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <span className="flex-1">{column.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Hidden Columns Indicators */}
            {hiddenColumns.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Hidden:</span>
                {Array.from(hiddenColumns).map((columnKey) => (
                  <Button
                    key={columnKey}
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowColumn(columnKey)}
                    className="h-7 px-2 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {columns.find((col) => col.key === columnKey)?.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
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
                    {columns.map(
                      (column) =>
                        !isColumnHidden(column.key) && (
                          <ContextMenu key={column.key}>
                            <ContextMenuTrigger asChild>
                              <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={
                                  column.key !== "image"
                                    ? () =>
                                        handleSort(column.key as keyof Product)
                                    : undefined
                                }
                              >
                                <div className="flex items-center">
                                  {column.label}
                                  {column.key !== "image" &&
                                    getSortIcon(column.key as keyof Product)}
                                </div>
                              </TableHead>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-48">
                              <ContextMenuItem
                                onClick={() => handleHideColumn(column.key)}
                                className="flex items-center gap-2"
                              >
                                <EyeOff className="h-4 w-4" />
                                Hide {column.label} Column
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        )
                    )}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      {!isColumnHidden("image") && (
                        <TableCell>
                          <ImageThumbnail product={product} />
                        </TableCell>
                      )}
                      {!isColumnHidden("id") && (
                        <TableCell className="font-mono text-sm">
                          {product.id}
                        </TableCell>
                      )}
                      {!isColumnHidden("name") && (
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                      )}
                      {!isColumnHidden("brand") && (
                        <TableCell>{product.brand}</TableCell>
                      )}
                      {!isColumnHidden("price") && (
                        <TableCell>£{product.price.toFixed(2)}</TableCell>
                      )}
                      {!isColumnHidden("availability") && (
                        <TableCell>
                          {getAvailabilityBadge(product.availability)}
                        </TableCell>
                      )}
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
