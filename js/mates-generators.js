/* =============================================
   MATES-GENERATORS.JS — Generadores de ejercicios
   ============================================= */

/* =============================================
   MATES.JS — Matemáticas con ejercicios dinámicos
   Sistema de 2 intentos en TODOS los ejercicios:
   1er fallo → reintento, 2º fallo → revela respuesta
   ============================================= */

/* Variables migradas a ExerciseState.mates y SubjectData.problemas */
var M = ExerciseState.mates; /* alias corto */

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function getNivel() {
  var dl = diffLabel(ST.matesStreak);
  return dl.txt === 'Fácil' ? 'facil' : dl.txt === 'Medio' ? 'medio' : 'avanzado';
}

/* ---- Generadores ---- */
function tieneCarry(a, b) {
  // Detecta si una suma tiene llevada en alguna columna
  var aS = a.toString(), bS = b.toString();
  var maxLen = Math.max(aS.length, bS.length);
  while (aS.length < maxLen) aS = '0' + aS;
  while (bS.length < maxLen) bS = '0' + bS;
  var carry = 0;
  for (var i = maxLen - 1; i >= 0; i--) {
    var s = parseInt(aS[i]) + parseInt(bS[i]) + carry;
    carry = s >= 10 ? 1 : 0;
  }
  // Tiene llevada si en alguna columna la suma supera 9
  carry = 0;
  for (var i = maxLen - 1; i >= 0; i--) {
    var s = parseInt(aS[i]) + parseInt(bS[i]) + carry;
    if (s >= 10) return true;
    carry = 0;
  }
  return false;
}

function tienePrestamo(a, b) {
  // Detecta si una resta tiene préstamo en alguna columna
  var aS = a.toString(), bS = b.toString();
  var maxLen = Math.max(aS.length, bS.length);
  while (aS.length < maxLen) aS = '0' + aS;
  while (bS.length < maxLen) bS = '0' + bS;
  for (var i = maxLen - 1; i >= 0; i--) {
    if (parseInt(aS[i]) < parseInt(bS[i])) return true;
  }
  return false;
}

function generarSuma(nivel) {
  // Fácil: 3 dígitos, Medio: 3-4 dígitos, Difícil: 4 dígitos
  var conLlevada = Math.random() < 0.75; // 75% con llevada
  var a, b;
  var intentos = 0;
  do {
    if (nivel === 'facil') {
      a = Math.floor(Math.random() * 900) + 100;  // 100-999
      b = Math.floor(Math.random() * 900) + 100;
    } else if (nivel === 'medio') {
      // Mezcla 3 y 4 dígitos
      if (Math.random() < 0.5) {
        a = Math.floor(Math.random() * 900) + 100;
        b = Math.floor(Math.random() * 900) + 100;
      } else {
        a = Math.floor(Math.random() * 9000) + 1000;
        b = Math.floor(Math.random() * 4000) + 1000;
      }
    } else {
      a = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
      b = Math.floor(Math.random() * 4000) + 1000;
    }
    intentos++;
    if (intentos > 100) break;
  } while (tieneCarry(a, b) !== conLlevada);
  return { a: a, b: b, resultado: a + b };
}

function generarResta(nivel) {
  // Fácil: 3 dígitos, Medio: 3-4 dígitos, Difícil: 4 dígitos
  var conPrestamo = Math.random() < 0.75; // 75% con préstamo
  var a, b, res;
  var intentos = 0;
  do {
    if (nivel === 'facil') {
      b   = Math.floor(Math.random() * 800) + 100; // 100-899
      res = Math.floor(Math.random() * (999 - b - 100)) + 100; // resultado mínimo 100
      a   = res + b;
    } else if (nivel === 'medio') {
      if (Math.random() < 0.5) {
        b   = Math.floor(Math.random() * 800) + 100;
        res = Math.floor(Math.random() * (999 - b)) + 1;
        a   = res + b;
      } else {
        b   = Math.floor(Math.random() * 3000) + 1000;
        res = Math.floor(Math.random() * 3000) + 500;
        a   = res + b;
      }
    } else {
      b   = Math.floor(Math.random() * 4000) + 1000;
      res = Math.floor(Math.random() * 4000) + 1000;
      a   = res + b;
    }
    intentos++;
    if (intentos > 100) break;
  } while (tienePrestamo(a, b) !== conPrestamo);
  return { a: a, b: b, resultado: res };
}

function generarMulti(nivel) {
  var maxA = nivel === 'facil' ? 9 : nivel === 'medio' ? 12 : 40;
  var maxB = nivel === 'facil' ? 9 : 12;
  var a = Math.floor(Math.random() * maxA) + 2;
  var b = Math.floor(Math.random() * maxB) + 2;
  var resultado = a * b;
  var opts = new Set([resultado]);
  while (opts.size < 6) {
    var w = resultado + (Math.floor(Math.random() * 20) - 10);
    if (w > 0 && w !== resultado) opts.add(w);
  }
  return { a: a, b: b, resultado: resultado, opciones: shuffle(Array.from(opts)) };
}

