// File: src/pages/Integration_agent.jsx (or adjust path as needed)

import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const IntegrationTestingAgent = () => {
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collectionData, setCollectionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE_URL = "https://api.getpostman.com";

  const verifyAndListCollections = async (apiKey) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BASE_URL}/collections`, {
        headers: { "X-Api-Key": apiKey },
      });
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
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
    try {
      const response = await fetch(`${BASE_URL}/collections/${collectionUid}`, {
        headers: { "X-Api-Key": apiKey },
      });
      if (response.ok) {
        const data = await response.json();
        setCollectionData(data.collection);
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Integration Testing Agent
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Connect to Postman and export your API collections for integration testing.
        </p>
      </div>

      {/* API Key Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Postman API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Enter your Postman API Key"
        />
        <button
          onClick={handleConnect}
          disabled={loading}
          className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Connect and Load Collections"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Collections Selector */}
      {collections.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Select Collection to Export</h3>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Choose a collection...</option>
            {collections.map((coll) => (
              <option key={coll.uid} value={coll.uid}>
                {coll.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleExport}
            disabled={loading || !selectedCollection}
            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Exporting..." : "Export Collection JSON"}
          </button>
        </div>
      )}

      {/* Download and Preview */}
      {collectionData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Collection Exported</h3>
          <button
            onClick={() => downloadJson(collectionData, `${collections.find(c => c.uid === selectedCollection)?.name.replace(/\s+/g, '_')}.json`)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mb-4"
          >
            Download JSON
          </button>
          <details className="mb-4">
            <summary className="cursor-pointer text-blue-600">Preview (first 500 chars)</summary>
            <pre className="mt-2 text-sm overflow-auto max-h-40">
              {JSON.stringify(collectionData, null, 2).substring(0, 500)}...
            </pre>
          </details>
        </div>
      )}

      <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
        Generate your API key at <a href="https://go.postman.co/settings/me/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Postman Settings</a>.
      </div>
    </div>
  );
};

export default IntegrationTestingAgent;