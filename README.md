# 🔍 Crypto Compliance Network Visualizer

> An interactive web application for visualizing cryptocurrency transaction networks and detecting suspicious patterns using advanced graph theory and force-directed layouts.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.x-blue.svg)](https://cytoscape.org/)

## 🌟 Features

- **Interactive Network Visualization** - Explore crypto wallet connections with smooth pan, zoom, and node selection
- **Suspicious Pattern Detection** - Automatically identify circular transactions and illicit activity patterns
- **Real Dataset Support** - Load and analyze the Elliptic++ Bitcoin transaction dataset
- **Modern Dark UI** - Beautiful, professional interface with animated backgrounds and status indicators
- **Search & Filter** - Find specific wallets, transactions, or addresses instantly
- **Force-Directed Layouts** - Advanced graph positioning using Cose-Bilkent algorithm
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🎯 Learning Objectives

This project demonstrates key concepts in:

- **Graph Theory Fundamentals**
  - Nodes (wallets/exchanges) and edges (transactions)
  - Network topology and connectivity analysis
  - Centrality measures and pattern recognition

- **Force-Directed Layouts**
  - Spring-embedder algorithms
  - Node repulsion and edge attraction forces
  - Real-time physics-based positioning

- **Network Data Structure**
  - Efficient graph data representation
  - Filtering and querying large datasets
  - Performance optimization for 1000+ nodes

## 🛠️ Tech Stack

### Frontend
- **HTML5/CSS3** - Modern responsive layout with CSS Grid and Flexbox
- **Vanilla JavaScript (ES6+)** - No framework dependencies, pure performance
- **Cytoscape.js** - Professional graph visualization library
- **Inter Font** - Clean, readable typography

### Graph Extensions
- **Cytoscape Cose-Bilkent** - Advanced force-directed layout algorithm
- **Cytoscape Popper** - Tooltip and context menu positioning

### Data Sources
- **Elliptic++ Dataset** - Real Bitcoin transaction data with illicit/licit labels
- **Sample Mock Data** - Built-in demo data for testing and learning

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for file loading security)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/crypto-network-visualizer.git
   cd crypto-network-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or if you prefer yarn
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or with a simple HTTP server
   python -m http.server 8000
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

### Project Structure
```
crypto-network-visualizer/
├── index.html              # Main application page
├── src/
│   ├── index.js            # Core application logic
│   ├── data/
│   │   └── EllipticDataLoader.js  # Dataset processing
│   └── styles/
│       └── main.css        # Enhanced styling
├── dist/
│   └── bundle.js          # Compiled JavaScript
├── datasets/              # Sample data files
├── package.json
└── README.md
```

## 📊 Usage

### Loading Sample Data
1. Click **"Load Sample Data"** to see a demo network
2. Explore nodes by clicking and dragging
3. Click on any node to view detailed information
4. Use the search bar to find specific addresses

