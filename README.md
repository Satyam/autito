# Control remoto de Arduino por Web

El proyecto se compone de 3 piezas

* [Arduino](https://github.com/Satyam/autito/blob/master/arduino/autito-remote.ino) Contiene el sketch de Arduino que controla los dispositivos, recibe comandos de sus propios sensores (básicamente el joystick) y también comandos remotos, y siempre reporta lo que va ocurriendo.
* [Server](https://github.com/Satyam/autito/blob/master/server/index.ts) EL software que se ejecuta en el servidor, que recibe los comandos de cualquier navegador y los envía al Arduino, y reporta el status del mismo
* [Cliente](https://github.com/Satyam/autito/tree/master/src) El software que se puede cargar en multiples navegadores para controlar/monitorear el Arduino

Vamos por partes:

## Arduino

El sketch para el Arduino permite controlar

* Velocidad y sentido de giro del motor
* Posición del servo
* Musiquita en el zumbador
* Led incorporado en el Arduino mismo

Esto lo hace de forma local o remota.  Localmente, lee la posición del joystick para controlar el motor y el servo, y el pulsador incorporado en el joystick para el zumbador.

Remotamente, lee el puerto serial (funciones `Serial.available()` y `Serial.read()`) a la espera de comandos que interpretar y ejecutar.
Estos [comandos](https://github.com/Satyam/autito/blob/master/arduino/autito-remote.ino#L36) se indican a continuación.  Algunos de ellos aceptan un segundo byte conteniendo el valor (velocidad, angulo de giro, etc) de la operación

* `f` forward a la velocidad  indicada en el siguiente byte, 0 a 255
* `b` backwards a la velocidad indicada en el siguiente byte, 0 a 255
* `S` Stop
* `l` left, en el rango indicado en el siguiente byte donde 255 son 90 grados.
* `r` right (idem anterior)
* `|` (barra vertical) ir derecho
* `!` exclamación, hacer sonar la musiquita
* `#` seguido de un byte 0 o distinto de cero, que ordena encender o apagar el led, respectivamente.

El control local tiene prioridad sobre el remoto.

La razón de que haya tres comandos para velocidad y giro está en usar un único byte, sin signo,  para el valor. Podría haberse resuelto ya sea reduciendo el rango de valores de 0 a 128, usando el bit restante para signo, o usando un segundo byte para completar un `int`, que son 16 bits e incluye signo.

La recepción de comandos es muy simple dado que el C no es muy bueno manejando `strings`.  Se puede, pero aumenta el tamaño del código innecesariamente.  Mejor limitarse a `char` y `byte` o `int` concatenando dos `bytes`.

Finalmente, el programa informa de lo que ocurre mediante `Serial.print` o `Serial.println`, donde este último, al agregar un `\n` al final, indica el fin del mensaje.  Las funciones de salida convierten automáticamente el argumento a `string`, y esto no implica coste extra dado que ya está incorporado en el objeto `Serial`, guste o no.  Transmitir los valores en ASCII evita confusion pues si un valor llegase a ser `13` el receptor lo confundiría con un `\n`, y lo mismo ocurriría con otros códigos.

El mensaje de respuesta del Arduino puede contener uno o más de las siguientes partes, todas ellas indicadas por un caracter no-numeríco y opcionalmente un valor numerico.

* `>` Indica que se ha recibido un commando remoto y va seguido del comando de la lista precedente. No indica el valor pues este viene detrás del comando a ejecutar.  Permite diferenciar comandos locales (que no emiten este código) de remotos.
* `s` (speed) indica la velocidad del motor seguido del valor en el rango -255 a 255 en ASCII o sea, transmite los caracteres ASCII del signo y los dígitos.
* `t` (turn) indica el ángulo de giro, seguido del valor en el rango -255 a 255, que se corresponden a -90 a 90 grados del servo.
* `!` (beep) seguido de un `1` o `0` según esté sonando o no la música
* `#` (led) seguido de un `1` o `0` según esté encendido el LED o no.
* `x` Indica la posición del Joystick en horizontal en el rango -255 a 255. 
* `y` Indica la posición del Joystick en vertical en el rango -255 a 255. 

## Servidor

Este programa de Javascript es para ser ejecutado en cualquier dispositivo con NodeJS instalado. Puede ser el mismo ordenador de desarrollo o en uno separado como un Raspberry Pi.  

El programa es un servidor de Web que permite cargar la aplicación de web adjunta y sirve luego para recibir los comandos y reenviarlos al Arduino y recibir el status del Arduino y responderle al navegador.

Puede hacer esto con múltiples navegadores conectados todos ellos al mismo tiempo.  También se puede apreciar esto abriendo múltiples pestañas en el navegador en un mismo ordenando.  No se ha hecho ningún esfuerzo en pasar el control de uno a otro, todos ellos pueden emitir los comandos al mismo tiempo, creando los obvios conflictos.  Esto es algo a resolver en lo inmediato.

El servidor funciona de dos maneras.  Puede recibir comandos de HTTP, por ejemplo, navegando a las siguientes direcciones:  

* `http://localhost:8000/on` encenderá el led.  
* `http://localhost:8000/forward/127` indicará ir adelante a media velocidad (el rango es hasta 255)

Los varios pedidos por HTTP que acepta se pueden ver a en los sucesivos `app.get` a partir de [aquí](https://github.com/Satyam/autito/blob/master/server/index.ts#L149).   Tras cada pedido por HTTP devolverá una página con el `log` de comandos recibidos tanto propios como ajenos o locales y el comando que uno acaba de pedir, más una lista de `links` con los [comandos disponibles](https://github.com/Satyam/autito/blob/master/server/index.ts#L120)

Los últimos [dos `app.get`](https://github.com/Satyam/autito/blob/master/server/index.ts#L247) son los que permiten enviar la aplicación gráfica de Web, responde con `index.html` si se pide `http://localhost:8000` y con el resto de los componentes de la aplicación (código `.js`, hojas de estilo `.css`, imágenes `.png`, etc.). 

La segunda forma de operar es mediante `webSockets`.  No me voy a poner muy técnico en ello pero el problema del HTTP es que hasta que no se hace un *refresh* o se navega a otra página o se emite un nuevo comando de los indicados arriba (los `app.get`) el navegador en cuestión no se entera de qué es lo que ocurre. Los `webSockets` permiten una comunicación bidireccional, donde el programa en el navegador puede enviar comandos y, al mismo tiempo, recibir actualizaciones no solicitadas, por ejemplo, comandos locales o remotos de otros navegadores.  Esto asegura que todos los navegadoes puedan ver simultáneamente el estado del Arduino en tiempo real, sin que ninguno de ellos tenga que forzar un refresco de la página ni que tengan que recargar la aplicación, como ocurriría en PHP.

## Cliente de Web

Es una aplicación en JavaScript usando React para la parte de manejo de pantalla.  React fué desarrollado por Facebook y es lo que usa en sus aplicaciones, tanto de Web como en móviles, aunque yo sólo lo hice para web. En realidad, quiero decir es que no hice una aplicación *nativa* para móvil, una *App*, aunque sí se puede ejecutar en un navegador en el móvil.

El programa se base en emitir, mediante `webSockets` los comandos, que el servidor reenvía al Arduino y recibir los mensajes del servidor indicando el estado del Arduino, que luego muestra en pantalla usando HTML y SVG para la parte gráfica.





