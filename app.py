from flask import Flask, request, render_template, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

class User(db.Model):
    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

# Ruta para agregar productos al carrito con verificación de usuario autenticado
@app.route('/agregar_carrito', methods=['POST'])
def agregar_carrito():
    # Verifica si el usuario está logueado
    if 'username' not in session:
        return jsonify({"message": "Debes iniciar sesión para agregar productos al carrito.", "ok": False}), 401

    # Obtener el ID del producto desde la solicitud JSON
    data = request.get_json()
    producto_id = data.get("producto_id")
    
    # Aquí puedes manejar la lógica de agregar al carrito (por ejemplo, guardarlo en la sesión o base de datos)
    # En este ejemplo, asumimos que agregaremos el producto al carrito en la sesión
    if 'carrito' not in session:
        session['carrito'] = []
    session['carrito'].append(producto_id)
    
    return jsonify({"message": "Producto agregado", "ok": True}), 200

@app.route('/carrito')
def carrito():
    # Verifica si el usuario está logueado
    if 'username' not in session:
        flash('Debes estar logueado para acceder al carrito.')
        return redirect(url_for('login'))  # Redirige al inicio de sesión
    return render_template('carrito.html')

@app.route('/is_logged_in')
def is_logged_in():
    return {'logged_in': 'username' in session}

@app.route('/logout')
def logout():
    session.pop('username', None)  # Elimina el nombre de usuario de la sesión
    return redirect(url_for('index'))

@app.route('/producto/<id>')  
def detalle_producto(id):
    return render_template('detalle_producto.html', product_id=id)

@app.route('/')
def index():
    return render_template('index.html')  # Cargar index.html como la página principal

@app.route('/login')
def login():
    return render_template('login.html')  # Cargar login.html en la ruta /login

@app.route('/formulario_compra')
def formulario_compra():
    return render_template('formulario_compra.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    # Verificación de usuario o correo duplicado
    if User.query.filter((User.username == username) | (User.email == email)).first():
        flash("El usuario o correo ya existen.", "error")
        return redirect(url_for('register'))  # Redirigir a la página de login

    # Crear y guardar nuevo usuario
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    flash("Usuario registrado con éxito.", "success")
    return redirect(url_for('login'))  # Redirigir después de registrar exitosamente


@app.route('/login', methods=['POST'])
def perform_login():
    username = request.form.get('username')
    password = request.form.get('password')

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password, password):
        session['username'] = username  # Guarda el nombre de usuario en la sesión
        return redirect(url_for('index'))  # Redirige al index en caso de éxito
    else:
        flash("Nombre de usuario o contraseña incorrectos.", "error")
        return redirect(url_for('login'))  # Redirige al login en caso de fallo


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crea las tablas si no existen
    app.run(debug=True)
