let filaEditando = null;

function crearProducto() {

    filaEditando = null;

    document.getElementById("tituloModal").innerText = "Crear Producto";

    document.getElementById("nombre").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("precio").value = "";

    document.getElementById("modalProducto").style.display = "flex";
}

function editarProducto(boton) {

    filaEditando = boton.parentElement.parentElement;

    document.getElementById("tituloModal").innerText = "Editar Producto";

    document.getElementById("nombre").value =
        filaEditando.cells[0].innerText;

    document.getElementById("categoria").value =
        filaEditando.cells[1].innerText;

    document.getElementById("stock").value =
        filaEditando.cells[2].innerText;

    document.getElementById("precio").value =
        filaEditando.cells[3].innerText.replace("$","");

    document.getElementById("modalProducto").style.display = "flex";
}

function guardarProducto() {

let nombre = document.getElementById("nombre").value.trim();
let categoria = document.getElementById("categoria").value.trim();
let stock = document.getElementById("stock").value.trim();
let precio = document.getElementById("precio").value.trim();
let fechaVencimiento = document.getElementById("fechaVencimiento").value;

if(!nombre || !categoria || !stock || !precio){
    alert("Debe completar todos los campos obligatorios.");
    return;


    }else{

        let tabla = document.querySelector("tbody");

        let fila = document.createElement("tr");

        let nombre = document.getElementById("nombre").value.trim();
let categoria = document.getElementById("categoria").value.trim();
let stock = document.getElementById("stock").value.trim();
let precio = document.getElementById("precio").value.trim();
let fechaVencimiento = document.getElementById("fechaVencimiento").value;

if(!nombre || !categoria || !stock || !precio){
    alert("Debe completar todos los campos obligatorios.");
    return;


    }else{

        let tabla = document.querySelector("tbody");

        let fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${nombre}</td>
                <td>${categoria}</td>
                <td>${stock}</td>
                <td>$${precio}</td>
                <td>${fechaVencimiento || "No aplica"}</td>
                <td>
                <button class="btn-editar" onclick="editarProducto(this)">
                    Editar
                </button>

                <button class="btn-eliminar" onclick="eliminarProducto(this)">
                    Eliminar
                </button>
                </td>
                `;

        tabla.appendChild(fila);
    }

    cerrarModal();

        tabla.appendChild(fila);
    }

    cerrarModal();
}

function cerrarModal(){
    document.getElementById("modalProducto").style.display = "none";
}

function eliminarProducto(boton){

    if(confirm("¿Desea eliminar este producto?")){
        boton.parentElement.parentElement.remove();
    }
}
function cerrarSesion() {
    window.location.href = "index.html";
}