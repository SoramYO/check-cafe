const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Parse URL to get pathname without query parameters
    const parsedUrl = url.parse(req.url);
    let filePath = '.' + parsedUrl.pathname;
    
    console.log(`📥 Request: ${req.url}`);
    console.log(`📁 File path: ${filePath}`);
    
    // Default to index.html for root
    if (filePath === './') {
        filePath = './index.html';
    }

    // Get file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';

    // Read file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(`❌ File not found: ${filePath}`);
                
                // Chỉ redirect về index.html nếu:
                // 1. Không phải là file HTML cụ thể
                // 2. Hoặc là route động (không có extension)
                const isHtmlFile = extname === '.html';
                const hasExtension = extname !== '';
                
                if (isHtmlFile) {
                    // Nếu là file HTML cụ thể nhưng không tồn tại, trả về 404
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>404 - Không tìm thấy trang</title>
                            <style>
                                body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
                                .error { color: #dc2626; font-size: 24px; margin-bottom: 20px; }
                                .back-link { color: #2563eb; text-decoration: none; }
                            </style>
                        </head>
                        <body>
                            <div class="error">404 - Không tìm thấy trang</div>
                            <p>File <code>${filePath}</code> không tồn tại.</p>
                            <a href="/" class="back-link">← Về trang chủ</a>
                        </body>
                        </html>
                    `);
                } else if (!hasExtension) {
                    // Chỉ redirect về index.html cho các route không có extension (SPA routing)
                    console.log('🔄 Redirecting to index.html for SPA routing');
                    fs.readFile('./index.html', (error, content) => {
                        if (error) {
                            res.writeHead(500);
                            res.end('Server Error: ' + error.code);
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(content, 'utf-8');
                        }
                    });
                } else {
                    // File tĩnh không tồn tại
                    res.writeHead(404);
                    res.end('File not found');
                }
            } else {
                console.log(`💥 Server error: ${error.code}`);
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            console.log(`✅ Serving: ${filePath} (${mimeType})`);
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 CheckCafe Landing Page Server running at:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://0.0.0.0:${PORT}`);
    console.log('');
    console.log('💡 Press Ctrl+C to stop the server');
    console.log('');
    console.log('📋 Available pages:');
    console.log('   http://localhost:3001/              (index.html)');
    console.log('   http://localhost:3001/detail.html   (detail page)');
    console.log('   http://localhost:3001/posts.html    (posts page)');
});