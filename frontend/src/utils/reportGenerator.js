import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from './api';

/**
 * Downloads a specific alert as a PDF report
 */
export const downloadAlertPDF = (alertData) => {
    try {
        const { alert, transaction } = alertData;
        const doc = new jsPDF();

        // 1. Header & Title
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("SENTINEL FLOW", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(34, 211, 238); // neon-cyan
        doc.text("AI-POWERED AML SURVEILLANCE DOSSIER", 14, 28);

        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`GENERATED: ${new Date().toLocaleString()} `, 150, 28);

        // 2. Case Overview
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`INVESTIGATION CASE: #${alert.alert_id} `, 14, 55);

        // Status & Level badges
        const levelColor = alert.alert_level === 'CRITICAL' ? [239, 68, 68] : alert.alert_level === 'HIGH' ? [245, 158, 11] : [67, 97, 238];
        doc.setFillColor(...levelColor);
        doc.roundedRect(14, 60, 30, 8, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(alert.alert_level, 17, 65.5);

        // 3. Information Table
        autoTable(doc, {
            startY: 75,
            head: [['ENTITY DETAILS', 'VALUE']],
            body: [
                ['Transaction Reference', alert.txn_id],
                ['Account Holder ID', alert.account_id],
                ['Risk Score', `${alert.risk_score}/100`],
                ['Alert Status', alert.status],
                ['Detection Engine', 'Hybrid (Rules + Anomaly + ML)'],
                ['Timestamp', new Date(alert.created_at).toLocaleString()]
            ],
            theme: 'striped',
            headStyles: { fillColor: [67, 97, 238], textColor: 255 },
            alternateRowStyles: { fillColor: [241, 245, 249] }
        });

        // 4. Financial Payload
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.text("FINANCIAL DATA PAYLOAD", 14, finalY);

        autoTable(doc, {
            startY: finalY + 5,
            body: [
                ['Amount', `$ ${transaction.amount?.toLocaleString()}`, 'Currency', transaction.currency],
                ['Type', transaction.txn_type?.toUpperCase(), 'Channel', transaction.channel],
                ['Beneficiary', transaction.counterparty_id, 'Region', transaction.country_code || 'US']
            ],
            theme: 'grid',
            styles: { fontSize: 9 },
            columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } }
        });

        // 5. AI Reasoning & Rule Violations
        const analysisY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text("AI ANALYSIS & REASONING", 14, analysisY);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const splitExplanation = doc.splitTextToSize(alert.explanation || "No explanation provided.", 180);
        doc.text(splitExplanation, 14, analysisY + 10);

        // 6. Conclusion / Action
        const footerY = 270;
        doc.setDrawColor(226, 232, 240);
        doc.line(14, footerY, 196, footerY);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("SENTINEL FLOW | CONFIDENTIAL SECURITY CLEARANCE REQUIRED | FOR INTERNAL USE ONLY", 105, footerY + 10, { align: "center" });

        doc.save(`Sentinel_Dossier_${alert.alert_id}.pdf`);
        return { success: true };
    } catch (error) {
        console.error("PDF Generation failed:", error);
        alert("PDF Generation failed. See console for details.");
        return { success: false };
    }
};

/**
 * Generates a comprehensive PDF report of the system state
 */
