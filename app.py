from flask import Flask, send_from_directory

app = Flask(__name__, static_folder='C:\\Users\\sofia\\OneDrive\\Desktop\\LPNU\\LPNU\\term_04\\PVI\\lab\\PI_04')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/index.html')
def index1():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/service-worker.js')
def service_worker():
    return send_from_directory(app.static_folder, 'service-worker.js')  

@app.route('/manifest.json')
def manifest():
    return send_from_directory(app.static_folder, 'manifest.json')  

@app.route('/assets')
def assets():
    return send_from_directory(app.static_folder, 'assets')  

@app.route('/styles.css')
def styles():
    return send_from_directory(app.static_folder, 'styles.css')  

@app.route('/script.js')
def script():
    return send_from_directory(app.static_folder, 'script.js')  

@app.route('/assets/avatar.png')
def assets_avatar():
    return send_from_directory(app.static_folder, 'assets/avatar.png')  

@app.route('/assets/user-avatar.png')
def assets_user_avatar():
    return send_from_directory(app.static_folder, '/assets/user-avatar.png')  

@app.route('/assets/logo.png')
def assets_logo():
    return send_from_directory(app.static_folder, '/assets/logo.png')  

@app.route('/students/students.html')
def student_html():
    return send_from_directory(app.static_folder, '/students/students.html')  

@app.route('/students/students.js')
def student_js():
    return send_from_directory(app.static_folder, '/students/students.js')  

@app.route('/students/students.css')
def student_css():
    return send_from_directory(app.static_folder, '/students/students.css')  

@app.route('/tasks/tasks.html')
def tasks_html():
    return send_from_directory(app.static_folder, '/tasks/tasks.html')  

@app.route('/tasks/tasks.js')
def tasks_js():
    return send_from_directory(app.static_folder, '/tasks/tasks.js')  

@app.route('/tasks/tasks.css')
def tasks_css():
    return send_from_directory(app.static_folder, '/tasks/tasks.css')  

@app.route('/dashboard/dashboard.html')
def dashboard_html():
    return send_from_directory(app.static_folder, '/dashboard/dashboard.html')  

@app.route('/dashboard/dashboard.js')
def dashboard_js():
    return send_from_directory(app.static_folder, '/dashboard/dashboard.js')  

@app.route('/dashboard/dashboard.css')
def dashboard_css():
    return send_from_directory(app.static_folder, '/dashboard/dashboard.css')  


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=443,
        ssl_context=('C:\\192.168.0.111+1.pem', 'C:\\192.168.0.111+1-key.pem')
    )
