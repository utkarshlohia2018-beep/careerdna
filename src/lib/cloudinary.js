// Cloudinary upload helper

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'careerdna_uploads'

// Upload any file to Cloudinary
export async function uploadToCloudinary(file, options = {}) {
  if (!CLOUD_NAME || CLOUD_NAME === 'your_cloudinary_cloud_name') {
    throw new Error('Cloudinary not configured. Please add credentials to your .env file.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', options.folder || 'careerdna')

  if (options.resourceType === 'video') {
    formData.append('resource_type', 'video')
  }

  const resourceType = options.resourceType || 'image'
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed. Please try again.')
  }

  const data = await response.json()
  return {
    url: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    duration: data.duration, // for videos
    thumbnail: data.resource_type === 'video'
      ? `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0/${data.public_id}.jpg`
      : null,
  }
}

// Upload profile image
export async function uploadProfileImage(file) {
  return uploadToCloudinary(file, {
    folder: 'careerdna/profiles',
    resourceType: 'image',
  })
}

// Upload project video
export async function uploadVideo(file) {
  return uploadToCloudinary(file, {
    folder: 'careerdna/videos',
    resourceType: 'video',
  })
}

// Upload project thumbnail/screenshot
export async function uploadProjectImage(file) {
  return uploadToCloudinary(file, {
    folder: 'careerdna/projects',
    resourceType: 'image',
  })
}

// Get optimized image URL with transformations
export function getOptimizedImageUrl(publicId, options = {}) {
  const { width = 400, height = 400, crop = 'fill', quality = 'auto' } = options
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop},q_${quality}/${publicId}`
}
