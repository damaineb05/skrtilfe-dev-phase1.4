import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Filter, PlusCircle, MoreHorizontal, Edit, Eye, CheckCircle,
  Star, TrendingUp, Users, Activity, Download, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';

// Mock Collections data
const mockCollections = [
  { 
    id: 'col_1', 
    name: 'Genesis Origins', 
    slug: 'genesis-origins',
    creator: 'Skrtlife Team',
    status: 'active', 
    verified: true,
    featured: true,
    items: 888, 
    owners: 645,
    floor_price: 2.49,
    volume_24h: 125.7,
    volume_total: 12400.5,
    created_date: '2023-05-15',
    image: 'https://images.unsplash.com/photo-1617791160588-241658c0f566?w=100&h=100&fit=crop'
  },
  { 
    id: 'col_2', 
    name: 'Digital Wearables', 
    slug: 'digital-wearables',
    creator: 'Fashion DAO',
    status: 'active', 
    verified: true,
    featured: false,
    items: 2500, 
    owners: 1234,
    floor_price: 0.25,
    volume_24h: 45.2,
    volume_total: 3200.8,
    created_date: '2023-08-20',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100&h=100&fit=crop'
  },
  { 
    id: 'col_3', 
    name: 'Cyber Avatars', 
    slug: 'cyber-avatars',
    creator: 'MetaBuilder',
    status: 'pending', 
    verified: false,
    featured: false,
    items: 1000, 
    owners: 342,
    floor_price: 1.12,
    volume_24h: 78.9,
    volume_total: 890.4,
    created_date: '2024-01-10',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop'
  },
  { 
    id: 'col_4', 
    name: 'Astro Explorers', 
    slug: 'astro-explorers',
    creator: 'Space Collective',
    status: 'draft', 
    verified: false,
    featured: false,
    items: 5555, 
    owners: 0,
    floor_price: 0,
    volume_24h: 0,
    volume_total: 0,
    created_date: '2024-07-01',
    image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=100&h=100&fit=crop'
  }
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
    case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
  }
};

function MarketplaceContent() {
  const [collections, setCollections] = useState(mockCollections);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_date');

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.creator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || collection.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const headers = ["Name", "Creator", "Status", "Items", "Owners", "Floor Price", "Volume 24h", "Total Volume", "Created"];
    const rows = filteredCollections.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.creator.replace(/"/g, '""')}"`,
      c.status,
      c.items,
      c.owners,
      c.floor_price,
      c.volume_24h,
      c.volume_total,
      c.created_date
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `collections_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout currentPage="marketplace">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage NFT collections and marketplace settings</p>
        </div>
        <div className="flex gap-3">
          <Link to={createPageUrl("NFTMarketplace")}>
            <Button variant="outline" className="hidden sm:flex">
              <Eye className="w-4 h-4 mr-2" />
              View Marketplace
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExport} className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Link to={createPageUrl("AdminCollectionEdit")}>
            <Button className="bg-sky-500 hover:bg-sky-600 text-white">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Collection
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Collections</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{collections.length}</p>
              </div>
              <Activity className="w-8 h-8 text-sky-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Collections</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {collections.filter(c => c.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {collections.reduce((sum, c) => sum + c.volume_total, 0).toFixed(1)} ETH
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Owners</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {collections.reduce((sum, c) => sum + c.owners, 0).toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Search collections by name or creator..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_date">Created Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="volume_total">Total Volume</SelectItem>
                  <SelectItem value="items">Items Count</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="px-3">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections Table */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200/50 dark:border-gray-700/50">
                <TableHead>Collection</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Owners</TableHead>
                <TableHead>Floor Price</TableHead>
                <TableHead>24h Volume</TableHead>
                <TableHead>Total Volume</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollections.map((collection, index) => (
                <motion.tr
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-gray-200/50 dark:border-gray-700/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={collection.image} 
                        alt={collection.name}
                        className="w-12 h-12 rounded-xl object-cover bg-gray-100 dark:bg-gray-800"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white">{collection.name}</p>
                          {collection.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                          {collection.featured && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">/{collection.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900 dark:text-white">{collection.creator}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(collection.status)}>
                      {collection.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900 dark:text-white">{collection.items.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900 dark:text-white">{collection.owners.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {collection.floor_price > 0 ? `${collection.floor_price} ETH` : '--'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900 dark:text-white">
                      {collection.volume_24h > 0 ? `${collection.volume_24h} ETH` : '--'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {collection.volume_total > 0 ? `${collection.volume_total} ETH` : '--'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl(`AdminCollectionEdit?id=${collection.id}`)} className="flex items-center w-full">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Collection
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="w-4 h-4 mr-2" />
                          Collection Settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

export default function AdminMarketplace() {
  return (
    <AdminProtectedRoute>
      <MarketplaceContent />
    </AdminProtectedRoute>
  );
}