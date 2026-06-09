document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value;
    const contraseña = document.getElementById("password").value;

    const respuesta = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            correo,
            contraseña
        })
    });

    const data = await respuesta.json();

    if (respuesta.ok) {
        document.getElementById("mensaje").innerText =
            `Bienvenido ${data.nombre}`;
    } else {
        document.getElementById("mensaje").innerText =
            data.detail;
    }
});