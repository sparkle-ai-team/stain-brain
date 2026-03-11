import http.server
import os
os.chdir('/Users/isabellaarnold/stain-brain-app')
http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler, port=8080)
