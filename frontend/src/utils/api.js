/**
 * API client for backend communication
 */

const API_BASE_URL = '/api';

export const api = {
    // Transaction endpoints
    async getTransactions(params = {}) {
        const { skip = 0, limit = 50 } = params;
        const response = await fetch(`${API_BASE_URL}/transactions?skip=${skip}&limit=${limit}`);
        return response.json();
    },

    async getTransaction(txnId) {
        const response = await fetch(`${API_BASE_URL}/transactions/${txnId}`);
        return response.json();
    },

    async ingestTransaction(transaction) {
        const response = await fetch(`${API_BASE_URL}/transactions/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });
        return response.json();
    },

    // Alert endpoints
    async getAlerts(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/alerts?${params}`);
        return response.json();
    },

    async getAlert(alertId) {
        const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`);
        return response.json();
    },

    async updateAlert(alertId, updates) {
        const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return response.json();
    },

    async getStats() {
        const response = await fetch(`${API_BASE_URL}/alerts/stats/summary`);
        return response.json();
    },

    // Simulation endpoint
    async startSimulation(scenario, options = {}) {
        const response = await fetch(`${API_BASE_URL}/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scenario,
                ...options
            })
        });
        return response.json();
    },

    async clearRecentData() {
        const response = await fetch(`${API_BASE_URL}/alerts/clear`, {
            method: 'DELETE'
        });
        return response.json();
    },

    // Analytics endpoints
    async getGraphData(limit = 200) {
        const response = await fetch(`${API_BASE_URL}/analytics/graph?limit=${limit}`);
        return response.json();
    }
};
