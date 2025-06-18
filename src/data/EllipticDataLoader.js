import Papa from 'papaparse';

export class EllipticDataLoader {
    constructor() {
        this.features = null;
        this.classes = null;
        this.edgelist = null;
        this.isLoaded = false;
    }

    async loadFromFiles(featuresFile, classesFile, edgelistFile) {
        console.log('📥 Loading Elliptic dataset files...');

        try {
            // Load all three CSV files
            const [features, classes, edges] = await Promise.all([
                this.loadCSV(featuresFile),
                this.loadCSV(classesFile),
                this.loadCSV(edgelistFile)
            ]);

            this.features = features;
            this.classes = classes;
            this.edgelist = edges;
            this.isLoaded = true;

            console.log('✅ Elliptic dataset loaded successfully');
            console.log(`📊 Transactions: ${features.length}`);
            console.log(`🔗 Edges: ${edges.length}`);

            return this.processDataForVisualization();

        } catch (error) {
            console.error('❌ Failed to load Elliptic dataset:', error);
            throw error;
        }
    }

    async loadCSV(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.warn('CSV parsing warnings:', results.errors);
                    }
                    resolve(results.data);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    }

    processDataForVisualization() {
        if (!this.isLoaded) {
            throw new Error('Dataset not loaded yet');
        }

        console.log('🔄 Processing Elliptic data for visualization...');

        // Create a map of transaction ID to classification
        const classMap = {};
        this.classes.forEach(row => {
            if (row.txId && row.class) {
                classMap[row.txId] = parseInt(row.class);
            }
        });

        // Create nodes from transactions
        const nodes = this.features.map(row => {
            const txId = row.txId || row.id || row['0']; // Handle different column names
            const classification = classMap[txId] || 3; // Default to unknown

            // Determine node type based on classification
            let nodeType = 'unknown';
            let suspicious = false;
            let nodeColor = '#999999';

            if (classification === 1) { // Illicit
                nodeType = 'illicit';
                suspicious = true;
                nodeColor = '#dc3545';
            } else if (classification === 2) { // Licit
                nodeType = 'licit';
                nodeColor = '#28a745';
            }

            // Extract some key features for visualization
            const features = Object.keys(row).filter(key => key !== 'txId' && key !== 'id');
            const featureSum = features.reduce((sum, feature) => sum + (parseFloat(row[feature]) || 0), 0);

            return {
                data: {
                    id: `tx_${txId}`,
                    label: `TX ${String(txId).substring(0, 8)}...`,
                    type: 'transaction',
                    classification: nodeType,
                    suspicious: suspicious.toString(),
                    txId: txId,
                    featureSum: featureSum,
                    timestep: row.timestep || 1,
                    // Store original features for analysis
                    features: row
                }
            };
        });

        // Create edges from edgelist
        const edges = this.edgelist.map((row, index) => {
            const sourceId = row.txId1 || row.source || row['0'];
            const targetId = row.txId2 || row.target || row['1'];

            return {
                data: {
                    id: `edge_${index}`,
                    source: `tx_${sourceId}`,
                    target: `tx_${targetId}`,
                    amount: 1, // Elliptic doesn't provide amounts, use 1 for visualization
                    type: 'transaction_flow'
                }
            };
        });

        // Filter out nodes and edges that don't have valid connections
        const validNodeIds = new Set(nodes.map(n => n.data.id));
        const validEdges = edges.filter(e =>
            validNodeIds.has(e.data.source) && validNodeIds.has(e.data.target)
        );

        console.log(`✅ Processed ${nodes.length} nodes and ${validEdges.length} edges`);

        // Get statistics
        const illicitCount = nodes.filter(n => n.data.classification === 'illicit').length;
        const licitCount = nodes.filter(n => n.data.classification === 'licit').length;
        const unknownCount = nodes.filter(n => n.data.classification === 'unknown').length;

        console.log(`📊 Classifications: ${illicitCount} illicit, ${licitCount} licit, ${unknownCount} unknown`);

        return {
            nodes: nodes,
            edges: validEdges,
            statistics: {
                total: nodes.length,
                illicit: illicitCount,
                licit: licitCount,
                unknown: unknownCount,
                edges: validEdges.length
            }
        };
    }

    // Load a sample subset for performance
    loadSampleSubset(maxNodes = 1000) {
        if (!this.isLoaded) {
            throw new Error('Dataset not loaded yet');
        }

        console.log(`🔄 Creating sample subset with max ${maxNodes} nodes...`);

        // Get a balanced sample
        const classMap = {};
        this.classes.forEach(row => {
            if (row.txId && row.class) {
                classMap[row.txId] = parseInt(row.class);
            }
        });

        // Separate transactions by class
        const illicitTxs = [];
        const licitTxs = [];
        const unknownTxs = [];

        this.features.forEach(row => {
            const txId = row.txId || row.id || row['0'];
            const classification = classMap[txId] || 3;

            if (classification === 1) illicitTxs.push(row);
            else if (classification === 2) licitTxs.push(row);
            else unknownTxs.push(row);
        });

        // Sample proportionally
        const sampleSize = Math.min(maxNodes, this.features.length);
        const illicitSample = illicitTxs.slice(0, Math.floor(sampleSize * 0.1)); // 10% illicit
        const licitSample = licitTxs.slice(0, Math.floor(sampleSize * 0.4)); // 40% licit
        const unknownSample = unknownTxs.slice(0, Math.floor(sampleSize * 0.5)); // 50% unknown

        const sampleFeatures = [...illicitSample, ...licitSample, ...unknownSample];

        // Temporarily replace full dataset with sample
        const originalFeatures = this.features;
        this.features = sampleFeatures;

        const result = this.processDataForVisualization();

        // Restore original dataset
        this.features = originalFeatures;

        console.log(`✅ Sample subset created: ${result.nodes.length} nodes`);
        return result;
    }
}