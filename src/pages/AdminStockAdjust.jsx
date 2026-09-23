
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, PackagePlus, PackageMinus } from 'lucide-react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import { createPageUrl } from '@/utils';
import MediaUploader from '../components/admin/MediaUploader';

// Mock data
const mockProduct = {
    id: '1',
    title: 'Genesis Hoodie',
    sku: 'GEN-HOOD-001',
    media: [
        { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', type: 'image' },
    ],
    variants: [
        { id: 'v1', title: 'M / Black', sku: 'GEN-H-BLK-M', inventory: { 'Main Warehouse': 50, 'NYC Store': 10 }, threshold: 5 },
        { id: 'v2', title: 'L / Black', sku: 'GEN-H-BLK-L', inventory: { 'Main Warehouse': 75, 'NYC Store': 15 }, threshold: 5 },
    ],
    locations: ['Main Warehouse', 'NYC Store']
};

function StockAdjustContent() {
    const location = useLocation();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const productId = params.get('id');
        if (productId) {
            // In a real app, fetch product data
            setProduct(mockProduct);
        }
    }, [location]);

    if (!product) {
        return <AdminLayout><div>Loading...</div></AdminLayout>;
    }

    return (
        <AdminLayout currentPage="products">
            <div className="flex items-center gap-4 mb-6">
                <Link to={createPageUrl('AdminInventory')}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Adjust Stock</h1>
                    <p className="text-gray-500">Manage inventory levels for: {product.title}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{product.title}</CardTitle>
                            <CardDescription>SKU: {product.sku}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <img src={product.media[0].url} alt={product.title} className="rounded-lg w-full object-cover aspect-square" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Manage Media</CardTitle></CardHeader>
                        <CardContent>
                            <MediaUploader files={product.media} onFilesChange={() => {}} />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Locations</CardTitle>
                            <CardDescription>Set stock quantities for each location.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Variant</TableHead>
                                        {product.locations.map(loc => (
                                            <TableHead key={loc} className="text-center">{loc}</TableHead>
                                        ))}
                                        <TableHead className="text-center">Threshold</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {product.variants.map(variant => (
                                        <TableRow key={variant.id}>
                                            <TableCell>
                                                <p className="font-medium">{variant.title}</p>
                                                <p className="text-xs text-gray-500">{variant.sku}</p>
                                            </TableCell>
                                            {product.locations.map(loc => (
                                                <TableCell key={loc}>
                                                    <Input 
                                                        type="number" 
                                                        defaultValue={variant.inventory[loc] || 0}
                                                        className="w-24 mx-auto text-center"
                                                    />
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <Input 
                                                    type="number"
                                                    defaultValue={variant.threshold}
                                                    className="w-24 mx-auto text-center"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Adjust</CardTitle>
                            <CardDescription>Make a quick adjustment and add an audit note.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Select><SelectTrigger><SelectValue placeholder="Select Variant..." /></SelectTrigger><SelectContent><SelectItem value="v1">M / Black</SelectItem><SelectItem value="v2">L / Black</SelectItem></SelectContent></Select>
                                <Select><SelectTrigger><SelectValue placeholder="Select Location..." /></SelectTrigger><SelectContent><SelectItem value="Main Warehouse">Main Warehouse</SelectItem><SelectItem value="NYC Store">NYC Store</SelectItem></SelectContent></Select>
                                <Input type="number" placeholder="Quantity (+/-)" />
                            </div>
                            <Textarea placeholder="Reason for adjustment (e.g., Cycle count, shipment received)" />
                            <div className="flex gap-3">
                                <Button variant="outline"><PackagePlus className="w-4 h-4 mr-2" />Add Stock</Button>
                                <Button variant="destructive"><PackageMinus className="w-4 h-4 mr-2" />Remove Stock</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <div className="mt-8 flex justify-end gap-3">
                <Button variant="outline">Discard</Button>
                <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Inventory Changes
                </Button>
            </div>
        </AdminLayout>
    );
}

export default function AdminStockAdjust() {
    return (
        <AdminProtectedRoute>
            <StockAdjustContent />
        </AdminProtectedRoute>
    );
}
