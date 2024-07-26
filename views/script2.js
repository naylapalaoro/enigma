document.addEventListener("DOMContentLoaded", () => {
    const cifrarBoton = document.getElementById("cifrar");
    const descifrarBoton = document.getElementById("descifrar");
    const borrarBoton = document.getElementById("cancelar");
    const guardarBoton = document.getElementById("guardar");

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

    cifrarBoton.addEventListener("click", cifrarMensaje);

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

    descifrarBoton.addEventListener("click", descifrarMensaje);

    const borrarCampos = () => {
        document.getElementById("mensajeSinProcesar").value = "";
        document.getElementById("claveCifrado").value = "";
        document.getElementById("mensajeProcesado").textContent = "....Aquí se podrá leer el mensaje ya procesado....";
    };

    const guardarMensaje = async (event) => {
        event.preventDefault();

        const formData = new FormData(mensajeForm);
        const data = {
            mensajeInicial: formData.get("mensajeInicial"),
            claveCifrado: formData.get("claveCifrado"),
            mensajeProcesado: formData.get("mensajeProcesado")
        };

        try {
            const response = await fetch('/home', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Actualiza la tabla dinámicamente
                const clave = data.claveCifrado;
                const mensaje = data.mensajeProcesado;
                const tipoCifrado = document.querySelector('input[name="tipoCifrado"]:checked').value;
                const tabla = document.getElementById("mensajesPrevios").getElementsByTagName('tbody')[0];
                const fecha = new Date();
                const fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;

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
                let celda5 = fila.insertCell(4);

                celda1.innerHTML = clave;
                celda2.innerHTML = tipoCifrado;
                celda3.innerHTML = mensaje;
                celda4.innerHTML = fechaFormateada;
                celda5.innerHTML = botonesBDBorrar + botonesCopiar;

                borrarCampos();
            } else {
                console.error('Error al guardar el mensaje');
            }
        } catch (error) {
            console.error('Error al guardar el mensaje:', error);
        }
    };
    const borrarMensaje = async (clave, mensaje, fila) => {
        try {
            const response = await fetch('/home', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mensajeProcesado: mensaje, claveCifrado: clave })
            });

            if (response.ok) {
                fila.remove();
            } else {
                console.error('Error al borrar el mensaje');
            }
        } catch (error) {
            console.error('Error al borrar el mensaje:', error);
        }
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

    document.getElementById('guardar').addEventListener('click', guardarMensaje);

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

});
