import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { CheckCircle, AlertCircle, Download, ExternalLink, Key, Database, FileJson, Loader2 } from "lucide-react";

const IntegrationTestingAgent = () => {
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collectionData, setCollectionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const BASE_URL = "https://api.getpostman.com";

  const verifyAndListCollections = async (apiKey) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${BASE_URL}/collections`, {
        headers: { "X-Api-Key": apiKey },
      });
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
        setSuccess(`Successfully connected! Found ${data.collections?.length || 0} collections.`);
      } else if (response.status === 401) {
        setError("Invalid API key. Please check and try again.");
      } else {
        setError(`Error: ${response.status} - ${response.statusText}`);
      }
    } catch (e) {
      setError(`Request failed: ${e.message}`);
    }
    setLoading(false);
  };

  const fetchCollection = async (apiKey, collectionUid) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${BASE_URL}/collections/${collectionUid}`, {
        headers: { "X-Api-Key": apiKey },
      });
      if (response.ok) {
        const data = await response.json();
        setCollectionData(data.collection);
        setSuccess("Collection exported successfully!");
      } else {
        setError(`Error fetching collection: ${response.status} - ${response.statusText}`);
      }
    } catch (e) {
      setError(`Request failed: ${e.message}`);
    }
    setLoading(false);
  };

  const handleConnect = () => {
    if (apiKey) {
      verifyAndListCollections(apiKey);
    } else {
      setError("Please enter an API key.");
    }
  };

  const handleExport = () => {
    if (selectedCollection) {
      fetchCollection(apiKey, selectedCollection);
    } else {
      setError("Please select a collection.");
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
            Seamlessly connect to Postman and export your API collections for comprehensive integration testing.
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

        {/* API Key Input Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Key className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Postman API Key
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-4 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all outline-none"
                placeholder="Enter your Postman API Key"
                onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
              />
              <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Connect and Load Collections
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collections Selector Card */}
        {collections.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Collection
              </h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full p-4 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="">Choose a collection...</option>
                  {collections.map((coll) => (
                    <option key={coll.uid} value={coll.uid}>
                      {coll.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <button
                onClick={handleExport}
                disabled={loading || !selectedCollection}
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileJson className="w-5 h-5" />
                    Export Collection JSON
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Download and Preview Card */}
        {collectionData && (
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
                onClick={() => downloadJson(collectionData, `${collections.find(c => c.uid === selectedCollection)?.name.replace(/\s+/g, '_')}.json`)}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download JSON File
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
                Need an API Key?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                Generate your API key from your Postman account settings.
              </p>
              <a
                href="https://go.postman.co/settings/me/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium text-sm transition-colors"
              >
                Go to Postman Settings
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationTestingAgent;