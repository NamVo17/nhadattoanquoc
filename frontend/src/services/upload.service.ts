const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.url as string;
  },

  uploadMultiple: async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map((file) => uploadService.uploadImage(file));
    return Promise.all(uploadPromises);
  },
};
