document.addEventListener("DOMContentLoaded", () => {
    const cifrarBoton = document.getElementById("cifrar");
    const descifrarBoton = document.getElementById("descifrar");
    const borrarBoton = document.getElementById("cancelar");
    const guardarBoton = document.getElementById("guardar");
    const copiarBoton = document.getElementById("copiar");

    document.getElementById('copiarLink').addEventListener('click', function(e) {
        e.preventDefault();

        const link = "https://enigma-o4tx.onrender.com"
        navigator.clipboard.writeText(link).then(function() {
            alert('URL copiada al portapapeles: ' + link + ' ya puedes compartir la app con tus contactos, gracias.');
        }).catch(function(err) {
            console.error('no se pudo copiar, por favor comunicate con nosotros: ', err);
        });
    });

    const cifrarMensaje = (event) => {
        event.preventDefault();

        const texto = document.getElementById("mensajeSinProcesar").value.trim();
        const clave = document.getElementById("claveCifrado").value.trim();
        const tipoCifrado = document.querySelector('input[name="tipoCifrado"]:checked').value;

        let mensaje = texto.toUpperCase();
        let mensajeCifrado = "";
        
        if (tipoCifrado === "Atbash") {
            const caracteres = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ1234567890";
            const alfabetoInverso = caracteres.split("").reverse().join("");

            for (let i = 0; i < mensaje.length; i++) {
                let letra = mensaje[i];

                if (caracteres.includes(letra)) {
                    let posicion = caracteres.indexOf(letra);
                    let nuevaLetra = alfabetoInverso[posicion];
                    mensajeCifrado += nuevaLetra;
                } else {
                    mensajeCifrado += letra;
                }
            }
        } else if (tipoCifrado === "Cesar") {
            let desplazamiento = clave.length;
            const caracteres = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ1234567890.,/:@#$%^&*()+-*<>=?¿¡!";

            for (let i = 0; i < mensaje.length; i++) {
                let letra = mensaje[i];

                if (caracteres.includes(letra)) {
                    let posicion = caracteres.indexOf(letra);
                    let nuevaPosicion = (posicion + desplazamiento) % caracteres.length;
                    let nuevaLetra = caracteres[nuevaPosicion];

                    mensajeCifrado += nuevaLetra;
                } else {
                    mensajeCifrado += letra;
                }
            }
        }

        document.getElementById("mensajeProcesado").textContent = mensajeCifrado;
    };

    const copiarSinGuardar = (event) =>{
        event.preventDefault();
        const mensaje= document.getElementById("mensajeProcesado").value;
        const tipoCifrado = document.querySelector('input[name="tipoCifrado"]:checked').value;
        const clave = document.getElementById("claveCifrado").value.trim();

        const texto = `${clave}\n${tipoCifrado}\n${mensaje}`;
    
        const textarea = document.createElement('textarea');
        textarea.value = texto;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    
        alert('Mensaje copiado al portapapeles');
    };

    borrarBoton.addEventListener("click", () => {
        document.getElementById("mensajeSinProcesar").value = "";
        document.getElementById("claveCifrado").value = "";
        document.getElementById("mensajeProcesado").textContent = "....Aqui se podra leer el mensaje ya procesado....";
    });
    

    const descifrarMensaje = (event) => {
        event.preventDefault();
        
        const texto = document.getElementById("mensajeSinProcesar").value.trim();
        const clave = document.getElementById("claveCifrado").value.trim();
        const tipoCifrado = document.querySelector('input[name="tipoCifrado"]:checked').value;

        let mensaje = texto.toUpperCase();
        let mensajeDescifrado = "";

        if (tipoCifrado === "Atbash") {
            const caracteres = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ1234567890";
            const alfabetoInverso = caracteres.split("").reverse().join("");

            for (let i = 0; i < mensaje.length; i++) {
                let letra = mensaje[i];

                if (caracteres.includes(letra)) {
                    let posicion = caracteres.indexOf(letra);
                    let nuevaLetra = alfabetoInverso[posicion];
                    mensajeDescifrado += nuevaLetra;
                } else {
                    mensajeDescifrado += letra;
                }
            }
        } else if (tipoCifrado === "Cesar") {
            let desplazamiento = (clave.length)*-1;
            const caracteres = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ1234567890.,/:@#$%^&*()+-*<>=?¿¡!";

            for (let i = 0; i < mensaje.length; i++) {
                let letra = mensaje[i];

                if (caracteres.includes(letra)) {
                    let posicion = caracteres.indexOf(letra);
                    let nuevaPosicion = (posicion + desplazamiento) % caracteres.length;
                    let nuevaLetra = caracteres[nuevaPosicion];
                    mensajeDescifrado += nuevaLetra;
                } else {
                    mensajeDescifrado += letra;
                }
            }
        }
        document.getElementById("mensajeProcesado").textContent = mensajeDescifrado;
    };

    

    const borrarCampos = () => {
        document.getElementById("mensajeSinProcesar").value = "";
        document.getElementById("claveCifrado").value = "";
        document.getElementById("mensajeProcesado").textContent = "....Aquí se podrá leer el mensaje ya procesado....";
    };

    const guardarMensaje = async (event) => {
        event.preventDefault();
                // Actualiza la tabla dinámicamente
                const mensaje= document.getElementById("mensajeProcesado").value;
                const tipoCifrado = document.querySelector('input[name="tipoCifrado"]:checked').value;
                const clave = document.getElementById("claveCifrado").value.trim();
                const tabla = document.getElementById("mensajesPrevios").getElementsByTagName('tbody')[0];

                const botonesBDBorrar = `<button type="button" class="btn btn-danger m-1">
                                            <i class="bi bi-trash3-fill" style="color:black"></i>
                                        </button>`;
                const botonesCopiar = `<button type="button" class="btn btn-primary m-1">
                                        <i class="bi bi-copy"></i>
                                        </button>`;

                let fila = tabla.insertRow();
                let celda1 = fila.insertCell(0);
                let celda2 = fila.insertCell(1);
                let celda3 = fila.insertCell(2);
                let celda4 = fila.insertCell(3);

                celda1.innerHTML = clave;
                celda2.innerHTML = tipoCifrado;
                celda3.innerHTML = mensaje;
                celda4.innerHTML = botonesBDBorrar + botonesCopiar;

                borrarCampos();
            };
    const borrarMensaje = async (clave, mensaje, fila) => {
                fila.remove();
            };
    const copiarMensaje = (button) => {
        const fila = button.closest('tr');
        const clave = fila.cells[0].innerText;
        const tipoCifrado = fila.cells[1].innerText;
        const mensaje = fila.cells[2].innerText;
        const texto = `${clave}\n${tipoCifrado}\n${mensaje}`;
    
        const textarea = document.createElement('textarea');
        textarea.value = texto;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    
        alert('Mensaje copiado al portapapeles');
    };

    document.getElementById('mensajesPrevios').addEventListener('click', (event) => {
        if (event.target.closest('.btn-danger')) {
            const fila = event.target.closest('tr');
            const clave = fila.cells[0].textContent;
            const mensaje = fila.cells[2].textContent;
            borrarMensaje(clave, mensaje, fila);
        }
    });

    document.addEventListener('click', (event) => {
        if (event.target.closest('.btn-primary')) {
            copiarMensaje(event.target.closest('.btn-primary'));
        }
    });


    cifrarBoton.addEventListener("click", cifrarMensaje);
    descifrarBoton.addEventListener("click", descifrarMensaje);
    borrarBoton.addEventListener("click", borrarCampos);
    guardarBoton.addEventListener("click", guardarMensaje);
    copiarBoton.addEventListener("click", copiarSinGuardar);

});
