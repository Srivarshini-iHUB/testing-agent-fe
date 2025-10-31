// src/components/e2e/TestCasesPreviewModal.jsx
import { useState } from 'react';

const TestCasesPreviewModal = ({ isOpen, onClose, testCasesPreview, onUpdate }) => {
  if (!isOpen) return null;

  const getFieldValue = (tc, field) => {
    if (field === 'test_steps') {
      return Array.isArray(tc.test_steps) ? tc.test_steps.join('; ') : (tc.test_steps || '');
    }
    if (field === 'test_data') {
      return Array.isArray(tc.test_data) ? tc.test_data.join('; ') : (tc.test_data || '');
    }
    return tc[field] || '';
  };

  const handleFieldChange = (idx, field, value) => {
    onUpdate(idx, field, value);
  };

  const isMatched = (tc) => tc.edited_route || tc.matched_route;

  const rowClass = (tc) => isMatched(tc) ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20';

  const routeClass = (tc) => isMatched(tc) ? 'bg-green-100 dark:bg-green-900 text-green-800' : 'bg-orange-100 dark:bg-orange-900 text-orange-800';

  const EditableCell = ({ idx, field, value, multiLine = false, widthClass = '' }) => (
    <div
      contentEditable={true}
      suppressContentEditableWarning={true}
      onBlur={(e) => handleFieldChange(idx, field, e.target.innerText)}
      className={`w-full min-h-[20px] ${multiLine ? 'whitespace-pre-wrap leading-relaxed' : 'whitespace-nowrap'} px-2 py-1 text-sm text-gray-900 dark:text-gray-300 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${widthClass}`}
      dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, '<br>') }}
    />
  );

const downloadAsCSV = () => {
  const headers = [
    'Test Case ID',
    'Feature Name',
    'Test Scenario',
    'Test Type',
    'Preconditions',
    'Test Steps',
    'Test Data',
    'Expected Result', // merged Expected Result + Edited Route
    'Priority',
    'Automation Status'
  ];

  const csvRows = testCasesPreview.map((tc, idx) => {
    const expectedResult = `${getFieldValue(tc, 'expected_result') || ''}${
      tc.edited_route ? `; ${tc.edited_route}` : ''
    }`;

    return [
      tc.testcase_id || 'N/A',
      tc.feature_name || 'Unnamed Feature',
      getFieldValue(tc, 'test_scenario'),
      tc.test_type || 'N/A',
      (getFieldValue(tc, 'preconditions') || '').replace(/\n/g, '; '),
      (getFieldValue(tc, 'test_steps') || '').replace(/\n/g, '; '),
      getFieldValue(tc, 'test_data') || 'N/A',
      expectedResult.replace(/\n/g, '; '), // merged field
      tc.priority || 'N/A',
      tc.automation_status || 'N/A'
    ];
  });

  const csvContent = [
    headers.join(','),
    ...csvRows.map(row =>
      row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `test-cases-preview-${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Editable Test Cases Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        {/* Content - Scrollable Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-sm text-gray-600 mb-4">
            Click on editable cells to modify content directly. Auto-matched routes are highlighted. Only matched/edited cases will be included in the script.
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 table-auto">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Test Case ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Feature Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700 w-32">Test Scenario</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Test Type</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700 w-40">Preconditions</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700 w-64">Test Steps</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700 w-32">Test Data</th>
                  <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700 w-[500px]">Expected Result & Route</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Priority</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700">Automation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {testCasesPreview.map((tc, idx) => (
                  <tr key={idx} className={rowClass(tc)}>
                    <td className="px-3 py-4 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{tc.testcase_id || 'N/A'}</td>
                    <td className="px-3 py-4 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{tc.feature_name || 'Unnamed Feature'}</td>
                    <td className="px-3 py-4 border border-gray-200 dark:border-gray-700 w-32">
                      <EditableCell idx={idx} field="test_scenario" value={getFieldValue(tc, 'test_scenario')} />
                    </td>
                    <td className="px-3 py-4 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{tc.test_type || 'N/A'}</td>
                    <td className="px-3 py-4 border border-gray-200 dark:border-gray-700 w-40">
                      <EditableCell idx={idx} field="preconditions" value={getFieldValue(tc, 'preconditions')} multiLine={true} />
                    </td>
                    <td className="px-3 py-4 border border-gray-200 dark:border-gray-700 w-64">
                      <EditableCell idx={idx} field="test_steps" value={getFieldValue(tc, 'test_steps')} multiLine={true} />
                    </td>
                    <td className="px-3 py-4 border border-gray-200 dark:border-gray-700 w-32">
                      <EditableCell idx={idx} field="test_data" value={getFieldValue(tc, 'test_data')} />
                    </td>
                    <td className="px-8 py-4 text-sm border border-gray-200 dark:border-gray-700 w-[500px]">
                      <div className="mb-2">
                        <EditableCell idx={idx} field="expected_result" value={getFieldValue(tc, 'expected_result')} multiLine={true} />
                      </div>
                      <div className={`${routeClass(tc)} p-2 rounded mb-0`}>
                        <EditableCell idx={idx} field="edited_route" value={getFieldValue(tc, 'edited_route')} />
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{tc.priority || 'N/A'}</td>
                    <td className="px-3 py-4 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{tc.automation_status || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={downloadAsCSV}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Download as CSV
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCasesPreviewModal;