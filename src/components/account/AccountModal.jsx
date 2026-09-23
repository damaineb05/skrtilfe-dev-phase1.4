
import React, { useState, useEffect } from 'react';
import { User as UserEntity } from '@/entities/User';
import { UploadFile } from '@/integrations/Core';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { User as UserIcon, Loader2, CheckCircle, X, LogIn, Home, MapPin, CreditCard, Link as LinkIcon, AtSign, Image as ImageIcon } from 'lucide-react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AccountModal({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    profile_image_url: '',
    full_name: '',
    bio: '',
    location: '',
    twitter_handle: '',
    instagram_handle: '',
    discord_username: '',
    website_url: '',
    phone: '',
    shipping_address: {
      first_name: '',
      last_name: '',
      street_address: '',
      apartment: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'US'
    },
    billing_address: {
      first_name: '',
      last_name: '',
      street_address: '',
      apartment: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'US'
    },
    billing_same_as_shipping: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          const currentUser = await UserEntity.me();
          setUser(currentUser);
          setFormData({
            profile_image_url: currentUser.profile_image_url || '',
            full_name: currentUser.full_name || '',
            bio: currentUser.bio || '',
            location: currentUser.location || '',
            twitter_handle: currentUser.twitter_handle || '',
            instagram_handle: currentUser.instagram_handle || '',
            discord_username: currentUser.discord_username || '',
            website_url: currentUser.website_url || '',
            phone: currentUser.phone || '',
            shipping_address: currentUser.shipping_address || {
              first_name: '',
              last_name: '',
              street_address: '',
              apartment: '',
              city: '',
              state: '',
              zip_code: '',
              country: 'US'
            },
            billing_address: currentUser.billing_address || {
              first_name: '',
              last_name: '',
              street_address: '',
              apartment: '',
              city: '',
              state: '',
              zip_code: '',
              country: 'US'
            },
            billing_same_as_shipping: currentUser.billing_same_as_shipping !== false
          });
        } catch (error) {
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUser();
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleBillingSameChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      billing_same_as_shipping: checked,
      billing_address: checked ? prev.shipping_address : prev.billing_address
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_image_url: file_url }));
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updateData = {
        profile_image_url: formData.profile_image_url,
        full_name: formData.full_name,
        bio: formData.bio,
        location: formData.location,
        twitter_handle: formData.twitter_handle,
        instagram_handle: formData.instagram_handle,
        discord_username: formData.discord_username,
        website_url: formData.website_url,
        phone: formData.phone,
        shipping_address: formData.shipping_address,
        billing_address: formData.billing_same_as_shipping ? formData.shipping_address : formData.billing_address,
        billing_same_as_shipping: formData.billing_same_as_shipping
      };
      
      await UserEntity.updateMyUserData(updateData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose(); // Close modal on successful save
      }, 2000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="card bg-graphite border-gray-700 text-white">
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="card bg-graphite border-gray-700 text-white max-w-md">
          <DialogHeader className="flex flex-row justify-between items-center">
            <DialogTitle className="display text-2xl flex items-center gap-3">
              <UserIcon className="w-6 h-6 text-accent-cyan" />
              Account Access
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-muted hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          
          <div className="text-center py-8">
            <UserIcon className="w-16 h-16 text-muted mx-auto mb-6" />
            <p className="text-muted mb-8">Please log in to manage your account and access member benefits.</p>
            
            <div className="flex flex-col gap-3">
              <Button onClick={() => UserEntity.login()} className="btn-primary w-full">
                <LogIn className="mr-2 w-5 h-5" /> Log In / Sign Up
              </Button>
              
              <Link to={createPageUrl("Home")} onClick={onClose}>
                <Button variant="outline" className="w-full neon-border text-cyan-400 hover:bg-cyan-400/10">
                  <Home className="mr-2 w-5 h-5" /> Back to Home
                </Button>
              </Link>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              New to Skrtlife? Create your account securely with Google.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="card bg-graphite border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle className="display text-2xl flex items-center gap-3 text-white">
            <UserIcon className="w-6 h-6 text-accent-cyan" />
            Your Account
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-onyx border-gray-700">
              <TabsTrigger value="profile" className="data-[state=active]:bg-accent-cyan data-[state=active]:text-black text-muted">
                <UserIcon className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="shipping" className="data-[state=active]:bg-accent-cyan data-[state=active]:text-black text-muted">
                <MapPin className="w-4 h-4 mr-2" />
                Shipping
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-accent-cyan data-[state=active]:text-black text-muted">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-6">
              <div className="flex items-center gap-6 pb-4 border-b border-gray-700">
                <div className="w-24 h-24 rounded-full bg-onyx flex items-center justify-center shrink-0 border border-gray-700 overflow-hidden">
                  {formData.profile_image_url ? (
                    <img src={formData.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-muted" />
                  )}
                </div>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="cursor-pointer neon-border text-cyan-400 hover:bg-cyan-400/10" disabled={isUploading}>
                    <label htmlFor="profile-picture-upload">
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4 mr-2" />
                      )}
                      {isUploading ? 'Uploading...' : 'Upload Picture'}
                    </label>
                  </Button>
                  <input id="profile-picture-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
                  <p className="text-xs text-muted">PNG, JPG, GIF. Recommended 200x200px</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">Email</label>
                <Input value={user.email} disabled className="bg-onyx border-gray-700 text-muted" />
              </div>
              <div>
                <label htmlFor="full_name" className="block text-xs font-medium text-white mb-1">Full Name</label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} className="bg-white border-gray-300 text-black" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-white mb-1">Phone Number</label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(555) 123-4567" className="bg-white border-gray-300 text-black" />
              </div>
              <div>
                <label htmlFor="bio" className="block text-xs font-medium text-white mb-1">Bio</label>
                <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us about yourself..." className="bg-white border-gray-300 text-black" rows={3} />
              </div>
              <div>
                <label htmlFor="location" className="block text-xs font-medium text-white mb-1">Location</label>
                <Input id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. New York, NY" className="bg-white border-gray-300 text-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="twitter_handle" className="block text-xs font-medium text-white mb-1">Twitter</label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input id="twitter_handle" name="twitter_handle" value={formData.twitter_handle} onChange={handleInputChange} placeholder="username" className="bg-white border-gray-300 text-black pl-9" />
                    </div>
                </div>
                <div>
                    <label htmlFor="instagram_handle" className="block text-xs font-medium text-white mb-1">Instagram</label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input id="instagram_handle" name="instagram_handle" value={formData.instagram_handle} onChange={handleInputChange} placeholder="username" className="bg-white border-gray-300 text-black pl-9" />
                    </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="discord_username" className="block text-xs font-medium text-white mb-1">Discord</label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input id="discord_username" name="discord_username" value={formData.discord_username} onChange={handleInputChange} placeholder="username#0000" className="bg-white border-gray-300 text-black pl-9" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="website_url" className="block text-xs font-medium text-white mb-1">Website</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input id="website_url" name="website_url" type="url" value={formData.website_url} onChange={handleInputChange} placeholder="https://example.com" className="bg-white border-gray-300 text-black pl-9" />
                    </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Shipping Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white mb-1">First Name</label>
                  <Input 
                    value={formData.shipping_address.first_name} 
                    onChange={(e) => handleAddressChange('shipping_address', 'first_name', e.target.value)}
                    className="bg-white border-gray-300 text-black" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white mb-1">Last Name</label>
                  <Input 
                    value={formData.shipping_address.last_name} 
                    onChange={(e) => handleAddressChange('shipping_address', 'last_name', e.target.value)}
                    className="bg-white border-gray-300 text-black" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Street Address</label>
                <Input 
                  value={formData.shipping_address.street_address} 
                  onChange={(e) => handleAddressChange('shipping_address', 'street_address', e.target.value)}
                  className="bg-white border-gray-300 text-black" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Apartment, suite, etc. (optional)</label>
                <Input 
                  value={formData.shipping_address.apartment} 
                  onChange={(e) => handleAddressChange('shipping_address', 'apartment', e.target.value)}
                  className="bg-white border-gray-300 text-black" 
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white mb-1">City</label>
                  <Input 
                    value={formData.shipping_address.city} 
                    onChange={(e) => handleAddressChange('shipping_address', 'city', e.target.value)}
                    className="bg-white border-gray-300 text-black" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white mb-1">State</label>
                  <Input 
                    value={formData.shipping_address.state} 
                    onChange={(e) => handleAddressChange('shipping_address', 'state', e.target.value)}
                    className="bg-white border-gray-300 text-black" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white mb-1">ZIP Code</label>
                  <Input 
                    value={formData.shipping_address.zip_code} 
                    onChange={(e) => handleAddressChange('shipping_address', 'zip_code', e.target.value)}
                    className="bg-white border-gray-300 text-black" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Country</label>
                <Input 
                  value={formData.shipping_address.country} 
                  onChange={(e) => handleAddressChange('shipping_address', 'country', e.target.value)}
                  className="bg-white border-gray-300 text-black" 
                />
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4 mt-6">
              <div className="flex items-center space-x-2 mb-6">
                <Checkbox 
                  id="billing-same" 
                  checked={formData.billing_same_as_shipping}
                  onCheckedChange={handleBillingSameChange}
                />
                <label htmlFor="billing-same" className="text-sm text-white">
                  Billing address is the same as shipping address
                </label>
              </div>

              {!formData.billing_same_as_shipping && (
                <>
                  <h3 className="text-lg font-semibold text-white mb-4">Billing Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">First Name</label>
                      <Input 
                        value={formData.billing_address.first_name} 
                        onChange={(e) => handleAddressChange('billing_address', 'first_name', e.target.value)}
                        className="bg-white border-gray-300 text-black" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">Last Name</label>
                      <Input 
                        value={formData.billing_address.last_name} 
                        onChange={(e) => handleAddressChange('billing_address', 'last_name', e.target.value)}
                        className="bg-white border-gray-300 text-black" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">Street Address</label>
                    <Input 
                      value={formData.billing_address.street_address} 
                      onChange={(e) => handleAddressChange('billing_address', 'street_address', e.target.value)}
                      className="bg-white border-gray-300 text-black" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">Apartment, suite, etc. (optional)</label>
                    <Input 
                      value={formData.billing_address.apartment} 
                      onChange={(e) => handleAddressChange('billing_address', 'apartment', e.target.value)}
                      className="bg-white border-gray-300 text-black" 
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">City</label>
                      <Input 
                        value={formData.billing_address.city} 
                        onChange={(e) => handleAddressChange('billing_address', 'city', e.target.value)}
                        className="bg-white border-gray-300 text-black" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">State</label>
                      <Input 
                        value={formData.billing_address.state} 
                        onChange={(e) => handleAddressChange('billing_address', 'state', e.target.value)}
                        className="bg-white border-gray-300 text-black" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">ZIP Code</label>
                      <Input 
                        value={formData.billing_address.zip_code} 
                        onChange={(e) => handleAddressChange('billing_address', 'zip_code', e.target.value)}
                        className="bg-white border-gray-300 text-black" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white mb-1">Country</label>
                    <Input 
                      value={formData.billing_address.country} 
                      onChange={(e) => handleAddressChange('billing_address', 'country', e.target.value)}
                      className="bg-white border-gray-300 text-black" 
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4">
            <div className="flex justify-end items-center gap-4 w-full">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Saved! Closing...</span>
                </div>
              )}
              <Button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
