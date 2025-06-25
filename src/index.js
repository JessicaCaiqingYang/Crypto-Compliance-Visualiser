// Import all the libraries we need
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import popper from 'cytoscape-popper';

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
        // Check if container exists and has dimensions
        const container = document.getElementById('cy');
        if (!container) {
            console.error('❌ Container #cy not found');
            return;
        }

        console.log('📊 Container found, dimensions:', container.offsetWidth, 'x', container.offsetHeight);

        // Create the main Cytoscape instance
        this.cy = cytoscape({
            container: container,

            style: [
                // Simplified node styling for debugging
                {
                    selector: 'node',
                    style: {
                        'width': 60,
                        'height': 60,
                        'label': 'data(label)',
                        'font-family': 'Arial, sans-serif',
                        'font-size': '14px',
                        'font-weight': 'bold',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'color': '#ffffff',
                        'text-outline-width': 2,
                        'text-outline-color': '#000000',
                        'border-width': 3,
                        'background-color': '#3b82f6',
                        'border-color': '#1e40af'
                    }
                },

                // Wallet nodes - blue
                {
                    selector: 'node[type="wallet"]',
                    style: {
                        'background-color': '#3b82f6',
                        'border-color': '#1e40af',
                        'shape': 'ellipse'
                    }
                },

                // Exchange nodes - orange diamond
                {
                    selector: 'node[type="exchange"]',
                    style: {
                        'background-color': '#f59e0b',
                        'border-color': '#d97706',
                        'shape': 'diamond',
                        'width': 80,
                        'height': 80
                    }
                },

                // Suspicious nodes - red
                {
                    selector: 'node[suspicious="true"]',
                    style: {
                        'background-color': '#ef4444',
                        'border-color': '#dc2626',
                        'border-width': 5
                    }
                },

                // Edge styling
                {
                    selector: 'edge',
                    style: {
                        'width': 4,
                        'line-color': '#64748b',
                        'target-arrow-color': '#64748b',
                        'target-arrow-shape': 'triangle',
                        'target-arrow-size': 15,
                        'curve-style': 'bezier'
                    }
                },

                // Selected elements
                {
                    selector: ':selected',
                    style: {
                        'border-width': 6,
                        'border-color': '#8b5cf6'
                    }
                }
            ],

            layout: {
                name: 'circle',
                fit: true,
                padding: 50
            }
        });

        console.log('📊 Graph engine initialized with container:', container.offsetWidth, 'x', container.offsetHeight);
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

        // Check if Cytoscape is initialized
        if (!this.cy) {
            console.error('❌ Cytoscape not initialized');
            return;
        }

        // Check if container exists
        const container = document.getElementById('cy');
        if (!container) {
            console.error('❌ Container element #cy not found');
            return;
        }

        console.log('📊 Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);

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

        console.log('📊 Sample data created:', sampleData);
        console.log('📊 Adding', sampleData.nodes.length, 'nodes and', sampleData.edges.length, 'edges');

        try {
            // Clear existing data and add new data
            this.cy.elements().remove();
            console.log('🗑️ Cleared existing elements');

            this.cy.add(sampleData.nodes);
            console.log('✅ Added nodes:', this.cy.nodes().length);

            this.cy.add(sampleData.edges);
            console.log('✅ Added edges:', this.cy.edges().length);

            // Force a fit and center to make sure nodes are visible
            this.cy.fit();
            this.cy.center();
            console.log('🎯 Fit and center applied');

            // Run layout with built-in circle layout (more reliable)
            console.log('🎯 Running circle layout...');
            const layout = this.cy.layout({
                name: 'circle',
                fit: true,
                padding: 50,
                radius: 200,
                animate: true,
                animationDuration: 1000
            });

            layout.run();

            // After layout, try fit again
            layout.on('layoutstop', () => {
                console.log('📍 Layout completed');
                this.cy.fit();
                this.cy.center();
                console.log('📍 Final fit and center applied');

                // Log node positions for debugging
                this.cy.nodes().forEach(node => {
                    const pos = node.position();
                    console.log(`Node ${node.id()}: position (${pos.x}, ${pos.y}), rendered: ${node.renderedBoundingBox()}`);
                });
            });

            // Update tracking
            this.currentDataset = 'sample';

            // Update statistics
            this.updateNetworkStats();
            this.resetPatternInfo();

            console.log('✅ Sample data loaded successfully');
            console.log('📈 Final check - Nodes:', this.cy.nodes().length, 'Edges:', this.cy.edges().length);

            // Force a resize in case of container issues
            setTimeout(() => {
                this.cy.resize();
                this.cy.fit();
                console.log('🔄 Forced resize and fit after timeout');
            }, 100);

        } catch (error) {
            console.error('❌ Error loading sample data:', error);
        }
    }

    promptForEllipticFiles() {
        // Create modern file upload modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'file-upload-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Load Elliptic Dataset</h3>
                <p>Please select the three CSV files from the Elliptic dataset to analyze real Bitcoin transaction networks with ground-truth labels.</p>
                
                <div class="file-input-group">
                    <label>Features File (txs_features.csv):</label>
                    <input type="file" id="features-upload" accept=".csv" />
                </div>
                
                <div class="file-input-group">
                    <label>Classes File (txs_classes.csv):</label>
                    <input type="file" id="classes-upload" accept=".csv" />
                </div>
                
                <div class="file-input-group">
                    <label>Edges File (txs_edgelist.csv):</label>
                    <input type="file" id="edges-upload" accept=".csv" />
                </div>
                
                <div class="info-box">
                    <strong>📁 Dataset Source:</strong>
                    Download from: <a href="https://drive.google.com/drive/folders/1MRPXz79Lu_JGLlJ21MDfML44dKN9R08l" target="_blank">Elliptic++ Google Drive</a><br>
                    <small>Real Bitcoin transactions with illicit/licit classifications from financial crime experts</small>
                </div>
                
                <div class="modal-actions">
                    <button id="cancel-upload-btn" class="btn btn-secondary">Cancel</button>
                    <button id="load-files-btn" class="btn btn-primary">Load Dataset</button>
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
            const sampleData = this.ellipticLoader.loadSampleSubset(200); // Much smaller sample

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

        if (!infoPanel) {
            console.warn('⚠️ selected-node-info element not found');
            return;
        }

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

        const selectedNodeInfoElement = document.getElementById('selected-node-info');
        if (selectedNodeInfoElement) {
            selectedNodeInfoElement.innerHTML = '<div>Click on a node to see details</div>';
        }
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

        const nodeCountElement = document.getElementById('node-count');
        const edgeCountElement = document.getElementById('edge-count');
        const patternCountElement = document.getElementById('pattern-count');

        if (nodeCountElement) nodeCountElement.textContent = nodeCount;
        if (edgeCountElement) edgeCountElement.textContent = edgeCount;
        if (patternCountElement) patternCountElement.textContent = '0';

        console.log(`📊 Stats updated: ${nodeCount} nodes, ${edgeCount} edges`);
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

        const networkStatsElement = document.getElementById('network-stats');
        const patternCountElement = document.getElementById('pattern-count');

        if (networkStatsElement) {
            networkStatsElement.innerHTML = statsHTML;
        }

        if (patternCountElement) {
            patternCountElement.textContent = '0';
        }

        console.log(`📊 Elliptic stats updated: ${statistics.total} total, ${statistics.illicit} illicit`);
    }

    updatePatternInfo(count) {
        const patternCountElement = document.getElementById('pattern-count');
        const patternInfoElement = document.getElementById('pattern-info');

        if (patternCountElement) {
            patternCountElement.textContent = count;
        }

        if (patternInfoElement) {
            if (count > 0) {
                const patternType = this.currentDataset === 'elliptic' ?
                    'illicit-to-illicit connections' : 'circular transaction patterns';
                patternInfoElement.innerHTML = `<div class="pattern-alert danger">Found ${count} suspicious ${patternType}</div>`;
            } else {
                patternInfoElement.innerHTML = '<div class="pattern-alert success">No suspicious patterns detected</div>';
            }
        }

        console.log(`🚨 Pattern info updated: ${count} patterns found`);
    }

    resetPatternInfo() {
        const patternCountElement = document.getElementById('pattern-count');
        const patternInfoElement = document.getElementById('pattern-info');

        if (patternCountElement) {
            patternCountElement.textContent = '0';
        }

        if (patternInfoElement) {
            patternInfoElement.innerHTML = '<div class="pattern-alert success">No patterns detected yet</div>';
        }
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