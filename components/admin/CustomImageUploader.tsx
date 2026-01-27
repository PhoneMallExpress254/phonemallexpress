'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUploadThing } from '@/lib/uploadthing';

interface CustomImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
}

export default function CustomImageUploader({ value, onChange }: CustomImageUploaderProps) {
    const [preview, setPreview] = useState(value);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);

    const { startUpload } = useUploadThing("productImage", {
        onClientUploadComplete: (res) => {
            if (res && res[0]) {
                const url = res[0].url;
                setPreview(url);
                onChange(url);
                setUploading(false);
            }
        },
        onUploadError: () => {
            setUploading(false);
            alert("Upload failed");
        },
    });

    useEffect(() => {
        setPreview(value);
    }, [value]);

    const handleFiles = async (files: File[]) => {
        if (files.length === 0) return;
        setUploading(true);
        // Create local preview immediately
        const objectUrl = URL.createObjectURL(files[0]);
        setPreview(objectUrl);

        await startUpload(files);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, []);

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
    }, []);

    if (preview) {
        return (
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px', aspectRatio: '1', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                <img src={preview} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <button
                    type="button"
                    onClick={() => {
                        onChange('');
                        setPreview('');
                    }}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                    }}
                >
                    ×
                </button>
                {uploading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        Uploading...
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onPaste={onPaste}
            tabIndex={0}
            style={{
                border: `2px dashed ${isDragOver ? 'var(--accent)' : '#333'}`,
                borderRadius: '12px',
                padding: '3rem 1rem',
                textAlign: 'center',
                background: isDragOver ? 'rgba(var(--accent-rgb), 0.05)' : '#0a0a0a',
                color: '#888',
                transition: 'all 0.2s',
                cursor: 'pointer',
                outline: 'none'
            }}
        >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>☁️</div>
            <p style={{ fontWeight: 'bold', color: '#ccc', marginBottom: '0.5rem' }}>
                Drag & Drop or <span style={{ color: 'var(--accent)' }}>Ctrl+V</span> to Paste
            </p>
            <p style={{ fontSize: '0.8rem' }}>Supports JPG, PNG, WEBP (Max 4MB)</p>

            {uploading && <p style={{ marginTop: '1rem', color: 'var(--accent)' }}>Uploading...</p>}
        </div>
    );
}
