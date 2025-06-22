// app/api/upload-bill/route.js
import cloudinary from '@/utils/cloudinary';

export async function POST(req) {
  try {
    const { imageData } = await req.json(); // base64 data from html2canvas

    const uploadResponse = await cloudinary.uploader.upload(imageData, {
      folder: 'bills',
    });

    return new Response(JSON.stringify({ url: uploadResponse.secure_url }), {
      status: 200,
    });
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
    });
  }
}
