import React, { useState } from 'react';
import { Upload, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { trackUploadedAsset } from '../utils/assetTracker';

export default function MediaUploader({ files, onFilesChange }) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const handleFiles = async (newFiles) => {
        setUploading(true);
        setUploadError(null);
        
        const processedFiles = [];
        
        for (const file of Array.from(newFiles)) {
            try {
                // Check file size (limit to 50MB for media files)
                const maxSize = 50 * 1024 * 1024; // 50MB
                if (file.size > maxSize) {
                    throw new Error(`File ${file.name} exceeds 50MB limit`);
                }

                // Upload to base44 with timeout
                const uploadPromise = base44.integrations.Core.UploadFile({ file });
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Upload timeout')), 120000) // 2 minute timeout
                );

                const { file_url } = await Promise.race([uploadPromise, timeoutPromise]);

                const fileType = file.type.startsWith('image/') ? 'image' : 
                          file.type.startsWith('video/') ? 'video' : 'other';

                // Track asset in Asset library
                await trackUploadedAsset(file_url, {
                    name: file.name,
                    type: fileType,
                    source: 'upload',
                    fileSize: file.size,
                    mimeType: file.type,
                    folder: 'Uploads'
                });

                processedFiles.push({
                    url: file_url,
                    preview: file_url,
                    name: file.name,
                    type: fileType,
                    size: file.size
                });
            } catch (error) {
                console.error('Upload failed:', error);
                setUploadError(error.message || 'Upload failed. Please check your connection and try again.');
                
                // For images, still create a local preview if upload fails
                if (file.type.startsWith('image/')) {
                    processedFiles.push({
                        url: URL.createObjectURL(file),
                        preview: URL.createObjectURL(file),
                        name: file.name,
                        type: 'image',
                        size: file.size,
                        uploadFailed: true
                    });
                }
            }
        }
        
        onFilesChange([...files, ...processedFiles]);
        setUploading(false);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles) {
            handleFiles(droppedFiles);
        }
    };

    const handleInputChange = (e) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (fileToRemove) => {
        onFilesChange(files.filter(file => file !== fileToRemove));
        // Clean up object URL to prevent memory leaks
        if (fileToRemove.preview && fileToRemove.preview.startsWith('blob:')) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
    };

    return (
        <div>
            <div 
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !uploading && document.getElementById('file-input').click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-sky-500 bg-sky-50' : 
                    uploading ? 'border-gray-300 bg-gray-50 cursor-wait' :
                    'border-gray-300 hover:border-gray-400'
                }`}
            >
                <input 
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*,.glb,.gltf,.fbx"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={uploading}
                />
                {uploading ? (
                    <>
                        <Loader2 className="w-12 h-12 mx-auto text-sky-500 mb-4 animate-spin" />
                        <p>Uploading files...</p>
                        <p className="text-xs text-gray-500 mt-2">Please wait, this may take a moment</p>
                    </>
                ) : (
                    <>
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        {isDragActive ? (
                            <p>Drop the files here...</p>
                        ) : (
                            <p>Drag 'n' drop files here, or click to select</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">Images, GLB, and FBX files supported. Max 50MB per file.</p>
                    </>
                )}
            </div>

            {uploadError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-red-700 font-medium">Upload Error</p>
                        <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                    </div>
                </div>
            )}

            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {files.map((file, index) => (
                    <div key={index} className="relative group aspect-square">
                        {file.uploadFailed && (
                            <div className="absolute top-0 left-0 z-10 bg-red-500 text-white text-[10px] px-1 py-0.5 rounded-br">
                                Upload Failed
                            </div>
                        )}
                        <img 
                            src={file.preview || file.url} 
                            alt={`preview ${index}`}
                            className="w-full h-full object-cover rounded-lg"
                            onLoad={() => { 
                                if(file.preview && file.preview.startsWith('blob:')) {
                                    // Only revoke blob URLs after they're loaded
                                    setTimeout(() => URL.revokeObjectURL(file.preview), 100);
                                }
                            }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="destructive" size="icon" onClick={() => removeFile(file)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}