import re

file_path = "src/components/GlossaryModal.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    # 1. Handshake
    '"El WPA2 4-Way Handshake verifica que el cliente y el router inalámbrico conocen la contraseña precompartida (PSK) sin enviar la clave directamente por el aire."': 
    '"Cuando conectas tu celular al Wi-Fi de tu casa, el router y tu celular se envían 4 mensajes matemáticos ocultos. Si ambos demuestran conocer la clave de tu casa, se conectan. Todo esto pasa en milisegundos sin que la contraseña viaje textualmente por el aire."',

    # 2. Payload
    '"Una consola interactiva remota (\'reverse shell\') inyectada en un sistema vulnerable mediante una explotación de desbordamiento de búfer."':
    '"Imagina un misil: el \'exploit\' es el cohete que atraviesa la defensa, pero el \'payload\' es la carga explosiva. En ciberseguridad, un payload práctico es enviar un archivo PDF que, al abrirse, instala silenciosamente un programa para que el atacante controle tu cámara."',

    # 3. IDS
    '"Una alerta de firma de red indicando que un escáner de puertos (como Nmap) está sondeando la red interna."':
    '"Como una alarma de casa con sensor de movimiento: si alguien (un atacante) intenta escanear qué computadoras están encendidas en tu red de la oficina, el IDS detecta el escaneo inusual y envía un correo al administrador de seguridad advirtiendo de la presencia del intruso."',

    # 4. IPS
    '"Bloquear automáticamente la dirección IP de origen de un atacante que intenta realizar fuerza bruta sobre un puerto SSH."':
    '"Como un guardia de seguridad armado: si el IPS detecta que una IP de Rusia está intentando adivinar la clave del servidor de la empresa 50 veces por segundo, el IPS no solo avisa, sino que automáticamente corta la conexión y bloquea esa IP para que no pueda seguir intentándolo."',

    # 5. SQL Injection (SQLi)
    '"Ingresar `\' OR \'1\'=\'1` en la casilla de contraseña para anular la validación lógica y acceder como administrador sin clave."':
    '"Si en la pantalla de login de un banco, en vez de poner tu usuario escribes `admin\' --`, el sistema podría confundir el texto con una orden de la base de datos, ignorar la contraseña y dejarte entrar directamente a la cuenta del administrador."',

    # 6. Phishing
    '"Un correo con diseño idéntico al de un banco notificando un bloqueo de cuenta falso para dirigir al usuario a una página de inicio de sesión clonada."':
    '"Te llega un correo que parece 100% oficial de Netflix diciendo que tu pago falló y tu cuenta será suspendida. Te dan un botón rojo que te lleva a `netfIix-pagos.com`. Al ingresar tu tarjeta de crédito ahí, se la estás enviando directamente a los estafadores."',

    # 7. DNS Sinkhole
    '"Redirigir las peticiones DNS de dominios de telemetría invasivos o anuncios hacia una IP que no responde, ahorrando ancho de banda y protegiendo el equipo."':
    '"Instalas Pi-Hole en tu casa. Cuando abres una app en tu celular y esta intenta conectarse al dominio `ads.google.com` para mostrarte un anuncio, tu Pi-Hole intercepta la solicitud y la tira a un \'agujero negro\'. La app cree que no hay internet para el anuncio y te muestra la pantalla limpia sin publicidad."',

    # 8. Firma Digital
    '"Firmar una actualización de software crítico con la clave privada de la empresa para que los clientes verifiquen su autenticidad con la clave pública."':
    '"Cuando descargas WhatsApp, tu celular verifica su \'Firma Digital\'. Es un sello criptográfico que garantiza matemáticamente dos cosas: que la app fue creada por Meta (autenticidad) y que ningún hacker modificó el código en el camino para meterle un virus (integridad)."',

    # 9. Función Hash
    '"El hash SHA-256 de una contraseña o un archivo ISO de Linux utilizado para verificar que la descarga es 100% idéntica y libre de alteraciones."':
    '"Descargas un juego de 50GB. Para saber si se descargó bien, la página te da un \'hash\' (ej: a1b2c3d4). Tu computadora calcula el hash del archivo descargado. Si ambos hashes son exactamente iguales, el archivo está perfecto; si difieren en un solo número, significa que se corrompió o alguien le inyectó un virus."',

    # 10. MitM
    '"Un atacante conectado a un Wi-Fi público que ejecuta \'ARP Spoofing\' para que todo el tráfico de la víctima pase a través de su laptop antes de ir a Internet."':
    '"Estás en un Starbucks usando su Wi-Fi. Un hacker en la mesa de al lado engaña a tu celular para que crea que su laptop es el Router. Ahora, cuando entras a Facebook, los mensajes van primero a su laptop, él los lee, y luego los manda al router real. Él está \'en el medio\' espiando todo sin que lo notes."',

    # 11. Criptografía Simétrica
    '"El algoritmo AES (Advanced Encryption Standard) usado para cifrar discos duros o archivos confidenciales en un ordenador."':
    '"Guardas tus fotos familiares en un disco duro externo y lo bloqueas usando el algoritmo AES con la contraseña \'Gatito123\'. Para poder ver las fotos en otra computadora, obligatoriamente tendrás que usar exactamente la misma contraseña \'Gatito123\' para desbloquearlo."',

    # 12. Criptografía Asimétrica
    '"El protocolo RSA, las curvas elípticas (ECC) o las conexiones seguras SSH y HTTPS que usamos cotidianamente en la web."':
    '"Tienes un candado abierto (Clave Pública) y te quedas con la única llave (Clave Privada). Le das copias de tu candado abierto a todo el mundo. Cualquiera puede meter un mensaje secreto en una caja y cerrarla con tu candado. Una vez cerrada, ni siquiera ellos pueden abrirla; solo tú, que tienes la llave privada, puedes leer el mensaje."',

    # 13. Fuerza Bruta
    '"Un programa intentando ingresar a un servidor SSH probando combinaciones desde \'aaaa\' hasta \'zzzz\' de forma veloz."':
    '"Te encuentras un candado de 4 dígitos (0000 a 9999). Un ataque de fuerza bruta es sentarse a probar literalmente 0000, luego 0001, luego 0002, y así sucesivamente sin detenerse, hasta que eventualmente (horas o días después) logras dar con el 7482 que abre el candado."',

    # 14. Diccionario
    '"Utilizar listas de contraseñas de millones de términos famosos (como \'rockyou.txt\') para auditar y crackear un handshake capturado."':
    '"En lugar de probar todas las combinaciones letra por letra (Fuerza Bruta), el atacante usa una lista con las 10 millones de contraseñas más usadas en el mundo (ej: 123456, password, qwerty, batman). El programa prueba estas palabras súper rápido; como la gente es predecible, suele funcionar en segundos."',

    # 15. CVE
    '"CVE-2017-0144 describe la vulnerabilidad SMB \'EternalBlue\' que fue utilizada masivamente por el ransomware WannaCry."':
    '"Es como el número de placa de un criminal. Si se descubre un nuevo fallo de seguridad en Windows que permite robar datos, se le asigna una placa oficial (ej: CVE-2023-1234). Así, todos los profesionales de seguridad del mundo pueden buscar ese código exacto para saber cómo defenderse de ese error en particular."',

    # 16. Malware
    '"Un troyano bancario que se disfraza de una calculadora legítima pero graba los números de tarjeta ingresados."':
    '"Un empleado descarga un programa gratuito para \'acelerar la PC\'. Aunque la PC parece ir más rápido, el programa en secreto está leyendo todos los correos de la empresa y enviándolos a un servidor en Rusia. Cualquier software con intenciones ocultas de dañar o espiar es un Malware."',

    # 17. Ransomware
    '"La variante masiva WannaCry que paralizó hospitales, telecomunicaciones y sistemas financieros a nivel mundial."':
    '"Llegas al trabajo y el fondo de pantalla de tu computadora es rojo con una calavera. Intentas abrir tus documentos Excel y no abren porque están encriptados. Aparece un mensaje que dice: \'Si quieres volver a ver tus archivos, deposita $500 en esta cuenta de Bitcoin en 24 horas o serán borrados para siempre\'."',

    # 18. XSS
    '"Inyectar un script en un foro web de tal forma que robe las cookies de sesión de cualquiera que simplemente lea el comentario del atacante."':
    '"Un hacker comenta en un foro público y, en vez de texto, escribe un código oculto. Cuando tú entras a leer los comentarios, tu navegador lee ese código y silenciosamente envía los datos de tu sesión de usuario al hacker. ¡Ahora él está logueado como si fuera tú, y tú solo entraste a leer!"',

    # 19. Matriz de Riesgo
    '"Clasificar la amenaza de \'Fuga de contraseñas de administradores\' como un riesgo Crítico (Alta probabilidad + Alto impacto) que requiere intervención inmediata."':
    '"Imagina una tabla de semáforo. Que caiga un meteorito en el servidor es Rojo en daño, pero Verde en probabilidad (riesgo bajo). Pero que un empleado use \'123456\' de clave es Rojo en daño y Rojo en probabilidad. La matriz te dice que debes gastar tu presupuesto en arreglar la clave, no en comprar escudos anti-meteoritos."',

    # 20. Reverse Shell
    '"Generar un archivo .exe malicioso con MSFvenom que al abrirse en Windows se conecte automáticamente al puerto de escucha (Netcat) del atacante."':
    '"El firewall de la empresa bloquea a cualquiera que intente conectarse desde fuera hacia adentro. Para burlar esto, el hacker engaña al empleado para que abra un PDF falso. Ese PDF hace que la computadora del empleado llame al hacker (desde adentro hacia afuera, lo cual sí está permitido), dándole al hacker control total del equipo."',

    # 21. Bind Shell
    '"Un atacante intentando conectarse directamente a un puerto 4444 que el malware abrió en la computadora de la víctima."':
    '"Un hacker logra instalar un virus en tu servidor. El virus abre una puerta trasera (por ejemplo, el puerto 4444) y se queda esperando. Luego, el hacker desde su casa se conecta directamente a la IP de tu servidor y entra por esa puerta. Hoy en día es poco efectivo porque los firewalls suelen bloquear estas entradas directas."',

    # 22. Hoaxshell
    '"Enmascarar código malicioso de PowerShell dentro de un archivo .cmd oculto para eludir el análisis heurístico de Windows Defender."':
    '"Un atacante quiere hackear una empresa pero el antivirus (como Windows Defender) bloquea todos los virus conocidos. El atacante usa Hoaxshell para generar un código que parece texto inofensivo pero que engaña a las funciones legítimas de Windows (PowerShell) para que ejecuten órdenes maliciosas sin hacer saltar las alarmas."',

    # 23. Regex
    '"Usar la expresión (\\.|^)youtube\\.com$ en un DNS Sinkhole para bloquear de un solo golpe tanto \'youtube.com\' como cualquier subdominio infinito (ej. \'m.youtube.com\', \'tv.youtube.com\')."':
    '"Tienes que buscar todos los números de teléfono en un libro de 500 páginas. En vez de leer cada línea, usas el patrón Regex \'3 números - 3 números - 4 números\' (ej: `\\d{3}-\\d{3}-\\d{4}`). La computadora extraerá instantáneamente todos los textos que coincidan con ese formato sin importar cuáles sean los números exactos."',

    # 24. Whaling, Vishing y Smishing
    '"Un atacante enviando un SMS urgente sobre un paquete retenido (Smishing) con un enlace a una página clonada para robar la tarjeta de crédito de la víctima."':
    '"Si recibes un mensaje de WhatsApp que dice \'Gana dinero viendo videos\' con un link fraudulento, es Smishing. Si te llama alguien haciéndose pasar por tu banco pidiendo tu PIN, es Vishing. Y si le mandan un correo falso súper detallado directamente al Gerente General de la empresa para robar su acceso maestro, es Whaling."'
}

for old_str, new_str in replacements.items():
    if old_str in content:
        content = content.replace(old_str, new_str)
        print(f"REPLACED: {old_str[:25]}...")
    else:
        print(f"NOT FOUND: {old_str[:25]}...")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
