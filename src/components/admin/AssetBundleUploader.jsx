import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';

const defaultScanOptions = {
  exact_scan: true,
  scan_programming: true,
  validate_structure: true,
  check_dependencies: true,
  analyze_assets: true,
};

export default function AssetBundleUploader() {
  const [files, setFiles] = useState([]);
  const [scanOptions, setScanOptions] = useState(defaultScanOptions);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [results, setResults] = useState([]);

  const handleFileChange = (event) => {
    if (!event.target.files) return;
    const selectedFiles = Array.from(event.target.files).filter(f => 
      f.name.toLowerCase().endsWith('.zip') || 
      f.name.toLowerCase().endsWith('.glb') ||
      f.name.toLowerCase().endsWith('.gltf')
    );
    
    // Check file sizes (50MB limit per file)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const oversizedFiles = selectedFiles.filter(f => f.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert(`The following files exceed the 50MB limit:\n\n${oversizedFiles.map(f => `${f.name} (${(f.size / (1024 * 1024)).toFixed(1)}MB)`).join('\n')}\n\nPlease split large archives into smaller files or compress them further.`);
      return;
    }
    
    setFiles(selectedFiles);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files).filter(f => 
      f.name.toLowerCase().endsWith('.zip') || 
      f.name.toLowerCase().endsWith('.glb') ||
      f.name.toLowerCase().endsWith('.gltf')
    );
    
    // Check file sizes (50MB limit per file)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const oversizedFiles = droppedFiles.filter(f => f.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert(`The following files exceed the 50MB limit:\n\n${oversizedFiles.map(f => `${f.name} (${(f.size / (1024 * 1024)).toFixed(1)}MB)`).join('\n')}\n\nPlease split large archives into smaller files or compress them further.`);
      return;
    }
    
    setFiles(droppedFiles);
  };

  const toggleOption = (key) => {
    setScanOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!files.length) {
      alert('Please select at least one file.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress([]);
      setResults([]);

      const uploadedBundles = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(prev => [...prev, `Uploading ${file.name}...`]);

        try {
          const { file_url } = await Promise.race([
            base44.integrations.Core.UploadFile({ file }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Upload timeout - file may be too large or connection is slow')), 120000)
            )
          ]);

          setUploadProgress(prev => [...prev, `✓ Uploaded ${file.name}`]);

        const bundleId = `bundle_${Date.now()}_${i}`;
        const bundleName = file.name.replace(/\.(zip|glb|gltf)$/i, '');

          const bundle = await base44.entities.AssetBundle.create({
            bundle_id: bundleId,
            name: bundleName,
            source_zip_name: file.name,
            zip_file_url: file_url,
            status: 'uploaded',
            scan_options: scanOptions,
            files: [],
            total_files: 0,
            file_size_mb: parseFloat((file.size / (1024 * 1024)).toFixed(2))
          });

          uploadedBundles.push(bundle);
          setUploadProgress(prev => [...prev, `✓ Created bundle: ${bundleName}`]);
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          setUploadProgress(prev => [...prev, `✗ Failed: ${file.name} - ${fileError.message}`]);
          throw fileError;
        }
      }

      setResults(uploadedBundles);
      setUploadProgress(prev => [...prev, `\n✓ Upload complete! Created ${uploadedBundles.length} bundle(s).`]);
      
      setFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error.message || error.toString();
      
      // Specific error messages for common issues
      let userMessage = 'Upload failed';
      if (errorMsg.includes('413') || errorMsg.includes('Payload too large') || errorMsg.includes('exceeded the maximum')) {
        userMessage = `File too large. Maximum size is 50MB. Please split into smaller files.`;
      } else if (errorMsg.includes('timeout')) {
        userMessage = 'Upload timeout. The file may be too large or your internet connection is slow. Try a smaller file or better connection.';
      } else if (errorMsg.includes('Network Error') || errorMsg.includes('network')) {
        userMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.response?.status === 0) {
        userMessage = 'Connection failed. Please check your internet and try again.';
      } else {
        userMessage = errorMsg;
      }
      
      setUploadProgress(prev => [...prev, `✗ Error: ${userMessage}`]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload & Scan 3D Assets</h2>
        <p className="text-sm text-gray-600">
          Upload ZIP files or individual GLB/GLTF models (up to 50MB each) containing 3D assets for DripSync.
        </p>
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ File Size Limit:</strong> Maximum 50MB per file. For larger assets, please split them into multiple smaller archives or compress them further.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold mb-3">Scan Options</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={scanOptions.exact_scan}
              onChange={() => toggleOption('exact_scan')}
              className="rounded"
            />
            Exact Scan (deep analysis)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={scanOptions.scan_programming}
              onChange={() => toggleOption('scan_programming')}
              className="rounded"
            />
            Scan Programming
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={scanOptions.validate_structure}
              onChange={() => toggleOption('validate_structure')}
              className="rounded"
            />
            Validate Structure
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={scanOptions.check_dependencies}
              onChange={() => toggleOption('check_dependencies')}
              className="rounded"
            />
            Check Dependencies
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={scanOptions.analyze_assets}
              onChange={() => toggleOption('analyze_assets')}
              className="rounded"
            />
            Analyze Assets
          </label>
        </div>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
      >
        <input
          type="file"
          accept=".zip,.glb,.gltf"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="asset-upload-input"
        />
        <label htmlFor="asset-upload-input" className="cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-medium text-lg mb-1">Upload Asset Files</p>
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop files here or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Supported: .zip, .glb, .gltf (up to 50MB each)
          </p>
        </label>

        {files.length > 0 && (
          <div className="mt-4 text-left bg-white rounded-lg p-4 border border-gray-200">
            <p className="font-semibold mb-2 text-sm">Selected files ({files.length}):</p>
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {files.map((file, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isUploading || files.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading & Scanning...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload & Scan Files
          </>
        )}
      </Button>

      {uploadProgress.length > 0 && (
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs max-h-60 overflow-y-auto">
          {uploadProgress.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Upload Complete
          </h3>
          <div className="space-y-2">
            {results.map((bundle, i) => (
              <div key={i} className="text-sm p-3 bg-gray-50 rounded border border-gray-200">
                <p className="font-medium">{bundle.name}</p>
                <p className="text-xs text-gray-600">Bundle ID: {bundle.bundle_id}</p>
                <p className="text-xs text-gray-600">Size: {bundle.file_size_mb} MB</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}