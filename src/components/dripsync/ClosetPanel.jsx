import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Shirt,
  Upload,
  X,
  Music,
  Image as ImageIcon,
  Package,
  ShoppingBag,
  Eye,
  Trash2,
  Sparkles,
  Box,
  Palette,
  Save,
} from 'lucide-react';
import QuickCloset from './QuickCloset';
import OutfitManager from './OutfitManager';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"; // Dropdown menu might become unused
import { useToast } from "@/components/ui/use-toast";
import RPMAssetBrowser from './RPMAssetBrowser';
import OwnedWearablesCloset from './OwnedWearablesCloset';
import WearableMaterialPanel from './WearableMaterialPanel'; // Added import for WearableMaterialPanel
import MarketplacePanel from './MarketplacePanel'; // Marketplace integration
import { motion } from 'framer-motion'; // Added motion for animations

const BONES = [
  'Head',
  'Neck',
  'Spine',
  'Spine1',
  'Spine2',
  'Hips',
  'LeftShoulder',
  'RightShoulder',
  'LeftArm',
  'RightArm',
  'LeftForeArm',
  'RightForeArm',
  'LeftHand',
  'RightHand',
  'LeftUpLeg',
  'RightUpLeg',
  'LeftLeg',
  'RightLeg',
  'LeftFoot',
  'RightFoot',
];

const WEARABLE_CATEGORIES = [
  { value: 'headwear', label: 'Headwear', bone: 'Head' },
  { value: 'eyewear', label: 'Eyewear', bone: 'Head' },
  { value: 'facewear', label: 'Facewear', bone: 'Head' },
  { value: 'earring', label: 'Earrings', bone: 'Head' },
  { value: 'neckwear', label: 'Neckwear', bone: 'Neck' },
  { value: 'top', label: 'Top', bone: 'Spine1' },
  { value: 'outerwear', label: 'Outerwear', bone: 'Spine' },
  { value: 'wristwear', label: 'Wristwear', bone: 'LeftHand' },
  { value: 'handwear', label: 'Handwear', bone: 'LeftHand' },
  { value: 'bottom', label: 'Bottom', bone: 'Hips' },
  { value: 'footwear', label: 'Footwear', bone: 'LeftFoot' },
  { value: 'accessory', label: 'Accessory', bone: 'Spine' },
];

