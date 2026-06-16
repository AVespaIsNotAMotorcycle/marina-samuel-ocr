from http.server import BaseHTTPRequestHandler, HTTPServer
import time
import json
from ocr import NeuralNetwork

hostName = "localhost"
serverPort = 8080

class MyServer(BaseHTTPRequestHandler):
    nn = NeuralNetwork(50)
    nn._load()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        return super().end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write(bytes("<html><head><title>https://pythonbasics.org</title></head>", "utf-8"))
        self.wfile.write(bytes("<p>Request: %s</p>" % self.path, "utf-8"))
        self.wfile.write(bytes("<body>", "utf-8"))
        self.wfile.write(bytes("<p>This is an example web server.</p>", "utf-8"))
        self.wfile.write(bytes("</body></html>", "utf-8"))

    def do_POST(self):
        response_code = 200
        response = ""
        var_len = int(self.headers.get('Content-Length'))
        content = self.rfile.read(var_len);
        payload = json.loads(content);

        if payload.get('train'):
            try:
                response = {
                    "type": "train",
                    "result": self.nn.train(payload['trainArray'])
                }
                self.nn.save()
            except Exception as inst:
                print(inst)
                response_code = 500
        elif payload.get('predict'):
            try:
                response = {
                    "type": "test",
                    "result": self.nn.predict(str(payload['image'])),
                }
            except Exception as inst:
                print(inst)
                response_code = 500
        else:
            response_code = 400
    
        self.send_response(response_code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        if response:
            self.wfile.write(bytes(json.dumps(response), 'utf-8'))

        return

if __name__ == "__main__":
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")

