// Obtiene el ID del producto desde la URL usando la última parte de la ruta
const productId = window.location.pathname.split("/").pop();
console.log("Product ID from URL:", productId); 

// Función para cargar los detalles del producto
async function loadProductDetails() {
    try {
        const response = await fetch(jsonURL);
        const products = await response.json();

        const producto = products.find(item => item.id === productId);

        if (producto) {
            document.getElementById('product-title').textContent = producto.titulo;
            document.getElementById('product-image').src = producto.imagen;
            document.getElementById('product-image').alt = producto.titulo;
            document.getElementById('product-category').textContent = `Categoría: ${producto.categoria.nombre}`;
            document.getElementById('product-price').textContent = `Precio: $${new Intl.NumberFormat('es-ES').format(producto.precio)}`;
            document.getElementById('product-description').textContent = producto.descripcion;

            const botonAgregar = document.createElement('button');
            botonAgregar.classList.add('producto-agregar');
            botonAgregar.textContent = 'Agregar al Carrito';
            botonAgregar.id = producto.id;

            botonAgregar.addEventListener('click', () => agregarAlCarrito(producto));
            document.getElementById('producto-agregar').appendChild(botonAgregar);
        } else {
            document.getElementById('product-title').textContent = "Producto no encontrado";
        }
    } catch (error) {
        console.error("Error al cargar los detalles del producto:", error);
    }
}

// Inicialización de carrito desde localStorage
let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];
actualizarNumerito();

// Función para agregar el producto al carrito en el servidor y en localStorage
async function agregarAlCarrito(producto) {
    try {
        const response = await fetch('/agregar_carrito', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ producto_id: producto.id })
        });

        const data = await response.json();

        if (!data.ok) {
            alert(data.message);
            if (response.status === 401) {
                window.location.href = "/login";  // Redirigir al login si no está logueado
            }
            return;
        }

        // Muestra confirmación con Toastify
        Toastify({
            text: "Producto agregado",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#2e2e2e",
                borderRadius: "2rem",
                textTransform: "uppercase",
                fontSize: ".75rem"
            },
            offset: { x: '1.5rem', y: '1.5rem' }
        }).showToast();

        // Actualizar carrito en localStorage
        const index = productosEnCarrito.findIndex(item => item.id === producto.id);

        if (index !== -1) {
            productosEnCarrito[index].cantidad++;
        } else {
            const productoAgregado = { ...producto, cantidad: 1 }; 
            productosEnCarrito.push(productoAgregado);
        }

        localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
        actualizarNumerito();

    } catch (error) {
        console.error('Error al agregar al carrito:', error);
    }
}

// Actualiza el contador de productos en el carrito
function actualizarNumerito() {
    const nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    document.getElementById('numerito').textContent = nuevoNumerito;
}

// Llama a la función para cargar los detalles del producto
loadProductDetails();
