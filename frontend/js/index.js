const usuarios = [
    {
        correo: "dilan@datacore.com",
        password: "123456"
    },
    {
        correo: "valero@datacore.com",
        password: "123456"
    }
];

function iniciarSesion(event){

    event.preventDefault();

    let usuario = document.getElementById("usuario").value;
    let password = document.getElementById("password").value;

    let valido = usuarios.find(
        u => u.correo === usuario && u.password === password
    );

    if(valido){
        window.location.href = "dashboard.html";
    }else{
        alert("Usuario o contraseña incorrectos");
    }
}