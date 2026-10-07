import os
import sys
import http.server
import socketserver

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class StoreHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def translate_path(self, path):
        clean_path = path.split('?')[0].split('#')[0].lstrip('/')
        
        # Route /accounts/ to public/accounts/
        if clean_path.startswith('accounts/'):
            mapped = os.path.join(DIRECTORY, 'public', clean_path)
            # If account-06 is requested, also check account-07
            if not os.path.exists(mapped) and 'account-06' in clean_path:
                alt = os.path.join(DIRECTORY, 'public', clean_path.replace('account-06', 'account-07'))
                if os.path.exists(alt):
                    return alt
            if os.path.exists(mapped):
                return mapped

        return super().translate_path(path)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('', PORT), StoreHandler) as httpd:
        print(f'SONU FF STORE Server active at http://localhost:{PORT}', flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('Server stopped.')