export const downloadSystemReport = async () => {
    try {
        // Fetch all necessary data
        const stats = await api.getStats();
        const alerts = await api.getAlerts({ limit: 50 });
        const transactions = await api.getTransactions({ limit: 50 });

        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // 1. Header
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("SENTINEL FLOW", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(34, 211, 238);
        doc.text("EXECUTIVE SYSTEM AUDIT REPORT", 14, 28);

        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`GENERATED: ${timestamp}`, 150, 28);

        // 2. Performance Summary
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("SYSTEM PERFORMANCE SUMMARY", 14, 55);

        autoTable(doc, {
            startY: 60,
            head: [['METRIC', 'VALUE', 'STATUS']],
            body: [
                ['Total Transactions Processed', stats.total_transactions, 'ACTIVE'],
                ['Total Suspicious Alerts', stats.total_alerts, 'ACTION REQ'],
                ['Detection Rate', `${stats.detection_rate}%`, 'OPTIMAL'],
                ['Average Risk Score', stats.avg_risk_score, 'STABLE']
            ],
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] }
        });

        // 3. Alert Distribution
        if (stats.alerts_by_level) {
            const distY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(14);
            doc.text("ALERT DISTRIBUTION", 14, distY);

            const distBody = Object.entries(stats.alerts_by_level).map(([level, count]) => [level, count]);
            autoTable(doc, {
                startY: distY + 5,
                head: [['LEVEL', 'COUNT']],
                body: distBody,
                theme: 'grid',
                styles: { halign: 'center' },
                headStyles: { fillColor: [67, 97, 238] }
            });
        }

        // 4. Recent High Risk Activity (New Page for Tables)
        doc.addPage();
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text("RECENT AUDIT LOGS", 14, 13);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.text("RECENT CRITICAL/HIGH ALERTS", 14, 35);

        const alertRows = alerts.map(a => [
            a.alert_id.substring(0, 8),
            a.account_id,
            a.alert_level,
            `${a.risk_score}`,
            a.status
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['ID', 'ACCOUNT', 'LEVEL', 'SCORE', 'STATUS']],
            body: alertRows,
            styles: { fontSize: 8 }
        });

        // 5. Transaction Stream
        const streamY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text("RECENT TRANSACTION STREAM", 14, streamY);

        const txnRows = transactions.slice(0, 20).map(t => [
            t.txn_id.substring(0, 8),
            t.account_id,
            `$${t.amount}`,
            t.txn_type,
            t.country_code
        ]);

        autoTable(doc, {
            startY: streamY + 5,
            head: [['TXN ID', 'ACCOUNT', 'AMOUNT', 'TYPE', 'GEO']],
            body: txnRows,
            styles: { fontSize: 8 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Sentinel Flow v2.5.0 - Confidential Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }

        doc.save(`Sentinel_Audit_Report_${new Date().getTime()}.pdf`);
        return { success: true, message: "PDF Report generated successfully" };
    } catch (error) {
        console.error('Failed to generate report:', error);
        return { success: false, message: error.message || "Failed to generate report" };
    }
};

/**
 * Downloads statistics as a CSV file
 */
export const downloadStatsCSV = async () => {
    try {
        const stats = await api.getStats();

        let csvContent = "Category,Metric,Value\n";
        csvContent += `System,Total Transactions,${stats.total_transactions}\n`;
        csvContent += `System,Total Alerts,${stats.total_alerts}\n`;
        csvContent += `System,Detection Rate,${stats.detection_rate}%\n`;
        csvContent += `System,Avg Risk Score,${stats.avg_risk_score}\n`;

        if (stats.alerts_by_level) {
            Object.entries(stats.alerts_by_level).forEach(([level, count]) => {
                csvContent += `Alert Distribution,${level},${count}\n`;
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sentinel_stats_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Failed to download CSV:', error);
        return { success: false };
    }
};

/**
 * Downloads alerts as a CSV file
 */
export const downloadAlertsCSV = async () => {
    try {
        const alerts = await api.getAlerts({ limit: 1000 });

        if (alerts.length === 0) return { success: false, message: "No alerts to export" };

        const headers = ["Alert ID", "Transaction ID", "Account ID", "Risk Score", "Alert Level", "Status", "Created At"];
        let csvContent = headers.join(",") + "\n";

        alerts.forEach(alert => {
            const row = [
                alert.alert_id,
                alert.txn_id,
                alert.account_id,
                alert.risk_score,
                alert.alert_level,
                alert.status,
                alert.created_at
            ];
            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sentinel_alerts_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Failed to download Alerts CSV:', error);
        return { success: false };
    }
};

/**
 * Downloads transactions as a CSV file
 */
export const downloadTransactionsCSV = async () => {
    try {
        const transactions = await api.getTransactions({ limit: 1000 });

        if (transactions.length === 0) return { success: false, message: "No transactions to export" };

        const headers = ["Txn ID", "Account ID", "Timestamp", "Amount", "Currency", "Type", "Channel", "Country"];
        let csvContent = headers.join(",") + "\n";

        transactions.forEach(txn => {
            const row = [
                txn.txn_id,
                txn.account_id,
                txn.timestamp,
                txn.amount,
                txn.currency,
                txn.txn_type,
                txn.channel,
                txn.country_code
            ];
            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sentinel_transactions_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Failed to download Transactions CSV:', error);
        return { success: false };
    }
};
