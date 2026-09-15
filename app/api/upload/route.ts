import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const uploadType = (formData.get('type') as string) || 'resume'; // 'resume' | 'logo' | 'document'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file payload provided in request.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed limit of 5MB.' },
        { status: 400 }
      );
    }

    // Validate extension
    const fileName = file.name || 'uploaded_file';
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];

    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type '${extension}'. Allowed extensions: ${allowedExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate safe file identifier and URL
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const sanitizedFileName = `${fileId}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    
    // Construct public accessible URL for demo / dev environments
    const publicUrl = `/uploads/${uploadType}s/${sanitizedFileName}`;

    return NextResponse.json({
      success: true,
      fileId,
      originalName: fileName,
      sanitizedFileName,
      sizeBytes: file.size,
      mimeType: file.type || 'application/octet-stream',
      url: publicUrl,
      uploadedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'File upload failed.' },
      { status: 500 }
    );
  }
}
