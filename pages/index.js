import { useState, useEffect } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function fetchUploadedFiles() {
      try {
        const response = await fetch('/api/metadata');
        if (response.ok) {
          const data = await response.json();
          setUploadedFiles(data);
        }
      } catch (error) {
        console.error("Failed to load uploaded files:", error);
      }
    }
    fetchUploadedFiles();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!['application/pdf', 'image/png', 'image/jpeg'].includes(selectedFile.type)) {
        setError('Please upload a valid PDF or image file.');
        setFile(null);
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File size exceeds the limit of 5 MB.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response from server:", errorResponse);
        setError(`Upload failed: ${errorResponse.error}`);
        return;
      }

      const result = await response.json();
      setUploadedFiles((prev) => [...prev, result]);
      setFile(null); // Clear the selected file
      setSuccessMessage("File uploaded successfully!"); // Show success message

      // Clear the file input after upload
      document.getElementById("fileInput").value = null;
      
      // Clear success message after a few seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setError('Failed to upload file. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-200 via-white to-purple-200">
      {/* Header */}
      <header className="bg-purple-600 text-white py-4 shadow-lg">
        <div className="container mx-auto text-center font-bold text-2xl">
        File Upload & Storage Platform
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-6 flex flex-col items-center">
        {/* Upload Section */}
        <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-xl mb-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Upload a File</h1>

          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            className="w-full text-gray-700 mb-4 px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={handleUpload}
            className={`w-full p-3 rounded-md font-semibold text-white ${file ? 'bg-purple-500 hover:bg-purple-600' : 'bg-purple-300 cursor-not-allowed'}`}
            disabled={!file}
          >
            Upload File
          </button>

          {successMessage && <p className="text-green-500 text-sm mt-2 text-center">{successMessage}</p>}
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>

        {/* Uploaded Files Section */}
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Uploaded Files</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {uploadedFiles.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No files uploaded yet.</p>
          ) : (
            uploadedFiles.map((fileData, index) => (
              <div
                key={index}
                className="flex flex-col bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {/* Link embedded with file name */}
                <a
                  href={fileData.uniqueLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {fileData.filename}
                </a>

                <p className="text-gray-500 text-sm break-all mt-1">
                <span className="text-gray-500">Unique Link: </span>
                  <a
                    href={fileData.uniqueLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:text-blue-600 hover:underline"
                  >
                    {fileData.uniqueLink}
                  </a>
                </p>

                <div className="mt-4 flex justify-between">
                  <a
                    href={fileData.uniqueLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-500 hover:text-purple-700 font-medium"
                  >
                    View
                  </a>

                  <a
                    href={fileData.uniqueLink}
                    download={fileData.filename}
                    className="text-green-500 hover:text-green-700 font-medium"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-purple-600 text-white py-4 mt-8">
  <div className="container mx-auto text-center text-sm font-bold text-3xl">
    Made By Rohitth Chennupalli
  </div>
</footer>
    </div>
  );
}
