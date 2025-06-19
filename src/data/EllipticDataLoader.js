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

            console.log('📊 Raw data loaded:');
            console.log('Features rows:', features?.length || 0);
            console.log('Classes rows:', classes?.length || 0);
            console.log('Edges rows:', edges?.length || 0);

            // Validate data
            if (!features || features.length === 0) {
                throw new Error('Features file is empty or invalid');
            }
            if (!classes || classes.length === 0) {
                throw new Error('Classes file is empty or invalid');
            }
            if (!edges || edges.length === 0) {
                throw new Error('Edges file is empty or invalid');
            }

            this.features = features;
            this.classes = classes;
            this.edgelist = edges;
            this.isLoaded = true;

            console.log('✅ Elliptic dataset loaded successfully');
            console.log('📊 Sample feature row:', features[0]);
            console.log('📊 Sample class row:', classes[0]);
            console.log('📊 Sample edge row:', edges[0]);

            return this.processDataForVisualization();

        } catch (error) {
            console.error('❌ Failed to load Elliptic dataset:', error);
            throw error;
        }
    }

    async loadCSV(file) {
        return new Promise((resolve, reject) => {
            console.log(`📄 Loading CSV file: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);

            // Check file size - warn if very large
            const fileSizeMB = file.size / 1024 / 1024;
            if (fileSizeMB > 100) {
                console.warn(`⚠️ Large file detected: ${fileSizeMB.toFixed(1)}MB. This may take a while.`);
            }

            if (fileSizeMB > 800) {
                reject(new Error(`File ${file.name} is too large (${fileSizeMB.toFixed(1)}MB). Please use a smaller subset of the data.`));
                return;
            }

            // Use simple parsing without web workers (more reliable)
            Papa.parse(file, {
                header: true,
                dynamicTyping: false,
                skipEmptyLines: true,
                delimiter: ',',
                preview: 20000, // Only parse first 20k rows for performance
                complete: function (results) {
                    console.log(`✅ Parsed ${file.name}:`);
                    console.log(`   - Rows: ${results.data.length}`);
                    console.log(`   - Columns: ${results.meta.fields ? results.meta.fields.length : 'unknown'}`);
                    console.log(`   - Field names:`, results.meta.fields?.slice(0, 10));

                    if (results.errors.length > 0) {
                        console.warn(`⚠️ CSV parsing warnings for ${file.name}:`, results.errors.slice(0, 3));
                    }

                    if (!results.data || results.data.length === 0) {
                        reject(new Error(`No data rows found in ${file.name}. File may be corrupted.`));
                        return;
                    }

                    // Show sample of first few rows
                    console.log(`📊 Sample rows from ${file.name}:`, results.data.slice(0, 2));

                    resolve(results.data);
                },
                error: function (error) {
                    console.error(`❌ Error parsing ${file.name}:`, error);
                    reject(new Error(`Failed to parse ${file.name}: ${error.message}`));
                }
            });
        });
    }

    processDataForVisualization() {
        if (!this.isLoaded) {
            throw new Error('Dataset not loaded yet');
        }

        console.log('🔄 Processing Elliptic data for visualization...');

        try {
            // Create a map of transaction ID to classification
            const classMap = {};
            this.classes.forEach((row, index) => {
                // Handle different possible column names for transaction ID
                const txId = row.txId || row.id || row['0'] || row.node_id || row.transaction_id;
                const classification = row.class || row['1'] || row.label || row.classification;

                if (txId !== undefined && txId !== null && classification !== undefined && classification !== null) {
                    classMap[txId] = parseInt(classification);
                } else if (index < 5) {
                    console.log(`Sample class row ${index} structure:`, Object.keys(row));
                    console.log(`Sample class row ${index} data:`, row);
                }
            });

            console.log(`📊 Created classification map with ${Object.keys(classMap).length} entries`);
            console.log('Sample classifications:', Object.entries(classMap).slice(0, 5));

            // Create nodes from transactions
            const nodes = [];
            this.features.forEach((row, index) => {
                try {
                    // Handle different possible column names for transaction ID
                    const txId = row.txId || row.id || row['0'] || row.node_id || row.transaction_id;

                    if (txId === undefined || txId === null) {
                        if (index < 5) {
                            console.log(`Sample feature row ${index} structure:`, Object.keys(row));
                            console.log(`Sample feature row ${index} data:`, row);
                        }
                        return; // Skip this row
                    }

                    const classification = classMap[txId] || 3; // Default to unknown

                    // Determine node type based on classification
                    let nodeType = 'unknown';
                    let suspicious = false;

                    if (classification === 1) { // Illicit
                        nodeType = 'illicit';
                        suspicious = true;
                    } else if (classification === 2) { // Licit
                        nodeType = 'licit';
                    }

                    // Extract some key features for visualization
                    const features = Object.keys(row).filter(key =>
                        key !== 'txId' && key !== 'id' && key !== '0' &&
                        key !== 'node_id' && key !== 'transaction_id' && key !== 'Time step'
                    );

                    const featureSum = features.reduce((sum, feature) => {
                        const value = parseFloat(row[feature]);
                        return sum + (isNaN(value) ? 0 : value);
                    }, 0);

                    nodes.push({
                        data: {
                            id: `tx_${txId}`,
                            label: `TX ${String(txId).substring(0, 8)}`,
                            type: 'transaction',
                            classification: nodeType,
                            suspicious: suspicious.toString(),
                            txId: txId,
                            featureSum: featureSum,
                            timestep: row['Time step'] || row.timestep || row.time_step || 1,
                            // Store original features for analysis
                            features: row
                        }
                    });
                } catch (error) {
                    console.warn(`Error processing feature row ${index}:`, error);
                }
            });

            console.log(`📊 Created ${nodes.length} nodes`);

            // Create edges from edgelist
            const edges = [];
            this.edgelist.forEach((row, index) => {
                try {
                    // Handle different possible column names
                    const sourceId = row.txId1 || row.source || row['0'] || row.from || row.node1;
                    const targetId = row.txId2 || row.target || row['1'] || row.to || row.node2;

                    if (sourceId !== undefined && sourceId !== null &&
                        targetId !== undefined && targetId !== null) {

                        edges.push({
                            data: {
                                id: `edge_${index}`,
                                source: `tx_${sourceId}`,
                                target: `tx_${targetId}`,
                                amount: 1, // Elliptic doesn't provide amounts, use 1 for visualization
                                type: 'transaction_flow'
                            }
                        });
                    } else if (index < 5) {
                        console.log('Sample edge row structure:', row);
                    }
                } catch (error) {
                    console.warn(`Error processing edge row ${index}:`, error);
                }
            });

            console.log(`📊 Created ${edges.length} edges`);

            // Filter out nodes and edges that don't have valid connections
            const validNodeIds = new Set(nodes.map(n => n.data.id));
            const validEdges = edges.filter(e =>
                validNodeIds.has(e.data.source) && validNodeIds.has(e.data.target)
            );

            console.log(`✅ Filtered to ${validEdges.length} valid edges`);

            // Get statistics
            const illicitCount = nodes.filter(n => n.data.classification === 'illicit').length;
            const licitCount = nodes.filter(n => n.data.classification === 'licit').length;
            const unknownCount = nodes.filter(n => n.data.classification === 'unknown').length;

            console.log(`📊 Classifications: ${illicitCount} illicit, ${licitCount} licit, ${unknownCount} unknown`);

            const result = {
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

            console.log('✅ Data processing complete');
            return result;

        } catch (error) {
            console.error('❌ Error processing data:', error);
            throw new Error(`Data processing failed: ${error.message}`);
        }
    }

    // Load a sample subset for performance
    loadSampleSubset(maxNodes = 500) { // Reduced default from 1000 to 500
        if (!this.isLoaded) {
            throw new Error('Dataset not loaded yet');
        }

        console.log(`🔄 Creating sample subset with max ${maxNodes} nodes...`);

        try {
            // Get a balanced sample
            const classMap = {};
            this.classes.forEach(row => {
                const txId = row.txId || row.id || row['0'] || row.node_id || row.transaction_id;
                const classification = row.class || row['1'] || row.label || row.classification;

                if (txId !== undefined && txId !== null && classification !== undefined && classification !== null) {
                    classMap[txId] = parseInt(classification);
                }
            });

            // Separate transactions by class - but limit how many we look at
            const illicitTxs = [];
            const licitTxs = [];
            const unknownTxs = [];

            // Only look at first portion of data for performance
            const maxRowsToExamine = Math.min(this.features.length, 10000);
            console.log(`📊 Examining first ${maxRowsToExamine} of ${this.features.length} transactions`);

            for (let i = 0; i < maxRowsToExamine; i++) {
                const row = this.features[i];
                const txId = row.txId || row.id || row['0'] || row.node_id || row.transaction_id;
                if (txId === undefined || txId === null) continue;

                const classification = classMap[txId] || 3;

                if (classification === 1) {
                    illicitTxs.push(row);
                } else if (classification === 2) {
                    licitTxs.push(row);
                } else {
                    unknownTxs.push(row);
                }

                // Stop early if we have enough of each type
                if (illicitTxs.length >= maxNodes * 0.2 &&
                    licitTxs.length >= maxNodes * 0.4 &&
                    unknownTxs.length >= maxNodes * 0.4) {
                    break;
                }
            }

            console.log(`📊 Found transactions: ${illicitTxs.length} illicit, ${licitTxs.length} licit, ${unknownTxs.length} unknown`);

            // Sample proportionally with smaller numbers
            const sampleSize = Math.min(maxNodes, maxRowsToExamine);
            const illicitSample = illicitTxs.slice(0, Math.min(Math.floor(sampleSize * 0.15), illicitTxs.length, 50)); // Max 50 illicit
            const licitSample = licitTxs.slice(0, Math.min(Math.floor(sampleSize * 0.35), licitTxs.length, 200)); // Max 200 licit
            const unknownSample = unknownTxs.slice(0, Math.min(Math.floor(sampleSize * 0.5), unknownTxs.length, 250)); // Max 250 unknown

            const sampleFeatures = [...illicitSample, ...licitSample, ...unknownSample];

            console.log(`📊 Final sample: ${illicitSample.length} illicit, ${licitSample.length} licit, ${unknownSample.length} unknown`);

            // Temporarily replace full dataset with sample
            const originalFeatures = this.features;
            this.features = sampleFeatures;

            const result = this.processDataForVisualization();

            // Restore original dataset
            this.features = originalFeatures;

            console.log(`✅ Sample subset created: ${result.nodes.length} nodes, ${result.edges.length} edges`);
            return result;

        } catch (error) {
            console.error('❌ Error creating sample subset:', error);
            throw new Error(`Sample creation failed: ${error.message}`);
        }
    }
}