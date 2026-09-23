import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Save,
  FolderOpen,
  Download,
  Loader2,
  Trash2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

export default function SceneManager({
  sceneObjects,
  environment,
  onLoadScene,
  onClearScene
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedScenes, setSavedScenes] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  
  const [sceneName, setSceneName] = useState('');
  const [sceneDescription, setSceneDescription] = useState('');

  const handleSaveScene = async () => {
    if (!sceneName.trim()) {
      alert('Please enter a scene name');
      return;
    }

    setIsSaving(true);
    try {
      // Save all scene objects first
      const objectIds = [];
      for (const obj of sceneObjects) {
        if (obj.id) {
          // Update existing
          await base44.entities.SceneObject.update(obj.id, obj);
          objectIds.push(obj.id);
        } else {
          // Create new
          const newObj = await base44.entities.SceneObject.create(obj);
          objectIds.push(newObj.id);
        }
      }

      // Create scene configuration
      const sceneConfig = {
        name: sceneName,
        description: sceneDescription,
        environment: environment,
        object_ids: objectIds,
        camera: {
          position: [0, 2, 5],
          target: [0, 0, 0],
          fov: 50
        }
      };

      await base44.entities.SceneConfiguration.create(sceneConfig);
      
      alert('Scene saved successfully!');
      setShowSaveDialog(false);
      setSceneName('');
      setSceneDescription('');
    } catch (error) {
      console.error('Failed to save scene:', error);
      alert('Failed to save scene');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadScenes = async () => {
    setIsLoading(true);
    setShowLoadDialog(true);
    try {
      const scenes = await base44.entities.SceneConfiguration.list('-created_date', 50);
      setSavedScenes(scenes);
    } catch (error) {
      console.error('Failed to load scenes:', error);
      alert('Failed to load saved scenes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadScene = async (sceneConfig) => {
    try {
      // Load all scene objects
      const objects = [];
      for (const objId of sceneConfig.object_ids || []) {
        try {
          const obj = await base44.entities.SceneObject.filter({ id: objId }, '-created_date', 1);
          if (obj[0]) objects.push(obj[0]);
        } catch (e) {
          console.warn(`Failed to load object ${objId}`);
        }
      }

      if (onLoadScene) {
        onLoadScene({
          objects,
          environment: sceneConfig.environment,
          camera: sceneConfig.camera
        });
      }

      setShowLoadDialog(false);
    } catch (error) {
      console.error('Failed to load scene:', error);
      alert('Failed to load scene');
    }
  };

  const handleDeleteScene = async (sceneId) => {
    if (!confirm('Delete this scene configuration?')) return;

    try {
      await base44.entities.SceneConfiguration.delete(sceneId);
      setSavedScenes(savedScenes.filter(s => s.id !== sceneId));
    } catch (error) {
      console.error('Failed to delete scene:', error);
      alert('Failed to delete scene');
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      scene: {
        name: 'Exported Scene',
        objects: sceneObjects,
        environment: environment
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `scene_${Date.now()}.json`);
    linkElement.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Scene Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Save Scene */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button className="w-full bg-[#0088cc] hover:bg-[#0099dd] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Scene
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Scene Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="scene-name">Scene Name *</Label>
                <Input
                  id="scene-name"
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  placeholder="e.g., Product Showcase"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="scene-desc">Description</Label>
                <Textarea
                  id="scene-desc"
                  value={sceneDescription}
                  onChange={(e) => setSceneDescription(e.target.value)}
                  placeholder="Describe this scene setup..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="text-xs text-[#666666] bg-[#f5f5f7] p-2 rounded">
                This will save {sceneObjects.length} objects and environment settings.
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveScene}
                disabled={isSaving || !sceneName.trim()}
                className="bg-[#0088cc] hover:bg-[#0099dd] text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Load Scene */}
        <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLoadScenes}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Load Scene
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Load Scene Configuration</DialogTitle>
            </DialogHeader>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#0088cc]" />
              </div>
            ) : savedScenes.length === 0 ? (
              <div className="text-center py-8 text-[#666666]">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No saved scenes yet</p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {savedScenes.map((scene) => (
                  <div
                    key={scene.id}
                    className="p-4 border-2 border-[#eeeeee] rounded-lg hover:border-[#0088cc]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{scene.name}</h3>
                        {scene.description && (
                          <p className="text-xs text-[#666666] mt-1">
                            {scene.description}
                          </p>
                        )}
                        <p className="text-xs text-[#666666] mt-1">
                          {scene.object_ids?.length || 0} objects
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoadScene(scene)}
                          className="bg-[#0088cc] hover:bg-[#0099dd]"
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteScene(scene.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Export/Clear */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            disabled={sceneObjects.length === 0}
          >
            <Download className="w-4 h-4 mr-1" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('Clear all objects from scene?')) {
                onClearScene();
              }
            }}
            disabled={sceneObjects.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-1 text-red-500" />
            Clear Scene
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}