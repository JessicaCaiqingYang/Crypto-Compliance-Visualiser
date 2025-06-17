// Import all the libraries we need
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import popper from 'cytoscape-popper';

// Import our CSS
import './styles/main.css';

// Register extensions with Cytoscape
cytoscape.use(coseBilkent);
cytoscape.use(popper);

// Main application class
class CryptoNetworkVisualizer {
    constructor() {
        this.cy = null;
        this.isInitialized = false;

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
                // Wallet nodes
                {
                    selector: 'node[type="wallet"]',
                    style: {
                        'background-color': '#4A90E2',
                        'width': 'mapData(balance, 0, 1000, 20, 50)',
                        'height': 'mapData(balance, 0, 1000, 20, 50)',
                        'label': 'data(label)',
                        'font-size': '10px',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'color': '#333',
                        'text-outline-width': 2,
                        'text-outline-color': '#fff',
                        'border-width': 2,
                        'border-color': '#2c5aa0'
                    }
                },

                // Exchange nodes
                {
                    selector: 'node[type="exchange"]',
                    style: {
                        'background-color': '#F5A623',
                        'shape': 'diamond',
                        'width': 40,
                        'height': 40,
                        'label': 'data(label)',
                        'font-size': '12px',
                        'color': '#333',
                        'text-outline-width': 2,
                        'text-outline-color': '#fff',
                        'border-width': 2,
                        'border-color': '#d48806'
                    }
                },

                // Suspicious nodes
                {
                    selector: 'node[suspicious="true"]',
                    style: {
                        'background-color': '#D0021B',
                        'border-color': '#8B0000',
                        'border-width': 3
                    }
                },

                // Transaction edges
                {
                    selector: 'edge',
                    style: {
                        'width': 'mapData(amount, 0, 100, 1, 6)',
                        'line-color': '#999',
                        'target-arrow-color': '#999',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'opacity': 0.7
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

                // Selected elements
                {
                    selector: ':selected',
                    style: {
                        'border-width': 4,
                        'border-color': '#007bff'
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

        // Update statistics
        this.updateNetworkStats();

        console.log('✅ Sample data loaded successfully');
    }

    displayNodeInfo(node) {
        const data = node.data();
        const infoPanel = document.getElementById('selected-node-info');

        const infoHTML = `
            <div><strong>Address:</strong> ${data.address || data.id}</div>
            <div><strong>Type:</strong> ${data.type}</div>
            <div><strong>Balance:</strong> ${data.balance ? data.balance.toFixed(2) + ' BTC' : 'Unknown'}</div>
            <div><strong>Connections:</strong> ${node.degree()}</div>
            ${data.suspicious === 'true' ? '<div style="color: #dc3545;"><strong>⚠️ Flagged as Suspicious</strong></div>' : ''}
        `;

        infoPanel.innerHTML = infoHTML;
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
            return (data.address && data.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (data.label && data.label.toLowerCase().includes(searchTerm.toLowerCase()));
        });

        // Highlight matches
        matches.addClass('search-highlight');

        // Focus on first match if found
        if (matches.length > 0) {
            this.cy.center(matches[0]);
            this.cy.zoom(1.5);
        }
    }

    detectSuspiciousPatterns() {
        console.log('🔍 Detecting suspicious patterns...');

        let suspiciousCount = 0;

        // Look for circular transactions (simplified)
        const nodes = this.cy.nodes();
        nodes.forEach(node => {
            const outgoing = node.outgoers('edge');
            const incoming = node.incomers('edge');

            // Check if node both sends and receives from the same addresses
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

        // Update pattern info
        document.getElementById('pattern-count').textContent = suspiciousCount;
        document.getElementById('pattern-info').innerHTML =
            suspiciousCount > 0
                ? `<div style="color: #dc3545;">Found ${suspiciousCount} suspicious circular patterns</div>`
                : '<div style="color: #28a745;">No suspicious patterns detected</div>';

        console.log(`🚨 Found ${suspiciousCount} suspicious patterns`);
    }

    clearGraph() {
        this.cy.elements().remove();
        this.updateNetworkStats();
        this.clearSelection();
        console.log('🗑️ Graph cleared');
    }

    updateNetworkStats() {
        document.getElementById('node-count').textContent = this.cy.nodes().length;
        document.getElementById('edge-count').textContent = this.cy.edges().length;
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