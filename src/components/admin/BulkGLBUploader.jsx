import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, CheckCircle2, Loader2, Link2, Package } from 'lucide-react';

const WEARABLE_SLOTS = ['top', 'bottom', 'shoes', 'headwear', 'accessory', 'full_body', 'gloves', 'eyewear', 'jewelry', 'bag'];

export default function BulkGLBUploader() {
  const [files, setFiles] = useState([]); // [{file, name, status, url, productId, slot}]
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products-for-glb'],
    queryFn: () => base44.entities.Product.list('-created_date', 200),
  });

  const addFiles = (newFiles) => {
    const glbFiles = Array.from(newFiles).filter(f => f.name.toLowerCase().endsWith('.glb'));
    setFiles(prev => [
      ...prev,
      ...glbFiles.map(f => ({ file: f, name: f.name, status: 'pending', url: null, productId: '', slot: 'top' }))
    ]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const updateFile = (idx, patch) => setFiles(prev => prev.map((f, i) => i === idx ? { ...f, ...patch } : f));

  const uploadFile = async (idx) => {
    const entry = files[idx];
    updateFile(idx, { status: 'uploading' });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: entry.file });
      updateFile(idx, { url: file_url, status: 'uploaded' });

      // Link to product if selected
      if (entry.productId) {
        await base44.entities.Product.update(entry.productId, {
          model_3d_url: file_url,
          wearable_slot: entry.slot,
          product_type: 'wearable',
        });
        updateFile(idx, { status: 'linked' });
      }
    } catch (err) {
      console.error('GLB upload failed:', err);
      updateFile(idx, { status: 'error' });
    }
  };

  const uploadAll = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') await uploadFile(i);
    }
  };

  const statusIcon = (status) => {
    if (status === 'uploading') return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (status === 'uploaded') return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
    if (status === 'linked') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'error') return <X className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".glb" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="font-semibold text-gray-700">Drop GLB files here or click to browse</p>
        <p className="text-sm text-gray-500 mt-1">Supports multiple .glb files at once</p>
      </div>

      {files.length > 0 && (
        <>
          <div className="space-y-3">
            {files.map((entry, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 flex-wrap">
                <Package className="w-5 h-5 text-gray-400 shrink-0" />
                <span className="font-mono text-sm text-gray-800 min-w-[200px] flex-1">{entry.name}</span>

                {/* Product Link */}
                <Select value={entry.productId} onValueChange={(v) => updateFile(idx, { productId: v })}>
                  <SelectTrigger className="w-48 h-8 text-xs">
                    <SelectValue placeholder="Link to product…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>— No product —</SelectItem>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Wearable Slot */}
                <Select value={entry.slot} onValueChange={(v) => updateFile(idx, { slot: v })}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEARABLE_SLOTS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 ml-auto">
                  {statusIcon(entry.status)}
                  {entry.status === 'linked' && <span className="text-xs text-green-600 font-medium">Linked ✓</span>}
                  {entry.status === 'uploaded' && !entry.productId && <span className="text-xs text-blue-500">Uploaded (no product)</span>}
                  {entry.url && (
                    <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline flex items-center gap-1">
                      <Link2 className="w-3 h-3" />URL
                    </a>
                  )}
                  {entry.status === 'pending' && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => uploadFile(idx)}>Upload</Button>
                  )}
                  <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={uploadAll}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={files.every(f => f.status !== 'pending')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload All Pending ({files.filter(f => f.status === 'pending').length})
          </Button>
        </>
      )}
    </div>
  );
}