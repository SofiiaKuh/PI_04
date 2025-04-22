import ssl
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Create the HTTP server on port 8000, using the default request handler
httpd = HTTPServer(('0.0.0.0', 8000), SimpleHTTPRequestHandler)

# Create an SSL context and load the certificate and key
context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
context.load_cert_chain(certfile='C://127.0.0.1+1.pem', keyfile='C://127.0.0.1+1-key.pem')

# Wrap the server socket with SSL for secure connections
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print("Serving on https://0.0.0.0:8000")
httpd.serve_forever()
