import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { CheckCircle, AlertCircle, Download, ExternalLink, Key, Database, FileJson, Loader2, Upload, FileText } from "lucide-react";

const IntegrationTestingAgent = () => {
  const { theme } = useTheme();
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collectionData, setCollectionData] = useState(null);
  const [swaggerFile, setSwaggerFile] = useState(null);
  const [swaggerContent, setSwaggerContent] = useState(null);
  const [postmanFile, setPostmanFile] = useState(null);
  const [frdFile, setFrdFile] = useState(null);
  const [frdContent, setFrdContent] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUploadPostman = async () => {
    if (postmanFile) {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const text = await postmanFile.text();
        const json = JSON.parse(text);
        setCollectionData(json);
        setSuccess("Postman collection uploaded and loaded successfully!");
      } catch (e) {
        setError(`Failed to load Postman file: ${e.message}`);
      }
      setLoading(false);
    } else {
      setError("Please select a Postman JSON file to upload.");
    }
  };

  const handleUploadSwagger = async () => {
    if (swaggerFile) {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const text = await swaggerFile.text();
        setSwaggerContent(text);
        setSuccess("Swagger YAML uploaded successfully!");
      } catch (e) {
        setError(`Failed to load Swagger file: ${e.message}`);
      }
      setLoading(false);
    } else {
      setError("Please select a Swagger YAML file to upload.");
    }
  };

  const handleUploadFRD = async () => {
    if (frdFile) {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const text = await frdFile.text();
        setFrdContent(text);
        setSuccess("FRD document uploaded successfully!");
      } catch (e) {
        setError(`Failed to load FRD file: ${e.message}`);
      }
      setLoading(false);
    } else {
      setError("Please select an FRD document file to upload.");
    }
  };

  const handleGenerate = () => {
    if (collectionData) {
      setLoading(true);
      setError("");
      setSuccess("");
      // Mock generate for now (assume it uses collectionData, swaggerContent, frdContent)
      // In future, post to backend /generate endpoint with { collection: collectionData, swagger: swaggerContent, frd: frdContent }
      // For mock, just set generatedData to collectionData
      setGeneratedData(collectionData);
      setSuccess("Generation completed successfully (mock)!");
      setLoading(false);
    } else {
      setError("Please load a Postman collection first.");
    }
  };

  const handleRun = async () => {
    if (generatedData) {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const response = await fetch("/api/integrations/postman/run-collection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collection: generatedData }),
        });
        if (response.ok) {
          const data = await response.json();
          setReport(data);
          setSuccess("Collection run successfully!");
        } else {
          const errData = await response.json();
          setError(errData.detail || `Error: ${response.status} - ${response.statusText}`);
        }
      } catch (e) {
        setError(`Request failed: ${e.message}`);
      }
      setLoading(false);
    } else {
      setError("Please generate first.");
    }
  };

  const handleDownloadPDF = async () => {
    if (report) {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const response = await fetch("/api/integrations/postman/generate-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ report }),
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "api_test_report.pdf";
          a.click();
          URL.revokeObjectURL(url);
          setSuccess("PDF downloaded successfully!");
        } else {
          const errData = await response.text();
          setError(errData || `Error: ${response.status} - ${response.statusText}`);
        }
      } catch (e) {
        setError(`Request failed: ${e.message}`);
      }
      setLoading(false);
    } else {
      setError("Please run the collection first.");
    }
  };

  const downloadJson = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg mb-4">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Integration Testing Agent
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload collections, Swagger, FRD, generate, run tests, and download reports.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg shadow-sm animate-in slide-in-from-top">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg shadow-sm animate-in slide-in-from-top">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 dark:text-green-300">{success}</p>
            </div>
          </div>
        )}

        {/* Upload Postman Collection JSON */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upload Postman Collection JSON
            </h2>
          </div>
          <div className="space-y-4">
            <input
              type="file"
              accept=".json"
              onChange={(e) => setPostmanFile(e.target.files[0])}
              className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all outline-none"
            />
            <button
              onClick={handleUploadPostman}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Load Uploaded Collection
                </>
              )}
            </button>
          </div>
        </div>

        {/* Upload Swagger YAML */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upload Swagger YAML
            </h2>
          </div>
          <div className="space-y-4">
            <input
              type="file"
              accept=".yaml,.yml"
              onChange={(e) => setSwaggerFile(e.target.files[0])}
              className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all outline-none"
            />
            <button
              onClick={handleUploadSwagger}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Load Swagger YAML
                </>
              )}
            </button>
          </div>
        </div>

        {/* Upload FRD Document */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upload FRD Document
            </h2>
          </div>
          <div className="space-y-4">
            <input
              type="file"
              accept=".txt,.doc,.docx,.pdf"
              onChange={(e) => setFrdFile(e.target.files[0])}
              className="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all outline-none"
            />
            <button
              onClick={handleUploadFRD}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Load FRD Document
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generate Card */}
        {collectionData && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Generate
              </h2>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Generate (Mock)
                </>
              )}
            </button>
          </div>
        )}

        {/* Generated Data Preview and Run */}
        {generatedData && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Generated Data Ready
              </h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleRun}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5" />
                    Run Collection
                  </>
                )}
              </button>

              <details className="group">
                <summary className="cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FileJson className="w-4 h-4" />
                    Preview Generated Data (Mock Display)
                  </span>
                  <svg className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 p-4 bg-gray-900 dark:bg-gray-950 rounded-xl overflow-auto">
                  <pre className="text-sm text-green-400 font-mono">
                    {JSON.stringify(generatedData, null, 2).substring(0, 500)}...
                  </pre>
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Report Preview and Download PDF */}
        {report && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Report Ready
              </h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleDownloadPDF}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download PDF Report
                  </>
                )}
              </button>

              <details className="group">
                <summary className="cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FileJson className="w-4 h-4" />
                    Preview Report JSON
                  </span>
                  <svg className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 p-4 bg-gray-900 dark:bg-gray-950 rounded-xl overflow-auto">
                  <pre className="text-sm text-green-400 font-mono">
                    {JSON.stringify(report, null, 2).substring(0, 500)}...
                  </pre>
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Collection Download if needed */}
        {collectionData && !generatedData && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Collection Ready
              </h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => downloadJson(collectionData, `collection.json`)}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Collection JSON
              </button>

              <details className="group">
                <summary className="cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FileJson className="w-4 h-4" />
                    Preview Collection Data
                  </span>
                  <svg className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 p-4 bg-gray-900 dark:bg-gray-950 rounded-xl overflow-auto">
                  <pre className="text-sm text-green-400 font-mono">
                    {JSON.stringify(collectionData, null, 2).substring(0, 500)}...
                  </pre>
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 border border-orange-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <ExternalLink className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Questions?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                Upload your files to get started with integration testing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationTestingAgent;