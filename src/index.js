// Import all the libraries we need
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import popper from 'cytoscape-popper';

// Import our CSS
import './styles/main.css';

// Import data processing modules
import { EllipticDataLoader } from './data/EllipticDataLoader.js';

// Register extensions with Cytoscape
cytoscape.use(coseBilkent);
cytoscape.use(popper);

// Main application class
class CryptoNetworkVisualizer {
    constructor() {
        this.cy = null;
        this.isInitialized = false;
        this.ellipticLoader = new EllipticDataLoader();
        this.currentDataset = 'none'; // Track which dataset is loaded

        // Initialize the application
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Crypto Network Visualizer...');

        try {
            // Update status
            this.updateStatus('Initializing graph engine...', 'loading');

            // Initialize the graph
            this.initializeGraph();

            // Set up event handlers
            this.setupEventHandlers();

            // Mark as initialized
            this.isInitialized = true;
            this.updateStatus('Ready for analysis', 'ready');

            console.log('✅ Crypto Network Visualizer initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize:', error);
            this.updateStatus('Initialization failed', 'error');
        }
    }

    initializeGraph() {
        // Create the main Cytoscape instance
        this.cy = cytoscape({
            container: document.getElementById('cy'),

            style: [
                // Base node styling
                {
                    selector: 'node',
                    style: {
                        'width': 30,
                        'height': 30,
                        'label': 'data(label)',
                        'font-size': '10px',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'color': '#333',
                        'text-outline-width': 2,
                        'text-outline-color': '#fff',
                        'border-width': 2,
                        'background-color': '#4A90E2'
                    }
                },

                // Wallet nodes (sample data)
                {
                    selector: 'node[type="wallet"]',
                    style: {
                        'background-color': '#4A90E2',
                        'width': 'mapData(balance, 0, 1000, 20, 50)',
                        'height': 'mapData(balance, 0, 1000, 20, 50)',
                        'border-color': '#2c5aa0',
                        'shape': 'ellipse'
                    }
                },

                // Exchange nodes (sample data)
                {
                    selector: 'node[type="exchange"]',
                    style: {
                        'background-color': '#F5A623',
                        'shape': 'diamond',
                        'width': 40,
                        'height': 40,
                        'border-color': '#d48806'
                    }
                },

                // Transaction nodes (Elliptic data)
                {
                    selector: 'node[type="transaction"]',
                    style: {
                        'width': 25,
                        'height': 25,
                        'shape': 'ellipse',
                        'font-size': '8px'
                    }
                },

                // Illicit transactions (red)
                {
                    selector: 'node[classification="illicit"]',
                    style: {
                        'background-color': '#dc3545',
                        'border-color': '#721c24',
                        'border-width': 3
                    }
                },

                // Licit transactions (green)
                {
                    selector: 'node[classification="licit"]',
                    style: {
                        'background-color': '#28a745',
                        'border-color': '#155724',
                        'border-width': 2
                    }
                },

                // Unknown transactions (gray)
                {
                    selector: 'node[classification="unknown"]',
                    style: {
                        'background-color': '#6c757d',
                        'border-color': '#495057',
                        'border-width': 1
                    }
                },

                // Suspicious nodes (sample data)
                {
                    selector: 'node[suspicious="true"]',
                    style: {
                        'background-color': '#D0021B',
                        'border-color': '#8B0000',
                        'border-width': 3
                    }
                },

                // Base edge styling
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#999',
                        'target-arrow-color': '#999',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'opacity': 0.7
                    }
                },

                // Transaction edges with amount mapping
                {
                    selector: 'edge[amount]',
                    style: {
                        'width': 'mapData(amount, 0, 100, 1, 6)'
                    }
                },

                // Large transaction edges
                {
                    selector: 'edge[amount > 50]',
                    style: {
                        'line-color': '#ff6b6b',
                        'target-arrow-color': '#ff6b6b'
                    }
                },

                // Transaction flow edges (Elliptic data)
                {
                    selector: 'edge[type="transaction_flow"]',
                    style: {
                        'width': 1,
                        'line-color': '#666',
                        'target-arrow-color': '#666',
                        'opacity': 0.6
                    }
                },

                // Selected elements
                {
                    selector: ':selected',
                    style: {
                        'border-width': 4,
                        'border-color': '#007bff'
                    }
                },

                // Highlighted elements
                {
                    selector: '.highlighted',
                    style: {
                        'border-width': 3,
                        'border-color': '#007bff',
                        'opacity': 1
                    }
                },

                // Suspicious patterns
                {
                    selector: '.suspicious-pattern',
                    style: {
                        'line-color': '#dc3545',
                        'target-arrow-color': '#dc3545',
                        'width': 4,
                        'opacity': 1
                    }
                },

                // Search highlights
                {
                    selector: '.search-highlight',
                    style: {
                        'border-width': 4,
                        'border-color': '#ffc107',
                        'border-style': 'dashed'
                    }
                }
            ],

            layout: {
                name: 'cose-bilkent',
                animate: true,
                animationDuration: 1000,
                nodeRepulsion: 4500,
                idealEdgeLength: 50,
                edgeElasticity: 0.45,
                nestingFactor: 0.1,
                gravity: 0.25,
                numIter: 2500,
                tile: true,
                quality: 'default'
            }
        });

        console.log('📊 Graph engine initialized');
    }

    setupEventHandlers() {
        // Node click events
        this.cy.on('tap', 'node', (evt) => {
            const node = evt.target;
            this.displayNodeInfo(node);
            this.highlightConnections(node);
        });

        // Background click to clear selection
        this.cy.on('tap', (evt) => {
            if (evt.target === this.cy) {
                this.clearSelection();
            }
        });

        // Button event handlers
        document.getElementById('load-sample-data').addEventListener('click', () => {
            this.loadSampleData();
        });

        document.getElementById('load-elliptic-data').addEventListener('click', () => {
            this.promptForEllipticFiles();
        });

        document.getElementById('clear-graph').addEventListener('click', () => {
            this.clearGraph();
        });

        document.getElementById('detect-patterns').addEventListener('click', () => {
            this.detectSuspiciousPatterns();
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (evt) => {
            this.searchNodes(evt.target.value);
        });

        console.log('🎛️ Event handlers set up');
    }

    loadSampleData() {
        console.log('📥 Loading sample data...');

        const sampleData = {
            nodes: [
                { data: { id: 'wallet1', label: 'Wallet A', type: 'wallet', balance: 150.5, address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' } },
                { data: { id: 'wallet2', label: 'Wallet B', type: 'wallet', balance: 75.2, address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy' } },
                { data: { id: 'wallet3', label: 'Wallet C', type: 'wallet', balance: 300.0, address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' } },
                { data: { id: 'exchange1', label: 'Coinbase', type: 'exchange', balance: 10000, address: 'exchange_coinbase_main' } },
                { data: { id: 'wallet4', label: 'Suspicious Wallet', type: 'wallet', balance: 500.0, suspicious: 'true', address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2' } }
            ],
            edges: [
                { data: { id: 'tx1', source: 'wallet1', target: 'exchange1', amount: 25.5, timestamp: '2023-06-01T10:00:00Z' } },
                { data: { id: 'tx2', source: 'exchange1', target: 'wallet2', amount: 15.2, timestamp: '2023-06-01T10:05:00Z' } },
                { data: { id: 'tx3', source: 'wallet2', target: 'wallet3', amount: 45.0, timestamp: '2023-06-01T10:10:00Z' } },
                { data: { id: 'tx4', source: 'wallet3', target: 'wallet4', amount: 75.0, timestamp: '2023-06-01T10:15:00Z' } },
                { data: { id: 'tx5', source: 'wallet4', target: 'wallet1', amount: 65.0, timestamp: '2023-06-01T10:20:00Z' } }
            ]
        };

        // Clear existing data and add new data
        this.cy.elements().remove();
        this.cy.add(sampleData.nodes);
        this.cy.add(sampleData.edges);

        // Run layout
        this.cy.layout({
            name: 'cose-bilkent',
            animate: true,
            animationDuration: 1500
        }).run();

        // Update tracking
        this.currentDataset = 'sample';

        // Update statistics
        this.updateNetworkStats();
        this.resetPatternInfo();

        console.log('✅ Sample data loaded successfully');
    }

    promptForEllipticFiles() {
        // Create file upload modal
        const modal = document.createElement('div');
        modal.id = 'file-upload-modal';
        modal.innerHTML = `
            <div style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
                align-items: center; justify-content: center;
            ">
                <div style="
                    background: white; padding: 30px; border-radius: 10px; 
                    max-width: 500px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                ">
                    <h3 style="margin-top: 0; color: #333;">Load Elliptic Dataset</h3>
                    <p style="color: #666; margin-bottom: 20px;">
                        Please select the three CSV files from the Elliptic dataset:
                    </p>
                    
                    <div style="margin: 15px 0;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                            Features File (txs_features.csv):
                        </label>
                        <input type="file" id="features-upload" accept=".csv" style="width: 100%;" />
                    </div>
                    
                    <div style="margin: 15px 0;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                            Classes File (txs_classes.csv):
                        </label>
                        <input type="file" id="classes-upload" accept=".csv" style="width: 100%;" />
                    </div>
                    
                    <div style="margin: 15px 0;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                            Edges File (txs_edgelist.csv):
                        </label>
                        <input type="file" id="edges-upload" accept=".csv" style="width: 100%;" />
                    </div>
                    
                    <div style="
                        background: #f8f9fa; padding: 15px; border-radius: 5px; 
                        margin: 20px 0; border-left: 4px solid #007bff;
                    ">
                        <strong>📁 Dataset Info:</strong><br>
                        Download from: <a href="https://drive.google.com/drive/folders/1MRPXz79Lu_JGLlJ21MDfML44dKN9R08l" target="_blank">Elliptic++ Google Drive</a><br>
                        <small style="color: #666;">Real Bitcoin transactions with illicit/licit labels</small>
                    </div>
                    
                    <div style="margin-top: 25px; text-align: right;">
                        <button id="cancel-upload-btn" style="
                            background: #6c757d; color: white; border: none; 
                            padding: 10px 20px; border-radius: 5px; margin-right: 10px;
                            cursor: pointer;
                        ">Cancel</button>
                        <button id="load-files-btn" style="
                            background: #007bff; color: white; border: none; 
                            padding: 10px 20px; border-radius: 5px; cursor: pointer;
                        ">Load Dataset</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle file loading
        document.getElementById('load-files-btn').addEventListener('click', () => {
            this.loadEllipticFiles();
        });

        // Handle cancel
        document.getElementById('cancel-upload-btn').addEventListener('click', () => {
            this.closeModal();
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    closeModal() {
        const modal = document.getElementById('file-upload-modal');
        if (modal) {
            modal.remove();
        }
    }

    async loadEllipticFiles() {
        const featuresFile = document.getElementById('features-upload').files[0];
        const classesFile = document.getElementById('classes-upload').files[0];
        const edgesFile = document.getElementById('edges-upload').files[0];

        if (!featuresFile || !classesFile || !edgesFile) {
            alert('Please select all three CSV files');
            return;
        }

        try {
            this.updateStatus('Loading Elliptic dataset...', 'loading');

            console.log('📥 Loading Elliptic dataset files...');
            console.log(`📊 Files: ${featuresFile.name}, ${classesFile.name}, ${edgesFile.name}`);

            // Load and process the dataset
            const data = await this.ellipticLoader.loadFromFiles(
                featuresFile,
                classesFile,
                edgesFile
            );

            // For performance, load a sample subset
            console.log('🔄 Creating sample subset for visualization...');
            const sampleData = this.ellipticLoader.loadSampleSubset(300); // Reduced for better performance

            // Clear existing data and add new data
            this.cy.elements().remove();
            this.cy.add(sampleData.nodes);
            this.cy.add(sampleData.edges);

            // Run layout optimized for larger networks
            this.cy.layout({
                name: 'cose-bilkent',
                animate: true,
                animationDuration: 2000,
                nodeRepulsion: 8000,
                idealEdgeLength: 100,
                edgeElasticity: 0.3,
                nestingFactor: 0.1,
                gravity: 0.4,
                numIter: 1000
            }).run();

            // Update tracking
            this.currentDataset = 'elliptic';

            // Update statistics
            this.updateNetworkStats();
            this.updateEllipticStats(sampleData.statistics);

            // Close modal
            this.closeModal();

            this.updateStatus('Elliptic dataset loaded successfully', 'ready');
            console.log('✅ Elliptic dataset visualization complete');
            console.log(`📈 Visualizing ${sampleData.nodes.length} transactions`);

        } catch (error) {
            console.error('❌ Failed to load Elliptic dataset:', error);
            this.updateStatus('Failed to load dataset', 'error');
            alert(`Failed to load Elliptic dataset: ${error.message}`);
        }
    }

    displayNodeInfo(node) {
        const data = node.data();
        const infoPanel = document.getElementById('selected-node-info');

        let infoHTML = '';

        if (this.currentDataset === 'elliptic') {
            // Elliptic dataset node info
            infoHTML = `
                <div><strong>Transaction ID:</strong> ${data.txId || 'Unknown'}</div>
                <div><strong>Type:</strong> ${data.type}</div>
                <div><strong>Classification:</strong> 
                    <span style="color: ${this.getClassificationColor(data.classification)};">
                        ${data.classification}
                    </span>
                </div>
                <div><strong>Timestep:</strong> ${data.timestep || 'Unknown'}</div>
                <div><strong>Connections:</strong> ${node.degree()}</div>
                <div><strong>Feature Sum:</strong> ${data.featureSum ? data.featureSum.toFixed(2) : 'Unknown'}</div>
                ${data.suspicious === 'true' ? '<div style="color: #dc3545;"><strong>⚠️ Flagged as Illicit</strong></div>' : ''}
            `;
        } else {
            // Sample dataset node info
            infoHTML = `
                <div><strong>Address:</strong> ${data.address || data.id}</div>
                <div><strong>Type:</strong> ${data.type}</div>
                <div><strong>Balance:</strong> ${data.balance ? data.balance.toFixed(2) + ' BTC' : 'Unknown'}</div>
                <div><strong>Connections:</strong> ${node.degree()}</div>
                ${data.suspicious === 'true' ? '<div style="color: #dc3545;"><strong>⚠️ Flagged as Suspicious</strong></div>' : ''}
            `;
        }

        infoPanel.innerHTML = infoHTML;
    }

    getClassificationColor(classification) {
        switch (classification) {
            case 'illicit': return '#dc3545';
            case 'licit': return '#28a745';
            case 'unknown': return '#6c757d';
            default: return '#333';
        }
    }

    highlightConnections(node) {
        // Remove previous highlights
        this.cy.elements().removeClass('highlighted');

        // Highlight selected node and its connections
        node.addClass('highlighted');
        node.connectedEdges().addClass('highlighted');
        node.neighborhood().addClass('highlighted');
    }

    clearSelection() {
        this.cy.elements().removeClass('highlighted');
        document.getElementById('selected-node-info').innerHTML = '<div>Click on a node to see details</div>';
    }

    searchNodes(searchTerm) {
        if (!searchTerm) {
            this.cy.elements().removeClass('search-highlight');
            return;
        }

        // Remove previous search highlights
        this.cy.elements().removeClass('search-highlight');

        // Find matching nodes
        const matches = this.cy.nodes().filter(node => {
            const data = node.data();
            const searchLower = searchTerm.toLowerCase();

            return (data.address && data.address.toLowerCase().includes(searchLower)) ||
                (data.label && data.label.toLowerCase().includes(searchLower)) ||
                (data.txId && data.txId.toString().includes(searchTerm)) ||
                (data.classification && data.classification.toLowerCase().includes(searchLower));
        });

        // Highlight matches
        matches.addClass('search-highlight');

        // Focus on first match if found
        if (matches.length > 0) {
            this.cy.center(matches[0]);
            this.cy.zoom(1.5);

            // Update search info
            console.log(`🔍 Found ${matches.length} matches for "${searchTerm}"`);
        }
    }

    detectSuspiciousPatterns() {
        console.log('🔍 Detecting suspicious patterns...');

        let suspiciousCount = 0;

        // Clear previous pattern highlights
        this.cy.elements().removeClass('suspicious-pattern');

        if (this.currentDataset === 'elliptic') {
            // For Elliptic data, highlight connections between illicit nodes
            const illicitNodes = this.cy.nodes('[classification="illicit"]');

            illicitNodes.forEach(node => {
                const connectedEdges = node.connectedEdges();
                connectedEdges.forEach(edge => {
                    const otherNode = edge.otherNode(node);
                    if (otherNode.data('classification') === 'illicit') {
                        edge.addClass('suspicious-pattern');
                        suspiciousCount++;
                    }
                });
            });

            console.log(`🚨 Found ${suspiciousCount} connections between illicit transactions`);

        } else {
            // Original circular transaction detection for sample data
            const nodes = this.cy.nodes();
            nodes.forEach(node => {
                const outgoing = node.outgoers('edge');

                outgoing.forEach(outEdge => {
                    const target = outEdge.target();
                    const returnEdges = target.edgesTo(node);

                    if (returnEdges.length > 0) {
                        // Found a potential circular transaction
                        outEdge.addClass('suspicious-pattern');
                        returnEdges.addClass('suspicious-pattern');
                        suspiciousCount++;
                    }
                });
            });

            console.log(`🚨 Found ${suspiciousCount} circular transaction patterns`);
        }

        // Update pattern info
        this.updatePatternInfo(suspiciousCount);
    }

    clearGraph() {
        this.cy.elements().remove();
        this.currentDataset = 'none';
        this.updateNetworkStats();
        this.clearSelection();
        this.resetPatternInfo();
        console.log('🗑️ Graph cleared');
    }

    updateNetworkStats() {
        const nodeCount = this.cy.nodes().length;
        const edgeCount = this.cy.edges().length;

        document.getElementById('node-count').textContent = nodeCount;
        document.getElementById('edge-count').textContent = edgeCount;

        // Reset pattern count
        document.getElementById('pattern-count').textContent = '0';
    }

    updateEllipticStats(statistics) {
        // Update the info panel with Elliptic-specific stats
        const statsHTML = `
            <div>Total Transactions: <span>${statistics.total}</span></div>
            <div style="color: #dc3545;">🔴 Illicit: <span>${statistics.illicit}</span></div>
            <div style="color: #28a745;">🟢 Licit: <span>${statistics.licit}</span></div>
            <div style="color: #6c757d;">⚫ Unknown: <span>${statistics.unknown}</span></div>
            <div>🔗 Connections: <span>${statistics.edges}</span></div>
        `;

        document.getElementById('network-stats').innerHTML = statsHTML;

        // Update pattern count
        document.getElementById('pattern-count').textContent = '0';
    }

    updatePatternInfo(count) {
        document.getElementById('pattern-count').textContent = count;

        const patternInfo = document.getElementById('pattern-info');
        if (count > 0) {
            const patternType = this.currentDataset === 'elliptic' ?
                'illicit-to-illicit connections' : 'circular transaction patterns';
            patternInfo.innerHTML = `<div style="color: #dc3545;">Found ${count} suspicious ${patternType}</div>`;
        } else {
            patternInfo.innerHTML = '<div style="color: #28a745;">No suspicious patterns detected</div>';
        }
    }

    resetPatternInfo() {
        document.getElementById('pattern-count').textContent = '0';
        document.getElementById('pattern-info').innerHTML = '<div>No patterns detected yet</div>';
    }

    updateStatus(message, type) {
        const statusDisplay = document.getElementById('status-display');
        const indicator = statusDisplay.querySelector('.status-indicator');
        const textSpan = statusDisplay.querySelector('span:last-child');

        // Remove all status classes
        indicator.className = 'status-indicator';

        // Add new status class
        indicator.classList.add(`status-${type}`);

        // Update text
        if (textSpan) {
            textSpan.textContent = message;
        } else {
            statusDisplay.innerHTML = `<span class="status-indicator status-${type}"></span><span>${message}</span>`;
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM loaded, starting application...');

    // Create the main application instance
    window.cryptoVisualizer = new CryptoNetworkVisualizer();
});

// Export for potential use in other modules
export default CryptoNetworkVisualizer;