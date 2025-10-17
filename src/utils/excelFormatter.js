import * as XLSX from 'xlsx';

/**
 * Format test cases and generate Excel file on frontend
 */
export class ExcelFormatter {
  /**
   * Create and download Excel file from test cases
   * @param {Array} testCases - Array of test case objects
   * @param {string} filename - Optional filename
   */
  static downloadExcel(testCases, filename = 'test_cases.xlsx') {
    if (!testCases || testCases.length === 0) {
      console.error('No test cases to export');
      return;
    }

    // Prepare data for Excel
    const data = testCases.map(tc => ({
      'Test Case ID': tc.test_case_id || '',
      'Feature Name': tc.feature_name || '',
      'Test Scenario': tc.test_scenario || '',
      'Test Type': tc.test_type || '',
      'Preconditions': tc.preconditions || '',
      'Test Steps': tc.test_steps || '',
      'Test Data': tc.test_data || '',
      'Expected Result': tc.expected_result || '',
      'Priority': tc.priority || '',
      'Automation Status': tc.automation_status || ''
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const columnWidths = [
      { wch: 18 },  // Test Case ID
      { wch: 25 },  // Feature Name
      { wch: 40 },  // Test Scenario
      { wch: 15 },  // Test Type
      { wch: 30 },  // Preconditions
      { wch: 60 },  // Test Steps
      { wch: 30 },  // Test Data
      { wch: 40 },  // Expected Result
      { wch: 12 },  // Priority
      { wch: 18 }   // Automation Status
    ];
    worksheet['!cols'] = columnWidths;

    // Apply styles to header row (first row)
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      // Header styling
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true }
      };
    }

    // Apply text wrap to all cells
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue;
        
        worksheet[cellAddress].s = {
          ...worksheet[cellAddress].s,
          alignment: { vertical: "top", wrapText: true }
        };
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Cases');

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Create Excel with multiple sheets
   * @param {Object} result - Complete test case generation result
   */
  static downloadDetailedExcel(result, filename = 'test_cases_detailed.xlsx') {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Test Cases
    if (result.test_cases && result.test_cases.test_cases) {
      const testCaseData = result.test_cases.test_cases.map(tc => ({
        'Test Case ID': tc.test_case_id || '',
        'Feature Name': tc.feature_name || '',
        'Test Scenario': tc.test_scenario || '',
        'Test Type': tc.test_type || '',
        'Preconditions': tc.preconditions || '',
        'Test Steps': tc.test_steps || '',
        'Test Data': tc.test_data || '',
        'Expected Result': tc.expected_result || '',
        'Priority': tc.priority || '',
        'Automation Status': tc.automation_status || ''
      }));

      const testCaseSheet = XLSX.utils.json_to_sheet(testCaseData);
      testCaseSheet['!cols'] = [
        { wch: 18 }, { wch: 25 }, { wch: 40 }, { wch: 15 }, { wch: 30 },
        { wch: 60 }, { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 18 }
      ];
      XLSX.utils.book_append_sheet(workbook, testCaseSheet, 'Test Cases');
    }

    // Sheet 2: Summary
    const summaryData = [
      { Metric: 'Total Features', Value: result.extraction?.total_features || 0 },
      { Metric: 'Total User Stories', Value: result.extraction?.total_stories || 0 },
      { Metric: 'Features Mapped', Value: result.analysis?.total_features_mapped || 0 },
      { Metric: 'Total Test Cases', Value: result.test_cases?.total_test_cases || 0 },
      { Metric: 'Coverage Percentage', Value: `${result.test_cases?.coverage_percentage || 0}%` },
      { Metric: 'Summary', Value: result.test_cases?.summary || '' }
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 3: Feature Mappings
    if (result.analysis && result.analysis.feature_mappings) {
      const mappingData = result.analysis.feature_mappings.map(m => ({
        'Feature Name': m.feature_name || '',
        'FRD Reference': m.frd_reference || '',
        'User Story Reference': m.user_story_reference || '',
        'Feature Flow': m.feature_flow || '',
        'Functions Covered': (m.functions_covered || []).join(', '),
        'Is Complete': m.is_complete ? 'Yes' : 'No'
      }));

      const mappingSheet = XLSX.utils.json_to_sheet(mappingData);
      mappingSheet['!cols'] = [
        { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 50 }, { wch: 40 }, { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(workbook, mappingSheet, 'Feature Mappings');
    }

    // Generate and download
    XLSX.writeFile(workbook, filename);
  }
}
