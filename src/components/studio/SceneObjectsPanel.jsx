import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Loader2,
  Box,
  Move,
  RotateCw,
  Maximize2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SceneObjectsPanel({
  sceneObjects = [],
  selectedObjectId,
  onSelectObject,
  onAddObject,
  onUpdateObject,
  onDeleteObject,
  onTransformModeChange,
  transformMode = 'translate'
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(glb|gltf)$/i)) {
      alert('Please upload a .glb or .gltf file');
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const newObject = {
        name: file.name.replace(/\.(glb|gltf)$/i, ''),
        object_type: 'mesh',
        asset_url: file_url,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        is_visible: true,
        is_locked: false
      };

      if (onAddObject) {
        onAddObject(newObject);
      }
    } catch (error) {
      console.error('Failed to upload object:', error);
      alert('Failed to upload 3D model');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleVisibility = (objId) => {
    const obj = sceneObjects.find(o => o.id === objId);
    if (obj && onUpdateObject) {
      onUpdateObject(objId, { is_visible: !obj.is_visible });
    }
  };

  const toggleLock = (objId) => {
    const obj = sceneObjects.find(o => o.id === objId);
    if (obj && onUpdateObject) {
      onUpdateObject(objId, { is_locked: !obj.is_locked });
    }
  };

  const duplicateObject = (objId) => {
    const obj = sceneObjects.find(o => o.id === objId);
    if (obj && onAddObject) {
      const duplicate = {
        ...obj,
        id: undefined,
        name: `${obj.name} Copy`,
        position: [obj.position[0] + 1, obj.position[1], obj.position[2] + 1]
      };
      delete duplicate.id;
      onAddObject(duplicate);
    }
  };

  const selectedObject = sceneObjects.find(o => o.id === selectedObjectId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Box className="w-5 h-5 text-[#0088cc]" />
            Scene Objects
            <Badge variant="secondary" className="ml-auto">
              {sceneObjects.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full bg-[#0088cc] hover:bg-[#0099dd] text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Add 3D Object
              </>
            )}
          </Button>

          <div className="text-xs text-[#666666] bg-[#f5f5f7] p-2 rounded">
            <strong>Tip:</strong> Upload .glb or .gltf files. Objects will appear at origin (0,0,0).
          </div>
        </CardContent>
      </Card>

      {/* Transform Controls */}
      {selectedObject && (
        <Card className="border-[#0088cc]/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Transform Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={transformMode === 'translate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTransformModeChange('translate')}
                className={transformMode === 'translate' ? 'bg-[#0088cc]' : ''}
              >
                <Move className="w-4 h-4 mr-1" />
                Move
              </Button>
              <Button
                variant={transformMode === 'rotate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTransformModeChange('rotate')}
                className={transformMode === 'rotate' ? 'bg-[#0088cc]' : ''}
              >
                <RotateCw className="w-4 h-4 mr-1" />
                Rotate
              </Button>
              <Button
                variant={transformMode === 'scale' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTransformModeChange('scale')}
                className={transformMode === 'scale' ? 'bg-[#0088cc]' : ''}
              >
                <Maximize2 className="w-4 h-4 mr-1" />
                Scale
              </Button>
            </div>

            {/* Transform Values */}
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <Label className="text-[10px] text-[#666666]">Position</Label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {selectedObject.position.map((val, i) => (
                    <Input
                      key={i}
                      type="number"
                      step="0.1"
                      value={val.toFixed(2)}
                      onChange={(e) => {
                        const newPos = [...selectedObject.position];
                        newPos[i] = parseFloat(e.target.value) || 0;
                        onUpdateObject(selectedObject.id, { position: newPos });
                      }}
                      className="h-7 text-xs"
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-[10px] text-[#666666]">Rotation (rad)</Label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {selectedObject.rotation.map((val, i) => (
                    <Input
                      key={i}
                      type="number"
                      step="0.1"
                      value={val.toFixed(2)}
                      onChange={(e) => {
                        const newRot = [...selectedObject.rotation];
                        newRot[i] = parseFloat(e.target.value) || 0;
                        onUpdateObject(selectedObject.id, { rotation: newRot });
                      }}
                      className="h-7 text-xs"
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-[10px] text-[#666666]">Scale</Label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {selectedObject.scale.map((val, i) => (
                    <Input
                      key={i}
                      type="number"
                      step="0.1"
                      value={val.toFixed(2)}
                      onChange={(e) => {
                        const newScale = [...selectedObject.scale];
                        newScale[i] = parseFloat(e.target.value) || 1;
                        onUpdateObject(selectedObject.id, { scale: newScale });
                      }}
                      className="h-7 text-xs"
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Objects List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Objects List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sceneObjects.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#666666]">
              <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No objects in scene</p>
              <p className="text-xs mt-1">Upload a 3D model to get started</p>
            </div>
          ) : (
            sceneObjects.map((obj) => (
              <div
                key={obj.id}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedObjectId === obj.id
                    ? 'border-[#0088cc] bg-[#0088cc]/10'
                    : 'border-[#eeeeee] hover:border-[#0088cc]/30'
                }`}
                onClick={() => onSelectObject(obj.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Box className="w-4 h-4 text-[#0088cc] flex-shrink-0" />
                    <span className="font-medium text-sm truncate">{obj.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(obj.id);
                      }}
                      className="p-1 hover:bg-[#eeeeee] rounded"
                    >
                      {obj.is_visible ? (
                        <Eye className="w-4 h-4 text-[#666666]" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[#666666]" />
                      )}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLock(obj.id);
                      }}
                      className="p-1 hover:bg-[#eeeeee] rounded"
                    >
                      {obj.is_locked ? (
                        <Lock className="w-4 h-4 text-[#666666]" />
                      ) : (
                        <Unlock className="w-4 h-4 text-[#666666]" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateObject(obj.id);
                      }}
                      className="p-1 hover:bg-[#eeeeee] rounded"
                    >
                      <Copy className="w-4 h-4 text-[#666666]" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${obj.name}"?`)) {
                          onDeleteObject(obj.id);
                        }
                      }}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 text-xs text-[#666666]">
                  <Badge variant="outline" className="text-[10px]">
                    {obj.object_type}
                  </Badge>
                  {!obj.is_visible && (
                    <Badge variant="secondary" className="text-[10px]">
                      Hidden
                    </Badge>
                  )}
                  {obj.is_locked && (
                    <Badge variant="secondary" className="text-[10px]">
                      Locked
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}