### Working with Elliptic Dataset
1. Download the [Elliptic++ Dataset](https://drive.google.com/drive/folders/1MRPXz79Lu_JGLlJ21MDfML44dKN9R08l)
2. Click **"Load Elliptic Dataset"** in the application
3. Upload the three required CSV files:
   - `txs_features.csv` - Transaction features and metadata
   - `txs_classes.csv` - Ground-truth illicit/licit classifications
   - `txs_edgelist.csv` - Transaction relationships and connections

### Pattern Detection
- Click **"Detect Patterns"** to highlight suspicious activities
- **Red highlights** - Illicit-to-illicit transaction connections
- **Yellow highlights** - Circular transaction patterns
- **Green highlights** - Verified legitimate transactions

### Search & Navigation
- Use the search bar to find addresses, transaction IDs, or classifications
- **Pan** - Click and drag background
- **Zoom** - Mouse wheel or pinch gestures
- **Select** - Click on nodes to view details

## 🎨 Visual Features

### Node Types
- **💙 Wallet Nodes** - Individual cryptocurrency addresses (blue circles)
- **🔶 Exchange Nodes** - Centralized exchange addresses (orange diamonds)
- **🔴 Suspicious Nodes** - Flagged illicit addresses (red with glow effect)

### Interactive States
- **Hover Effects** - Smooth animations and highlighting
- **Selection Glow** - Purple outline for selected nodes
- **Connection Highlighting** - Shows direct neighbors and relationships
- **Search Results** - Yellow dashed borders for matching nodes

## 📈 Dataset Information

### Elliptic++ Dataset
The Elliptic++ dataset contains:
- **203,769 Bitcoin transactions** with labeled classifications
- **21,557 illicit transactions** (10.77% of total)
- **42,019 licit transactions** (20.94% of total)
- **140,193 unknown transactions** requiring analysis
- **234,355 directed edges** representing Bitcoin flows

**Classification Categories:**
- 🔴 **Illicit** - Ransomware, scams, darknet markets, theft
- 🟢 **Licit** - Exchanges, mining pools, legitimate services
- ⚫ **Unknown** - Unclassified transactions for research

### Data Processing
- **Performance Optimization** - Loads subset of 200 nodes for smooth interaction
- **Feature Engineering** - Aggregates 166 transaction features into meaningful metrics
- **Temporal Analysis** - 49 timesteps covering Bitcoin transaction history

## 🔧 Configuration

### Layout Algorithms
```javascript
// Cose-Bilkent (Force-directed) - Default
{
  name: 'cose-bilkent',
  nodeRepulsion: 8000,
  idealEdgeLength: 100,
  edgeElasticity: 0.3
}

// Circle Layout - Simple demo
{
  name: 'circle',
  radius: 200,
  padding: 50
}
```

### Styling Customization
Modify CSS variables in `main.css`:
```css
:root {
  --accent-primary: #8b5cf6;    /* Purple theme */
  --accent-secondary: #06b6d4;  /* Cyan highlights */
  --danger: #ef4444;            /* Suspicious nodes */
  --success: #10b981;           /* Legitimate nodes */
}
```

## 🚨 Security & Privacy

- **Local Processing** - All data analysis happens in your browser
- **No Data Transmission** - Uploaded files never leave your computer
- **Privacy First** - No tracking, analytics, or external API calls
- **Open Source** - Full transparency in code and algorithms

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow ES6+ JavaScript standards
- Use semantic commit messages
- Add comments for complex graph algorithms
- Test with both sample and real datasets
- Ensure responsive design compatibility

## 🎓 Educational Resources

### Graph Theory Concepts
- [Introduction to Graph Theory](https://en.wikipedia.org/wiki/Graph_theory)
- [Force-Directed Graph Drawing](https://en.wikipedia.org/wiki/Force-directed_graph_drawing)
- [Network Analysis Fundamentals](https://www.coursera.org/learn/networks-illustrated)

### Cryptocurrency Analysis
- [Blockchain Transaction Analysis](https://arxiv.org/abs/1906.07852)
- [Anti-Money Laundering in Cryptocurrency](https://blog.elliptic.co/)
- [Graph Neural Networks for Fraud Detection](https://paperswithcode.com/task/fraud-detection)

### Technical Documentation
- [Cytoscape.js Documentation](https://js.cytoscape.org/)
- [Web Performance Optimization](https://developers.google.com/web/fundamentals/performance)
- [Modern JavaScript Features](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 🔮 Future Enhancements

### Planned Features
- [ ] **Machine Learning Integration** - Automated suspicious pattern classification
- [ ] **Temporal Analysis** - Timeline visualization of transaction flows
- [ ] **Export Capabilities** - Save graphs as PNG, SVG, or JSON
- [ ] **Advanced Filtering** - Multi-criteria node and edge filtering
- [ ] **3D Visualization** - Three.js integration for immersive exploration
- [ ] **Real-time Data** - Live blockchain data integration
- [ ] **Community Detection** - Automatic wallet clustering algorithms

### Performance Improvements
- [ ] **Web Workers** - Background data processing
- [ ] **Virtual Scrolling** - Handle 10,000+ node networks
- [ ] **WebGL Rendering** - Hardware-accelerated graphics
- [ ] **Progressive Loading** - Stream large datasets efficiently

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Elliptic Inc.** - For providing the comprehensive Bitcoin transaction dataset
- **Cytoscape Consortium** - For the powerful graph visualization library
- **Bitcoin Community** - For creating the foundational blockchain technology
- **Open Source Contributors** - For the ecosystem of tools and libraries

## 📧 Contact

- **GitHub Issues** - [Report bugs or request features](https://github.com/your-username/crypto-network-visualizer/issues)
- **Email** - caiqingyang28@gmail.com
- **LinkedIn** - www.linkedin.com/in/caiqingyang

---

**⭐ Star this repository if you found it helpful!**

*Built with ❤️ for the cryptocurrency analysis and graph visualization community*
