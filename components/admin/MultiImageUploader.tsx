'use client';

import { useState, useCallback } from 'react';
import { useUploadThing } from '@/lib/uploadthing';

interface MultiImageUploaderProps {
    value: string[];
    onChange: (urls: string[]) => void;
}

export default function MultiImageUploader({ value, onChange }: MultiImageUploaderProps) {
    const [previews, setPreviews] = useState<string[]>(value || []);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);

    const { startUpload } = useUploadThing("productImage", {
        onClientUploadComplete: (res) => {
            if (res) {
                const newUrls = res.map(file => file.url);
                const updatedImages = [...value.filter(p => !p.startsWith('blob:')), ...newUrls];
                onChange(updatedImages);
                setUploading(false);
            }
        },
        onUploadError: (error) => {
            setUploading(false);
            console.error("Upload error:", error);
            alert("Upload failed: " + error.message);
            // Clean up blob URLs on error
            setPreviews(prev => prev.filter(p => !p.startsWith('blob:')));
        },
    });

    // We use value directly for display, except during upload where we want to show blobs
    const displayImages = [...value, ...previews.filter(p => p.startsWith('blob:'))];

    const handleFiles = async (files: File[]) => {
        if (files.length === 0) return;
        setUploading(true);

        // Create local previews immediately
        const objectUrls = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...objectUrls]);

        await startUpload(files);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        handleFiles(files);
    }, [previews]);

    const onPaste = useCallback((e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                if (file) files.push(file);
            }
        }
        if (files.length > 0) {
            e.preventDefault();
            handleFiles(files);
        }
    }, [previews]);

    const removeImage = (index: number) => {
        const urlToRemove = displayImages[index];
        if (urlToRemove.startsWith('blob:')) {
            setPreviews(prev => prev.filter(p => p !== urlToRemove));
        } else {
            onChange(value.filter(p => p !== urlToRemove));
        }
    };

    return (
        <div
            onPaste={onPaste}
            tabIndex={0}
            style={{ outline: 'none' }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                }}
            >
                {displayImages.map((url, index) => (
                    <div
                        key={url + index}
                        style={{
                            position: 'relative',
                            aspectRatio: '1',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#111'
                        }}
                    >
                        <img
                            src={url}
                            alt={`Preview ${index}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                opacity: url.startsWith('blob:') ? 0.5 : 1
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                zIndex: 2
                            }}
                        >
                            ×
                        </button>
                        {url.startsWith('blob:') && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#ff6b00', fontWeight: 'bold' }}>
                                Uploading...
                            </div>
                        )}
                    </div>
                ))}

                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => document.getElementById('multi-image-input')?.click()}
                    style={{
                        border: `2px dashed ${isDragOver ? '#ff6b00' : '#333'}`,
                        borderRadius: '8px',
                        aspectRatio: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isDragOver ? 'rgba(255,107,0,0.05)' : '#0a0a0a',
                        color: '#666',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>+</span>
                    <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Add Image</span>
                    <input
                        id="multi-image-input"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files) handleFiles(Array.from(e.target.files));
                        }}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#666' }}>
                Drag & drop or <span style={{ color: 'var(--accent)' }}>Paste (Ctrl+V)</span> multiple images here.
                The first image will be used as the main thumbnail.
            </p>
        </div>
    );
}
