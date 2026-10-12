let Puntos = 0;
let AMBOS = new Array("Jin(1)", "Jin(2)", "Suga(1)", "Suga(2)", "J-Hope(1)", "J-Hope(2)", "RM(1)", "RM(2)", "Jimin(1)", "Jimin(2)", "V(1)", "V(2)", "Jungkook(1)", "Jungkook(2)", "HueningKai(1)", "HueningKai(2)", "Yeonjun(1)", "Yeonjun(2)", "Soobin(1)", "Soobin(2)", "Beomgyu(1)", "Beomgyu(2)", "Taehyun(1)", "Taehyun(2)");
let listaBTS = new Array("Jin(1)", "Jin(2)", "Suga(1)", "Suga(2)", "J-Hope(1)", "J-Hope(2)", "RM(1)", "RM(2)", "Jimin(1)", "Jimin(2)", "V(1)", "V(2)", "Jungkook(1)", "Jungkook(2)");
let listaTXT = new Array("HueningKai(1)", "HueningKai(2)", "Yeonjun(1)", "Yeonjun(2)", "Soobin(1)", "Soobin(2)", "Beomgyu(1)", "Beomgyu(2)", "Taehyun(1)", "Taehyun(2)");

// Inicio();
// function Inicio() {
//     console.log(listaPersonajes);

//     let imagen = generarImagen();
//     console.log(obtenerImagen());
//     console.log(imagen);

// }

function generateRandomInt(max) {
    return Math.floor(Math.random() * max);
}



let listaPersonajes = new Array();
let largo = 0;
document.querySelector("#btnSeleccionar").addEventListener("click", Seleccionar);
let grupo = "";
function Seleccionar() {
    grupo = document.querySelector("#slcGrupo").value;
    if (grupo == "") {
        alert("no pensaba poner una alerta por esto, pero dale idiota poné una opción");
    } else {



        if (grupo == "BTS") {
            listaPersonajes = listaBTS;
            largo = listaPersonajes.length;

            document.querySelector("#slcBTS").style.display = "block";



        } else if (grupo == "TXT") {
            listaPersonajes = listaTXT;
            largo = listaPersonajes.length;

            document.querySelector("#slcTXT").style.display = "block";

        } else {
            listaPersonajes = AMBOS;
            largo = listaPersonajes.length;

            document.querySelector("#slcAMBOS").style.display = "block";

        }


        document.querySelector("#divPresentacion").style.display = "none";
        document.querySelector("#divJuego").style.display = "block";
        generarImagen();
    }
}





document.querySelector("#btnSiguiente").addEventListener("click", Siguiente);

function Siguiente() {
    let personaje = "";
    if (grupo == "BTS") {
        listaPersonajes = listaBTS;
        document.querySelector("#slcBTS").style.display = "block";
        personaje = document.querySelector("#slcBTS").value;
        console.log(listaPersonajes.length);



    } else if (grupo == "TXT") {
        listaPersonajes = listaTXT;
        document.querySelector("#slcTXT").style.display = "block";
        personaje = document.querySelector("#slcTXT").value;
        console.log(listaPersonajes.length);

    } else if (grupo == "AMBOS") {
        listaPersonajes = AMBOS;
        document.querySelector("#slcAMBOS").style.display = "block";
        personaje = document.querySelector("#slcAMBOS").value;
        console.log(listaPersonajes.length);

    } else {
        alert("No iba a considerar que ibas a ser tan inutil como para no seleccionar ninguna opcion, pero ya veo...");

    }


    if (personaje == "") {
        alert("Dale estúpida, poné una opción, mogolica");
    } else {
        let img = obtenerNombreImagen();
        if (img == personaje) {

            Puntos++;


        }
        EliminarDelArray(obtenerImagen());
        generarImagen();
    }

}


function generarImagen() {
    if (listaPersonajes.length == 0) {
        MostrarPuntaje();
    }
    let img = listaPersonajes[generateRandomInt(listaPersonajes.length)];
    document.querySelector("#imagen").innerHTML = `<img id="img" src="img/${img}.jpg" width="300" alt="">`;
    console.log(img);
    return img;


}


function obtenerNombreImagen() {
    let img = document.getElementById("img");
    img = img.getAttribute("src");
    img = img.substring(4, img.length - 7)

    return img;
}

function obtenerImagen() {
    let img = document.getElementById("img");
    img = img.getAttribute("src");
    img = img.substring(4, img.length - 0)

    return img;

}

function EliminarDelArray(foto) {
    foto = foto.substring(0, foto.length - 4)

    for (let i = 0; i < listaPersonajes.length; i++) {
        if (listaPersonajes[i] == foto) {
            var o = listaPersonajes.indexOf(foto);
            listaPersonajes.splice(o, 1);
            console.log(listaPersonajes.length);
            return listaPersonajes.length;
        }
    }
}




function MostrarPuntaje() {
    document.querySelector("#divResultado").innerHTML = "";
    document.querySelector("#divPresentacion").style.display = "none";
    document.querySelector("#divJuego").style.display = "none";

    document.querySelector("#divResultado").innerHTML = `<h1>Su puntaje fue de ${Puntos}/${largo}</h1>
    <br><br>
    <h2>bien hecho</h2>
    <h3>Recarga la pagina para jugar de nuevo</h3>
    `;


    if(Puntos>=20){
        document.querySelector("#divResultado").innerHTML +=`<h5>bien ahí loco, la última ubicación es debajo de mis barriles en tu casa xddd no me rompas los barriles lchdtm con cuidado</h5>
        `;
    }
}