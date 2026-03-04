const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multer = require("multer");
const path = require("path");

// Configure the S3 Client for Backblaze B2
const s3 = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION,
    credentials: {
        accessKeyId: process.env.B2_ACCESS_KEY_ID,
        secretAccessKey: process.env.B2_SECRET_ACCESS_KEY,
    },
});

// Setup multer memory storage (we upload buffer directly to B2)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB limit
});

// Upload function to B2
const uploadToB2 = async (fileBuffer, originalName, folder = 'products') => {
    const fileExt = path.extname(originalName);
    const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

    // Using @aws-sdk/lib-storage Upload for multipart upload support (good for large files)
    const parallelUploads3 = new Upload({
        client: s3,
        params: {
            Bucket: process.env.B2_BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer,
            // B2 handles ContentType automatically usually, or we can guess. We'll skip setting it strictly to let B2 infer or it will be generic binary. 
            // It's better to pass it if we have it, but for our utility we assume binary stream if not provided.
        },
        // tags: [...], // optional tags
        queueSize: 4, // optional concurrency configuration
        partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
        leavePartsOnError: false, // optional manually handle dropped parts
    });

    // Event listener for progress - unfortunately this progress happens on the backend.
    // The frontend needs progress for the initial upload to the backend. We'll handle that via XHR/Axios in the frontend.
    // parallelUploads3.on("httpUploadProgress", (progress) => { ... });

    await parallelUploads3.done();

    // Return the public URL
    // Format for B2 public URL: https://f005.backblazeb2.com/file/<bucket-name>/<file-name>
    // Or using the endpoint if it's uniquely formatted, e.g., https://s3.us-east-005.backblazeb2.com/bigezo/<file-name>
    // Actually, B2 S3 public URL format is: https://<bucketName>.s3.<region>.backblazeb2.com/<Key>
    return `https://${process.env.B2_BUCKET_NAME}.s3.${process.env.B2_REGION}.backblazeb2.com/${fileName}`;
};

module.exports = {
    upload,
    uploadToB2,
};