function ClosetPanel({
  wearables,
  onAddWearable,
  onUpdateWearable,
  onRemoveWearable,
  customAnimations,
  onAddAnimation,
  onRemoveAnimation,
  environment,
  sceneLibrary = [],
  onAddEnvironment,
  onRemoveEnvironment,
  onLoadSceneFromLibrary,
  onRemoveSceneFromLibrary,
  setError,
  currentAvatar,
  ownedProductIds = [],
  isDemoMode = false,
  // Save/load outfit
  avatarSource,
  customization,
  user,
  onLoadLook,
}) {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const animationInputRef = useRef(null);
  const environmentInputRef = useRef(null);

  const [pendingWearable, setPendingWearable] = useState(null);
  const [pendingAnimation, setPendingAnimation] = useState(null);
  const [pendingEnvironment, setPendingEnvironment] = useState(null);
  // editingWearable state and related handlers are removed as per the new UI outline
  // const [editingWearable, setEditingWearable] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingWearableMaterial, setEditingWearableMaterial] = useState(null); // Added state for material editor

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.toLowerCase().split('.').pop();
    const validFormats = ['glb', 'gltf', 'fbx'];

    if (!validFormats.includes(extension)) {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: `Please select a ${validFormats.join(', ')} file`,
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingWearable({
      name: file.name.replace(/\.(glb|gltf|fbx)$/i, ''),
      url: objectUrl,
      bone: 'Head',
      category: 'accessory',
      fileFormat: extension,
      fileSize: (file.size / 1024).toFixed(2) + ' KB',
    });

    toast({
      title: "File loaded",
      description: `${file.name} ready to configure`,
    });
  };

  const handleAnimationSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.toLowerCase().split('.').pop();
    const validFormats = ['glb', 'gltf', 'fbx'];

    if (!validFormats.includes(extension)) {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: `Please select a ${validFormats.join(', ')} file`,
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingAnimation({
      name: file.name.replace(/\.(glb|gltf|fbx)$/i, ''),
      url: objectUrl,
      fileFormat: extension,
      fileSize: (file.size / 1024).toFixed(2) + ' KB',
      duration: 0,
    });

    toast({
      title: "Animation loaded",
      description: `${file.name} ready to configure`,
    });
  };

  const handleEnvironmentSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.toLowerCase().split('.').pop();
    const validFormats = ['glb', 'gltf', 'fbx'];

    if (!validFormats.includes(extension)) {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: `Please select a ${validFormats.join(', ')} file`,
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingEnvironment({
      name: file.name.replace(/\.(glb|gltf|fbx)$/i, ''),
      url: objectUrl,
      fileFormat: extension,
      fileSize: (file.size / 1024).toFixed(2) + ' KB',
    });

    toast({
      title: "Environment loaded",
      description: `${file.name} ready to add`,
    });
  };

  const confirmAddWearable = () => {
    if (pendingWearable) {
      onAddWearable({
        ...pendingWearable,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
      });
      setPendingWearable(null);
      toast({
        title: "Wearable added",
        description: `${pendingWearable.name} equipped successfully`,
      });
    }
  };

  const confirmAddAnimation = () => {
    if (pendingAnimation) {
      onAddAnimation(pendingAnimation);
      setPendingAnimation(null);
      toast({
        title: "Emote added",
        description: `${pendingAnimation.name} added to library`,
      });
    }
  };

  const confirmAddEnvironment = () => {
    if (pendingEnvironment) {
      onAddEnvironment(pendingEnvironment);
      setPendingEnvironment(null);
      toast({
        title: "Environment loaded",
        description: `${pendingEnvironment.name} applied to scene`,
      });
    }
  };

  // handleDuplicateWearable and handleEditWearable are removed as the UI no longer supports them directly from the list.
  // const handleDuplicateWearable = (wearable) => {
  //   onAddWearable({
  //     ...wearable,
  //     id: undefined,
  //     name: `${wearable.name} (Copy)`,
  //   });
  //   toast({
  //     title: "Wearable duplicated",
  //     description: `Created copy of ${wearable.name}`,
  //   });
  // };

  // const handleEditWearable = (wearable) => {
  //   setEditingWearable(wearable);
  // };

  // const handleSaveEdit = () => {
  //   if (editingWearable) {
  //     onUpdateWearable(editingWearable.id, editingWearable);
  //     setEditingWearable(null);
  //     toast({
  //       title: "Changes saved",
  //       description: "Wearable updated successfully",
  //     });
  //   }
  // };

  const handleMaterialEdit = useCallback((wearable) => {
    setEditingWearableMaterial(wearable);
  }, []);

  const handleMaterialChange = useCallback((wearableId, material) => {
    onUpdateWearable(wearableId, { material });
    toast({
      title: "Material Updated",
      description: "Wearable material saved successfully.",
    });
  }, [onUpdateWearable, toast]);

  const handleEquipFromStore = useCallback((wearable) => {
    onAddWearable(wearable);
    toast({
      title: "Equipped from store",
      description: `${wearable.name} added to your avatar`,
    });
  }, [onAddWearable, toast]);

  const filteredWearables = useMemo(() => wearables.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || w.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }), [wearables, searchQuery, categoryFilter]);

  const shopWearablesCount = useMemo(() => wearables.filter(w => w.fromShop).length, [wearables]);

  const wearablesBySlot = useMemo(() => filteredWearables.reduce((acc, w) => {
    const slot = w.slot || w.category || 'accessory';
    if (!acc[slot]) acc[slot] = [];
    acc[slot].push(w);
    return acc;
  }, {}), [filteredWearables]);

  const slotOrder = ['headwear', 'eyewear', 'top', 'full_body', 'gloves', 'bottom', 'shoes', 'jewelry', 'accessory', 'bag'];

  return (
    <>
      <Tabs defaultValue="closet" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/80 p-1 rounded-xl mb-3 shadow-sm border border-gray-700">
          <TabsTrigger value="closet" className="flex items-center gap-1 text-xs font-medium text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all">
            <Shirt className="w-3 h-3" /><span className="hidden sm:inline">Closet</span>
          </TabsTrigger>
          <TabsTrigger value="wearables" className="flex items-center gap-1 text-xs font-medium text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all">
            <Upload className="w-3 h-3" /><span className="hidden sm:inline">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-1 text-xs font-medium text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all">
            <ShoppingBag className="w-3 h-3" /><span className="hidden sm:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="outfits" className="flex items-center gap-1 text-xs font-medium text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all">
            <Save className="w-3 h-3" /><span className="hidden sm:inline">Outfits</span>
          </TabsTrigger>
          <TabsTrigger value="environment" className="flex items-center gap-1 text-xs font-medium text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white transition-all">
            <ImageIcon className="w-3 h-3" /><span className="hidden sm:inline">Scene</span>
            {environment && <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />}
          </TabsTrigger>
        </TabsList>

        {/* QUICK CLOSET TAB */}
        <TabsContent value="closet" className="flex-1 overflow-y-auto mt-0 px-1">
          <QuickCloset
            wearables={wearables}
            onRemoveWearable={onRemoveWearable}
            onOpenStore={() => {/* handled by parent tab switch */}}
            ownedProductIds={ownedProductIds}
          />
          {/* Digital wardrobe — owned / default / locked catalog wearables.
              Additive; uses the existing onAddWearable pipeline. Equip sets
              wearable_id so saveAvatarProfile ownership-validates on save. */}
          <div className="mt-3 px-1">
            <OwnedWearablesCloset onAddWearable={onAddWearable} user={user} />
          </div>
        </TabsContent>

        {/* OUTFITS (SAVE/LOAD) TAB */}
        <TabsContent value="outfits" className="flex-1 overflow-hidden flex flex-col mt-0 px-1">
          <OutfitManager
            avatarSource={avatarSource}
            wearables={wearables}
            customization={customization}
            environment={environment}
            user={user}
            onLoadLook={onLoadLook}
          />
        </TabsContent>

        {/* WEARABLES TAB */}
        <TabsContent value="wearables" className="flex-1 overflow-hidden flex flex-col mt-0 space-y-3">
          {/* Shop Items Info */}
          {shopWearablesCount > 0 && (
            <div className="p-3 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-700 rounded-xl">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-cyan-100">
                    {shopWearablesCount} {shopWearablesCount === 1 ? 'item' : 'items'} from shop
                  </p>
                  <p className="text-xs text-cyan-300">
                    Products auto-replace items in the same slot
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="p-3 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-xl border border-blue-700">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".glb,.gltf,.fbx"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Wearable (.glb, .fbx)
            </Button>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Supports GLB, GLTF, and FBX formats
            </p>
          </div>

          {/* Pending Wearable Configuration */}
          {pendingWearable && (
            <div className="p-4 bg-gradient-to-br from-cyan-900/60 to-blue-900/60 border-2 border-cyan-500 rounded-xl shadow-lg shadow-cyan-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Box className="w-5 h-5 text-cyan-400" />
                <p className="text-sm font-semibold text-cyan-100">Configure Wearable</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-300 mb-1 block">Name</Label>
                  <Input
                    value={pendingWearable.name}
                    onChange={(e) =>
                      setPendingWearable({ ...pendingWearable, name: e.target.value })
                    }
                    placeholder="Wearable name"
                    className="text-sm bg-gray-900/80 border-cyan-700 text-white placeholder:text-gray-500 focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-300 mb-1 block">Category</Label>
                    <Select
                      value={pendingWearable.category}
                      onValueChange={(value) => {
                        const category = WEARABLE_CATEGORIES.find(c => c.value === value);
                        setPendingWearable({ 
                          ...pendingWearable, 
                          category: value,
                          bone: category?.bone || pendingWearable.bone
                        });
                      }}
                    >
                      <SelectTrigger className="text-xs bg-gray-900/80 border-cyan-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        {WEARABLE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-300 mb-1 block">Bone</Label>
                    <Select
                      value={pendingWearable.bone}
                      onValueChange={(value) =>
                        setPendingWearable({ ...pendingWearable, bone: value })
                      }
                    >
                      <SelectTrigger className="text-xs bg-gray-900/80 border-cyan-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 bg-gray-900 border-gray-700">
                        {BONES.map((bone) => (
                          <SelectItem key={bone} value={bone}>
                            {bone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-2 bg-gray-900/80 rounded-md text-[10px] text-gray-300 border border-gray-700">
                  <p><strong className="text-cyan-400">Format:</strong> {pendingWearable.fileFormat?.toUpperCase()}</p>
                  <p><strong className="text-cyan-400">Size:</strong> {pendingWearable.fileSize}</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={confirmAddWearable} size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Add Wearable
                  </Button>
                  <Button
                    onClick={() => setPendingWearable(null)}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          {wearables.length > 0 && (
            <div className="px-3 space-y-2">
              <Input
                placeholder="Search wearables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-xs bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {WEARABLE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Wearables List - Grouped by Slot */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {wearables.length === 0 && !pendingWearable ? ( // Check if there are NO wearables AND no pending upload
              <div className="text-center py-12 px-4">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-dashed border-gray-600">
                  <Shirt className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm font-medium text-white mb-1">No wearables yet</p>
                  <p className="text-xs text-gray-400">Upload 3D assets or browse the store</p>
                </div>
              </div>
            ) : filteredWearables.length === 0 && wearables.length > 0 ? ( // Check if wearables exist but none match filter/search
              <div className="text-center py-12">
                <p className="text-sm text-gray-400">No wearables match your search or filter</p>
              </div>
            ) : (
              <>
                {slotOrder.map(slot => {
                  const slotWearables = wearablesBySlot[slot];
                  if (!slotWearables || slotWearables.length === 0) return null;

                  return (
                    <div key={slot} className="space-y-2">
                      <div className="flex items-center gap-2 px-2">
                        <div className="h-px flex-1 bg-gray-700" />
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {slot === 'full_body' ? 'Full Body' : slot.replace(/_/g, ' ')}
                        </span>
                        <div className="h-px flex-1 bg-gray-700" />
                      </div>
                      
                      {slotWearables.map(wearable => (
                        <motion.div
                          key={wearable.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-cyan-500 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium text-sm text-white">{wearable.name}</h4>
                                {wearable.isDemo && (
                                  <span className="text-xs px-2 py-0.5 bg-yellow-900/50 text-yellow-400 rounded-full">Demo</span>
                                )}
                                {wearable.fromShop && !wearable.isDemo && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    ownedProductIds.includes(wearable.productId)
                                      ? 'bg-green-900/50 text-green-400'
                                      : 'bg-cyan-900/50 text-cyan-400'
                                  }`}>
                                    {ownedProductIds.includes(wearable.productId) ? 'Owned' : 'Shop'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Bone: {wearable.bone} • Scale: {wearable.scale?.toFixed(2) || 1}
                              </p>
                              
                              {/* Material Preview */}
                              {wearable.material && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div 
                                    className="w-6 h-6 rounded border border-gray-600"
                                    style={{ backgroundColor: wearable.material.baseColor }}
                                  />
                                  <span className="text-[10px] text-gray-400">
                                    Material applied
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMaterialEdit(wearable)}
                                className="text-purple-400 hover:text-purple-300 p-1.5 hover:bg-purple-900/50 rounded transition-colors"
                                title="Edit material"
                              >
                                <Palette className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onRemoveWearable(wearable.id)}
                                className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/50 rounded transition-colors"
                                title="Remove wearable"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </TabsContent>

        {/* STORE TAB - Marketplace Integration */}
        <TabsContent value="store" className="flex-1 overflow-hidden mt-0">
          <Tabs defaultValue="marketplace" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-2 mx-2 mt-1 bg-gray-800 border border-gray-700">
              <TabsTrigger value="marketplace" className="text-xs text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                <ShoppingBag className="w-3 h-3 mr-1" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="rpm" className="text-xs text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                <Package className="w-3 h-3 mr-1" />
                RPM Assets
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="marketplace" className="flex-1 overflow-hidden mt-0">
              <MarketplacePanel
                onTryOn={handleEquipFromStore}
                onAddToInventory={(item) => {
                  // Add to user's inventory (simulated)
                  toast({
                    title: "Added to Inventory",
                    description: `${item.name} has been added to your inventory`,
                  });
                }}
                equippedItems={wearables}
              />
            </TabsContent>
            
            <TabsContent value="rpm" className="flex-1 overflow-hidden mt-0">
              <RPMAssetBrowser
                onEquip={handleEquipFromStore}
                currentAvatar={currentAvatar}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ANIMATIONS/EMOTES TAB */}
        <TabsContent value="animations" className="flex-1 overflow-hidden flex flex-col mt-0">
          <Tabs defaultValue="library" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-2 mx-2 mt-1 bg-gray-800 border border-gray-700">
              <TabsTrigger value="library" className="text-xs text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Emote Library
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-xs text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                <Upload className="w-3 h-3 mr-1" />
                Custom
              </TabsTrigger>
            </TabsList>

            {/* Emote Library — use the Animation Library button in the viewport toolbar */}
            <TabsContent value="library" className="flex-1 overflow-hidden mt-0">
              <div className="p-6 text-center text-gray-400 text-sm">
                <p className="mb-2 font-semibold text-white">Animation Library</p>
                <p>Click the <strong className="text-pink-400">LIBRARY</strong> button in the viewport controls to browse and preview animations.</p>
              </div>
            </TabsContent>

            {/* Custom Emotes Upload */}
            <TabsContent value="custom" className="flex-1 overflow-hidden flex flex-col mt-0 space-y-3 p-3">
              {/* Upload Section */}
              <div className="p-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-700">
                <input
                  type="file"
                  ref={animationInputRef}
                  onChange={handleAnimationSelect}
                  className="hidden"
                  accept=".glb,.gltf,.fbx"
                />
                <Button
                  onClick={() => animationInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-md"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Emote (.glb, .fbx)
                </Button>
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                  Supports GLB, GLTF, and FBX animation files
                </p>
              </div>

              {/* Pending Animation Configuration */}
              {pendingAnimation && (
                <div className="p-4 bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-2 border-purple-500 rounded-xl shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <Music className="w-5 h-5 text-purple-400" />
                    <p className="text-sm font-semibold text-purple-100">Configure Emote</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-300 mb-1">Emote Name</Label>
                      <Input
                        value={pendingAnimation.name}
                        onChange={(e) =>
                          setPendingAnimation({ ...pendingAnimation, name: e.target.value })
                        }
                        placeholder="e.g., Dance, Wave, Celebrate"
                        className="text-sm bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div className="p-2 bg-gray-800 rounded-md text-[10px] text-gray-300">
                      <p><strong>Format:</strong> {pendingAnimation.fileFormat?.toUpperCase()}</p>
                      <p><strong>Size:</strong> {pendingAnimation.fileSize}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={confirmAddAnimation} size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Add Emote
                      </Button>
                      <Button
                        onClick={() => setPendingAnimation(null)}
                        variant="outline"
                        size="sm"
                        className="border-gray-500 text-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Animations List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {customAnimations.length === 0 && !pendingAnimation ? (
                  <div className="text-center py-12 px-4">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-dashed border-gray-600">
                      <Music className="w-16 h-16 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm font-medium text-white mb-1">No custom emotes</p>
                      <p className="text-xs text-gray-400">Upload animation files to expand your emote library</p>
                    </div>
                  </div>
                ) : (
                  customAnimations.map((anim) => (
                    <div
                      key={anim.id}
                      className="bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500 hover:shadow-md transition-all p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-800 to-pink-800 rounded-lg flex items-center justify-center">
                            <Music className="w-5 h-5 text-purple-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">
                              {anim.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              {anim.fileFormat && (
                                <span className="text-[10px] px-2 py-0.5 bg-purple-900/50 text-purple-400 rounded-full">
                                  {anim.fileFormat.toUpperCase()}
                                </span>
                              )}
                              {anim.duration && (
                                <span className="text-[10px] text-gray-400">
                                  {anim.duration}s
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="text-lg">⋮</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-3 h-3 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onRemoveAnimation(anim.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-3 h-3 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ENVIRONMENT/SCENE TAB */}
        <TabsContent value="environment" className="flex-1 overflow-y-auto mt-0 space-y-3 pb-4">
          {/* Upload Section - TOP */}
          <div className="px-3 pt-2">
            <input
              type="file"
              ref={environmentInputRef}
              onChange={handleEnvironmentSelect}
              className="hidden"
              accept=".glb,.gltf,.fbx"
            />
            <Button
              onClick={() => environmentInputRef.current?.click()}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg font-bold"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Scene
            </Button>
          </div>

          {/* Pending Environment Configuration - SECOND */}
          {pendingEnvironment && (
            <div className="px-3">
              <div className="p-4 bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-2 border-green-500 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-5 h-5 text-green-400" />
                  <p className="text-sm font-bold text-green-100 uppercase tracking-wide">Configure Scene</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-300 mb-1 font-semibold">Scene Name</Label>
                    <Input
                      value={pendingEnvironment.name}
                      onChange={(e) =>
                        setPendingEnvironment({ ...pendingEnvironment, name: e.target.value })
                      }
                      placeholder="e.g., Studio, City Street, Park"
                      className="text-sm bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 text-xs text-gray-300">
                    <p className="font-semibold mb-1">File Details:</p>
                    <p><strong>Format:</strong> {pendingEnvironment.fileFormat?.toUpperCase()}</p>
                    <p><strong>Size:</strong> {pendingEnvironment.fileSize}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={confirmAddEnvironment} size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Load Scene
                    </Button>
                    <Button
                      onClick={() => setPendingEnvironment(null)}
                      variant="outline"
                      size="sm"
                      className="border-gray-500 text-gray-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Scene Section */}
          {environment && (
            <div className="px-3">
              <h4 className="text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Active Scene</h4>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold text-gray-900 truncate">
                        {environment.name}
                      </h5>
                      <p className="text-xs text-gray-500">{environment.fileFormat?.toUpperCase() || 'GLB'} • {environment.fileSize || 'N/A'}</p>
                    </div>
                    <Button
                      onClick={onRemoveEnvironment}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      title="Remove scene"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scene Library Section */}
          {sceneLibrary.length > 0 && (
            <div className="px-3 space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Scene Library</h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sceneLibrary.map((scene) => (
                  <motion.div
                    key={scene.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      environment?.id === scene.id
                        ? 'bg-green-50 border-green-300 shadow-md'
                        : 'bg-white border-gray-200 hover:border-green-200 hover:shadow-sm'
                    }`}
                    onClick={() => onLoadSceneFromLibrary(scene)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          environment?.id === scene.id
                            ? 'bg-gradient-to-br from-green-200 to-teal-200'
                            : 'bg-gradient-to-br from-green-100 to-teal-100'
                        }`}>
                          <ImageIcon className={`w-5 h-5 ${
                            environment?.id === scene.id ? 'text-green-700' : 'text-green-600'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-semibold text-gray-900 truncate">
                            {scene.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {scene.fileFormat?.toUpperCase() || 'GLB'}
                            </span>
                            {scene.uploadedAt && (
                              <span className="text-[10px] text-gray-500">
                                {new Date(scene.uploadedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSceneFromLibrary(scene.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        title="Remove from library"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {environment?.id === scene.id && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-medium">Active in viewport</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Environment Settings Section */}
          <div className="px-3 space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Settings</h4>

            <div className="bg-white rounded-lg border border-gray-200 p-2.5 space-y-2.5">
              {/* Global Scale */}
              <div className="flex items-center justify-between py-1.5">
                <div>
                  <Label className="text-xs text-gray-700 font-semibold">Auto-Scale</Label>
                  <p className="text-[10px] text-gray-500">0.7x multiplier</p>
                </div>
                <span className="text-xs text-green-600 font-mono">✓ ON</span>
              </div>

              {/* Enable Collisions */}
              <div className="flex items-center justify-between py-1.5 border-t border-gray-100">
                <div>
                  <Label className="text-xs text-gray-700 font-semibold">Collisions</Label>
                  <p className="text-[10px] text-gray-500">Avatar physics</p>
                </div>
                <div className="w-9 h-5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-white border border-green-400 absolute top-0.5 right-0.5" />
                </div>
              </div>

              {/* Lock Avatar to Floor */}
              <div className="flex items-center justify-between py-1.5 border-t border-gray-100">
                <div>
                  <Label className="text-xs text-gray-700 font-semibold">Floor Lock</Label>
                  <p className="text-[10px] text-gray-500">Keep grounded</p>
                </div>
                <div className="w-9 h-5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-white border border-green-400 absolute top-0.5 right-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {!environment && !pendingEnvironment && sceneLibrary.length === 0 && (
            <div className="px-3">
              <div className="text-center p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-dashed border-gray-600">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p className="text-xs font-medium text-white mb-0.5">No scenes</p>
                <p className="text-[10px] text-gray-400">Upload above</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Material Editor Modal */}
      {editingWearableMaterial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <WearableMaterialPanel
              wearable={editingWearableMaterial}
              onMaterialChange={(material) => handleMaterialChange(editingWearableMaterial?.id, material)}
              onClose={() => setEditingWearableMaterial(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(ClosetPanel);