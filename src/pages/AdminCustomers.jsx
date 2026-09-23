import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  HoverCard, HoverCardContent, HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, MoreHorizontal, MessageSquare, 
  Download, Star, Eye, DollarSign, Activity, Users
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

// Mock Customer data
const mockCustomers = [
  { 
    id: 'cust_1', 
    name: 'John Doe', 
    email: 'john.doe@email.com', 
    phone: '+1 (555) 123-4567',
    ltv: 1250.50, 
    totalOrders: 8,
    lastOrder: '2024-07-10T10:30:00Z', 
    joinDate: '2023-05-15T14:20:00Z',
    tags: ['VIP', 'Repeat Buyer'], 
    wallet: '0x1234567890abcdef1234567890abcdef12345678', 
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    notes: 'Preferred customer, always leaves great reviews.',
    addresses: {
      shipping: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US' },
      billing: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US' }
    },
    orders: [
      { id: 'ord_1', total: 450.00, date: '2024-07-10T10:30:00Z', status: 'delivered' },
      { id: 'ord_2', total: 200.50, date: '2024-06-22T15:45:00Z', status: 'delivered' }
    ]
  },
  { 
    id: 'cust_2', 
    name: 'Jane Smith', 
    email: 'jane.smith@email.com', 
    phone: '+1 (555) 987-6543',
    ltv: 890.00, 
    totalOrders: 5,
    lastOrder: '2024-07-08T14:00:00Z', 
    joinDate: '2024-01-20T11:30:00Z',
    tags: ['Early Adopter'], 
    wallet: '0x34567890abcdef1234567890abcdef1234567890', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    notes: '',
    addresses: {
      shipping: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90210', country: 'US' },
      billing: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90210', country: 'US' }
    },
    orders: [
      { id: 'ord_4', total: 340.00, date: '2024-07-08T14:00:00Z', status: 'shipped' }
    ]
  }
];

const getTagColor = (tag) => {
  switch (tag.toLowerCase()) {
    case 'vip': return 'bg-purple-100 text-purple-800';
    case 'whale': return 'bg-blue-100 text-blue-800';
    case 'genesis holder': return 'bg-amber-100 text-amber-800';
    case 'repeat buyer': return 'bg-green-100 text-green-800';
    case 'new': return 'bg-cyan-100 text-cyan-800';
    case 'early adopter': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

function CustomerHoverCard({ customer, children }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={customer.avatar} />
            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{customer.name}</h4>
            <p className="text-sm text-gray-500">{customer.email}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {customer.tags.map(tag => (
                <Badge key={tag} className={`${getTagColor(tag)} text-xs`}>
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div>
                <p className="text-gray-500">LTV</p>
                <p className="font-semibold">${customer.ltv.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Order</p>
                <p className="font-semibold">{format(parseISO(customer.lastOrder), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function CustomersContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [ltvFilter, setLtvFilter] = useState('all');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200)
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders-for-customers'],
    queryFn: () => base44.entities.Order.list('-created_date', 500)
  });

  // Build customer data from users and orders
  const customers = users.map(user => {
    const userOrders = orders.filter(o => o.user_email === user.email);
    const ltv = userOrders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const lastOrder = userOrders[0]?.created_date || user.created_date;
    
    return {
      id: user.id,
      name: user.full_name || 'No Name',
      email: user.email,
      phone: user.phone || 'N/A',
      ltv,
      totalOrders: userOrders.length,
      lastOrder,
      joinDate: user.created_date,
      tags: user.role === 'admin' ? ['Admin'] : [],
      avatar: user.profile_image_url,
      addresses: {
        shipping: user.shipping_address || {},
        billing: user.billing_address || {}
      }
    };
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.wallet && customer.wallet.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = tagFilter === 'all' || customer.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase());
    
    const matchesLTV = ltvFilter === 'all' || 
      (ltvFilter === 'high' && customer.ltv >= 1000) ||
      (ltvFilter === 'medium' && customer.ltv >= 500 && customer.ltv < 1000) ||
      (ltvFilter === 'low' && customer.ltv < 500);

    return matchesSearch && matchesTag && matchesLTV;
  });

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "LTV", "Total Orders", "Last Order", "Tags"];
    const rows = filteredCustomers.map(customer => [
      customer.name,
      customer.email,
      customer.phone,
      customer.ltv,
      customer.totalOrders,
      format(parseISO(customer.lastOrder), 'yyyy-MM-dd'),
      customer.tags.join(', ')
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allTags = [...new Set(customers.flatMap(c => c.tags))];

  if (isLoading) {
    return (
      <AdminLayout currentPage="customers">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="customers">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-gray-600 mt-1">Manage customer relationships and data</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Search by name, email, or wallet..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ltvFilter} onValueChange={setLtvFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All LTV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All LTV</SelectItem>
                  <SelectItem value="high">High ($1000+)</SelectItem>
                  <SelectItem value="medium">Medium ($500-999)</SelectItem>
                  <SelectItem value="low">Low (&lt;$500)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{customers.length}</div>
            <div className="text-sm text-gray-500">Total Customers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              ${customers.reduce((acc, c) => acc + c.ltv, 0).toFixed(0)}
            </div>
            <div className="text-sm text-gray-500">Total LTV</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {customers.filter(c => c.tags.includes('VIP')).length}
            </div>
            <div className="text-sm text-gray-500">VIP Customers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {customers.filter(c => {
                const lastOrder = new Date(c.lastOrder);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return lastOrder >= thirtyDaysAgo;
              }).length}
            </div>
            <div className="text-sm text-gray-500">Active (30d)</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>LTV</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">No customers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <CustomerHoverCard key={customer.id} customer={customer}>
                    <TableRow className="cursor-pointer hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={customer.avatar} />
                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-500">#{customer.id.slice(-8)}</p>
                          </div>
                        </div>
                      </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{customer.email}</p>
                        <p className="text-xs text-gray-500">{customer.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">${customer.ltv.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(parseISO(customer.lastOrder), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {customer.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} className={`${getTagColor(tag)} text-xs`}>
                            {tag}
                          </Badge>
                        ))}
                        {customer.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{customer.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="text-xs px-3 h-8">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Message
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Export Data
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Star className="w-4 h-4 mr-2" />
                              Mark as VIP
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                </CustomerHoverCard>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

export default function AdminCustomers() {
  return (
    <AdminProtectedRoute>
      <CustomersContent />
    </AdminProtectedRoute>
  );
}