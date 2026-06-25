import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';
import { createElement } from 'react';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  header: { marginBottom: 24 },
  churchName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1d4ed8', marginBottom: 4 },
  reportTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  subTitle: { fontSize: 9, color: '#6b7280' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginVertical: 12 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryBox: { flex: 1, padding: 10, borderRadius: 6, borderWidth: 1 },
  summaryLabel: { fontSize: 8, marginBottom: 4 },
  summaryValue: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 6, color: '#374151' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: '6 8', marginBottom: 1 },
  tableRow: { flexDirection: 'row', padding: '5 8', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tableRowAlt: { flexDirection: 'row', padding: '5 8', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: '#fafafa' },
  col1: { flex: 1 },
  col2: { width: 100, textAlign: 'right' },
  bold: { fontFamily: 'Helvetica-Bold' },
  totalRow: { flexDirection: 'row', padding: '6 8', backgroundColor: '#f9fafb', borderTopWidth: 1, borderTopColor: '#d1d5db' },
  section: { marginBottom: 16 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#9ca3af' },
});

const fmt = (n: number) => `R ${Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

function IncomeStatementPDF({ data, period }: { data: any; period: string }) {
  return createElement(Document, {},
    createElement(Page, { size: 'A4', style: styles.page },
      // Header
      createElement(View, { style: styles.header },
        createElement(Text, { style: styles.churchName }, 'Grace Community Church'),
        createElement(Text, { style: styles.reportTitle }, data.report_type || 'Income Statement'),
        createElement(Text, { style: styles.subTitle }, period),
      ),
      createElement(View, { style: styles.divider }),

      // Summary boxes
      createElement(View, { style: styles.summaryRow },
        createElement(View, { style: { ...styles.summaryBox, backgroundColor: '#f0fdf4', borderColor: '#86efac' } },
          createElement(Text, { style: { ...styles.summaryLabel, color: '#16a34a' } }, 'TOTAL INCOME'),
          createElement(Text, { style: { ...styles.summaryValue, color: '#15803d' } }, fmt(data.summary?.total_income)),
        ),
        createElement(View, { style: { ...styles.summaryBox, backgroundColor: '#fef2f2', borderColor: '#fca5a5' } },
          createElement(Text, { style: { ...styles.summaryLabel, color: '#dc2626' } }, 'TOTAL EXPENSES'),
          createElement(Text, { style: { ...styles.summaryValue, color: '#b91c1c' } }, fmt(data.summary?.total_expenses)),
        ),
        createElement(View, { style: { ...styles.summaryBox, backgroundColor: '#eff6ff', borderColor: '#93c5fd' } },
          createElement(Text, { style: { ...styles.summaryLabel, color: '#2563eb' } }, 'NET INCOME'),
          createElement(Text, { style: { ...styles.summaryValue, color: data.summary?.net_income >= 0 ? '#1d4ed8' : '#ea580c' } },
            fmt(data.summary?.net_income)),
        ),
      ),

      // Income table
      createElement(View, { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, 'INCOME BY CATEGORY'),
        createElement(View, { style: styles.tableHeader },
          createElement(Text, { style: { ...styles.col1, ...styles.bold } }, 'Category'),
          createElement(Text, { style: { ...styles.col2, ...styles.bold } }, 'Amount'),
        ),
        ...(data.income || []).map((item: any, i: number) =>
          createElement(View, { key: i, style: i % 2 === 0 ? styles.tableRow : styles.tableRowAlt },
            createElement(Text, { style: styles.col1 }, item.category),
            createElement(Text, { style: { ...styles.col2, color: '#16a34a' } }, fmt(item.amount)),
          )
        ),
        createElement(View, { style: styles.totalRow },
          createElement(Text, { style: { ...styles.col1, ...styles.bold } }, 'Total Income'),
          createElement(Text, { style: { ...styles.col2, ...styles.bold, color: '#15803d' } }, fmt(data.summary?.total_income)),
        ),
      ),

      // Expenses table
      createElement(View, { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, 'EXPENSES BY CATEGORY'),
        createElement(View, { style: styles.tableHeader },
          createElement(Text, { style: { ...styles.col1, ...styles.bold } }, 'Category'),
          createElement(Text, { style: { ...styles.col2, ...styles.bold } }, 'Amount'),
        ),
        ...(data.expenses || []).map((item: any, i: number) =>
          createElement(View, { key: i, style: i % 2 === 0 ? styles.tableRow : styles.tableRowAlt },
            createElement(Text, { style: styles.col1 }, item.category),
            createElement(Text, { style: { ...styles.col2, color: '#dc2626' } }, fmt(item.amount)),
          )
        ),
        createElement(View, { style: styles.totalRow },
          createElement(Text, { style: { ...styles.col1, ...styles.bold } }, 'Total Expenses'),
          createElement(Text, { style: { ...styles.col2, ...styles.bold, color: '#b91c1c' } }, fmt(data.summary?.total_expenses)),
        ),
      ),

      createElement(Text, { style: styles.footer }, `Generated ${new Date().toLocaleString()} · Church Financial Reporting System`),
    )
  );
}

function MonthlyComparisonPDF({ data, year }: { data: any; year: number }) {
  return createElement(Document, {},
    createElement(Page, { size: 'A4', style: styles.page },
      createElement(View, { style: styles.header },
        createElement(Text, { style: styles.churchName }, 'Grace Community Church'),
        createElement(Text, { style: styles.reportTitle }, 'Monthly Comparison Report'),
        createElement(Text, { style: styles.subTitle }, `Year ${year}`),
      ),
      createElement(View, { style: styles.divider }),
      createElement(View, { style: styles.tableHeader },
        createElement(Text, { style: { width: 80, ...styles.bold } }, 'Month'),
        createElement(Text, { style: { flex: 1, textAlign: 'right', ...styles.bold } }, 'Income'),
        createElement(Text, { style: { flex: 1, textAlign: 'right', ...styles.bold } }, 'Expenses'),
        createElement(Text, { style: { flex: 1, textAlign: 'right', ...styles.bold } }, 'Net'),
      ),
      ...(data.months || []).map((m: any, i: number) =>
        createElement(View, { key: i, style: i % 2 === 0 ? styles.tableRow : styles.tableRowAlt },
          createElement(Text, { style: { width: 80 } }, m.month),
          createElement(Text, { style: { flex: 1, textAlign: 'right', color: '#16a34a' } }, fmt(m.income)),
          createElement(Text, { style: { flex: 1, textAlign: 'right', color: '#dc2626' } }, fmt(m.expenses)),
          createElement(Text, { style: { flex: 1, textAlign: 'right', color: m.net >= 0 ? '#1d4ed8' : '#ea580c' } }, fmt(m.net)),
        )
      ),
      createElement(View, { style: styles.totalRow },
        createElement(Text, { style: { width: 80, ...styles.bold } }, 'TOTAL'),
        createElement(Text, { style: { flex: 1, textAlign: 'right', ...styles.bold, color: '#15803d' } }, fmt(data.totals?.income)),
        createElement(Text, { style: { flex: 1, textAlign: 'right', ...styles.bold, color: '#b91c1c' } }, fmt(data.totals?.expenses)),
        createElement(Text, { style: { flex: 1, textAlign: 'right', ...styles.bold } }, fmt(data.totals?.net)),
      ),
      createElement(Text, { style: styles.footer }, `Generated ${new Date().toLocaleString()} · Church Financial Reporting System`),
    )
  );
}

export async function downloadReportPDF(reportData: any, reportType: string, period: string, year: number) {
  let doc;
  if (reportType === 'monthly-comparison') {
    doc = createElement(MonthlyComparisonPDF, { data: reportData, year });
  } else {
    doc = createElement(IncomeStatementPDF, { data: reportData, period });
  }
  const blob = await pdf(doc as any).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `church_report_${new Date().toISOString().split('T')[0]}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadReportExcel(reportData: any, reportType: string, period: string, year: number) {
  const wb = XLSX.utils.book_new();

  if (reportType === 'monthly-comparison') {
    const rows = [
      ['Grace Community Church - Monthly Comparison', `Year ${year}`],
      [],
      ['Month', 'Income (R)', 'Expenses (R)', 'Net (R)'],
      ...(reportData.months || []).map((m: any) => [m.month, m.income, m.expenses, m.net]),
      [],
      ['TOTAL', reportData.totals?.income, reportData.totals?.expenses, reportData.totals?.net],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Comparison');
  } else {
    // Summary sheet
    const summary = [
      ['Grace Community Church'],
      [reportData.report_type || 'Income Statement', period],
      [],
      ['Summary', ''],
      ['Total Income', reportData.summary?.total_income],
      ['Total Expenses', reportData.summary?.total_expenses],
      ['Net Income', reportData.summary?.net_income],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Income sheet
    const incomeRows = [
      ['Category', 'Amount (R)'],
      ...(reportData.income || []).map((i: any) => [i.category, i.amount]),
      [],
      ['TOTAL', reportData.summary?.total_income],
    ];
    const wsIncome = XLSX.utils.aoa_to_sheet(incomeRows);
    wsIncome['!cols'] = [{ wch: 28 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsIncome, 'Income');

    // Expenses sheet
    const expenseRows = [
      ['Category', 'Amount (R)'],
      ...(reportData.expenses || []).map((e: any) => [e.category, e.amount]),
      [],
      ['TOTAL', reportData.summary?.total_expenses],
    ];
    const wsExpenses = XLSX.utils.aoa_to_sheet(expenseRows);
    wsExpenses['!cols'] = [{ wch: 28 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');
  }

  const filename = `church_report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}
