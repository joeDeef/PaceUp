export async function cargarGramaticaComponent(nivel) {
  const contenedor = document.getElementById("nivel-content");

  const res = await fetch("./components/gramatica.html");
  const html = await res.text();
  contenedor.innerHTML = html;


  const temas = {
    1: {
      titulo: `<h1 class="gramatica-title">Past Tense</h1>`,
      contenido: `
        <div class="gramatica-section">
          <h2>Concept</h2>
          <p>
            The past tense in English is used to describe actions, states, or events
            that occurred before the present moment. There are four main forms: simple past, past progressive, past perfect, and past perfect progressive.
          </p>
        </div>
        <div class="gramatica-section">
          <h2>Form</h2>
          <ul>
            <li><strong>Affirmative:</strong> S + Vpast + C</li>
            <li><strong>Negative:</strong> S + did not + Vbase + C</li>
            <li><strong>Interrogative:</strong> Did + S + Vbase + C?</li>
          </ul>
        </div>
        <div class="gramatica-section gramatica-examples">
          <h2>Examples</h2>
          <div class="gramatica-example-item">"I watched a movie last night."</div>
          <div class="gramatica-example-item">"She didn’t visit her grandmother yesterday."</div>
          <div class="gramatica-example-item">"Did you want to dance?"</div>
        </div>
      `,
      ejercicios: [
        {
          tipo: "completar",
          pregunta: "Last night we __________(walk) to the cinema.",
          respuesta: ["walked"]
        },
        {
          tipo: "completar",
          pregunta: "They _________ (be) happy to be home.",
          respuesta: ["were"]
        },
        {
          tipo: "completar",
          pregunta: "Sally ____ (be) disappointed she ___________ (miss) the party.",
          respuesta: ["was", "missed"]
        },
        {
          tipo: "completar",
          pregunta: "Dan _______ (not/work) last week.",
          respuesta: ["didn't", "work"]
        },
        {
          tipo: "completar",
          pregunta: "______ you _______ (wash) the dishes?",
          respuesta: ["did", "wash"]
        }
      ]
    },
    2: {
      titulo: `<h1 class="gramatica-title">Used to</h1>`,
      contenido: `
        <div class="gramatica-section">
          <h2>Concept</h2>
          <p>The modal verb “used to” expresses habits or states in the past that are no longer true.</p>
        </div>
        <div class="gramatica-section">
          <h2>Form</h2>
          <ul>
            <li><strong>Affirmative:</strong> S + used to + Vbase + C</li>
            <li><strong>Negative:</strong> S + did not use to + Vbase + C</li>
            <li><strong>Interrogative:</strong> Did + S + use to + Vbase + C?</li>
          </ul>
        </div>
      `,
      ejercicios: [
        {
          tipo: "seleccion",
          pregunta: "I _________ smoke when I was in my 20s.",
          opciones: [
            "Usually",
            "Use to",
            "Used to",
            "Am used to"
          ],
          respuesta:"Used to"
        },
        {
          tipo: "seleccion",
          pregunta: "Sally ____________ drink a lot of wine.",
          opciones: [
            "Didn't use to",
            "Wouldn't",
            "Didn't used to",
            "Don't use to"
          ],
          respuesta:"Didn't use to"
        },
        {
          tipo: "seleccion",
          pregunta: "It’s a noisy apartment, but I _______ it.",
          opciones: [
            "Used to",
            "Am used to",
            "Use to",
            "Am use to"
          ],
          respuesta:"Am used to"
        },
        {
          tipo: "seleccion",
          pregunta: "Bill is used to _______ long days.",
          opciones: [
            "Work",
            "Works",
            "Working",
            "Worked"
          ],
          respuesta:"Working"
        }
      ]
    },
    3: {
      titulo: `<h1 class="gramatica-title">Expressions of quantity</h1>`,
      contenido: `
        <div class="gramatica-section">
          <h2>Concept</h2>
          <p>Expressions of quantity tell us how many or how much of something there is.</p>
        </div>
        <div class="gramatica-section">
          <table class="gramatica-table">
            <thead>
              <tr>
                <th>With count nouns</th>
                <th>With noncount nouns</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>There are <strong>too many</strong> cars.</td>
                <td>There is <strong>too much</strong> pollution.</td>
              </tr>
              <tr>
                <td>There should be <strong>fewer</strong> cars.</td>
                <td>There should be <strong>less</strong> pollution.</td>
              </tr>
              <tr>
                <td>We need <strong>more</strong> streetlights.</td>
                <td>We need <strong>more</strong> public transportation.</td>
              </tr>
              <tr>
                <td>There aren't <strong>enough</strong> police officers.</td>
                <td>There isn't <strong>enough </strong>parking.</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
      ejercicios: [
        {
          tipo: "completar",
          pregunta: "We need _________ public schools.",
          respuesta: ["more"]
        },
        {
          tipo: "completar",
          pregunta: "There are ____________ public parks.",
          respuesta: ["many", "more", "too many", "a lot of"]
        },
        {
          tipo: "completar",
          pregunta: "There is ________ noise all the time.",
          respuesta: ["too much", "much", "more", "a lot of"]
        },
        {
          tipo: "completar",
          pregunta: "The government should build _______ affordable housing.",
          respuesta: ["more"]
        },
        {
          tipo: "completar",
          pregunta: "There are ______ free Wi-Fi hotspots.",
          respuesta: ["many", "more", "too many", "a lot of"]
        }
      ]
    },
    4: {
      titulo: `<h1 class="gramatica-title">Indirect questions from Wh-questions</h1>`,
      contenido: `
        <div class="gramatica-section">
          <h2>Concept</h2>
          <p>Indirect questions that start with "wh-" question words (who, what, when, where, why, which, how) are formed by embedding the question inside a statement. The order becomes subject + verb, instead of inversion.</p>
        </div>
        <div class="gramatica-section">
          <h2>Examples</h2>
          <ul class="ejemplo-lista">
            <li>Do you know where can I find a bank? <span class="incorrecto">✖</span></li>
            <li>Do you know where I can find a bank? <span class="correcto">✔</span></li>
            <li>Can you tell me what time do the shops close? <span class="incorrecto">✖</span></li>
            <li>Can you tell me what time the shops close? <span class="correcto">✔</span></li>
          </ul>
        </div>
        <div class="gramatica-section">
          <h2>Extra</h2>
          <p>For yes-no questions, we can use "if" or "whether":</p>
          <ul>
            <li>Do you know whether he’ll be here soon?</li>
          </ul>
        </div>
      `,
      ejercicios: [
        {
          tipo: "completar",
          pregunta: "Where does she play tennis?",
          respuesta: ["Can you tell me where she plays tennis?", "Do you know where she plays tennis?"]
        },
        {
          tipo: "completar",
          pregunta: "Does he live in Paris?",
          respuesta: ["Do you know if he lives in Paris?", "Can you tell me whether he lives in Paris?"]
        },
        {
          tipo: "completar",
          pregunta: "Is she hungry?",
          respuesta: ["Do you know if she is hungry?", "Can you tell me whether she is hungry?"]
        },
        {
          tipo: "completar",
          pregunta: "What is this?",
          respuesta: ["Can you tell me what this is?", "Do you know what this is?"]
        },
        {
          tipo: "completar",
          pregunta: "When do John and Luke meet?",
          respuesta: ["Do you know when John and Luke meet?", "Can you tell me when John and Luke meet?"]
        }
      ]
    }
  };

  let temaActual = 1;

  function mostrarTema(numeroTema) {
    const contGramatica = document.getElementById("contenido-gramatica");
    const tema = temas[numeroTema];

    if (contGramatica && tema) {
      // Agregar tabindex y aria-label al contenedor principal
      contGramatica.setAttribute("tabindex", "0");
      contGramatica.setAttribute("role", "region");
      contGramatica.setAttribute("aria-label", `Contenido de gramática: ${tema.titulo.replace(/<[^>]+>/g, '')}`);

      contGramatica.innerHTML = tema.titulo + tema.contenido;

      // Actualiza números de navegación
      const spanTema = document.getElementById("numero-tema");
      const spanTotal = document.getElementById("total-temas");

      if (spanTema) spanTema.textContent = numeroTema;
      if (spanTotal) spanTotal.textContent = Object.keys(temas).length;

      if (tema.ejercicios && tema.ejercicios.length > 0) {
        const ejerciciosHTML = generarHTMLDeEjercicios(tema.ejercicios, numeroTema);
        contGramatica.insertAdjacentHTML("beforeend", ejerciciosHTML);
        // Agregar accesibilidad a los ejercicios
        const ejerciciosContainer = contGramatica.querySelector('.ejercicios-container');
        if (ejerciciosContainer) {
          ejerciciosContainer.setAttribute('tabindex', '0');
          ejerciciosContainer.setAttribute('role', 'region');
          ejerciciosContainer.setAttribute('aria-label', 'Ejercicios interactivos de gramática');
        }
        contGramatica.querySelectorAll('.ejercicio').forEach((ejDiv, idx) => {
          ejDiv.setAttribute('tabindex', '0');
          ejDiv.setAttribute('role', 'group');
          ejDiv.setAttribute('aria-label', `Ejercicio ${idx + 1}`);
        });
        contGramatica.querySelectorAll('input, button, label').forEach(el => {
          el.setAttribute('tabindex', '0');
        });
      }
    }
  }

  function generarHTMLDeEjercicios(ejercicios, numeroTema) {
    let html = `<div class="ejercicios-container" data-tema="${numeroTema}">`;

    ejercicios.forEach((ej, idx) => {
      const ejercicioId = `ej-${numeroTema}-${idx}`;
      html += `<div class="ejercicio" data-index="${idx}" data-tema="${numeroTema}">`;

      if (ej.tipo === "completar") {
        html += `
          <label for="${ejercicioId}">
            <strong>${ej.pregunta}</strong>
          </label>
          <input 
            type="text" 
            class="ejercicio-input" 
            id="${ejercicioId}"
            aria-label="Respuesta del ejercicio ${idx+1} del tema ${numeroTema}" 
          />
        `;
      }

      if (ej.tipo === "seleccion") {
        html += `
          <fieldset>
            <legend>${ej.pregunta}</legend>
        `;
        ej.opciones.forEach(opt => {
          html += `
            <label>
              <input 
                type="radio" 
                name="ejercicio-${numeroTema}-${idx}" 
                value="${opt}" 
                aria-label="${opt}"
              />
              ${opt}
            </label><br/>
          `;
        });
        html += `</fieldset>`;
      }

      html += `</div>`;
    });

    html += `<button class="check-button" data-tema="${numeroTema}">Check</button>`;
    html += `</div>`;

    return html;
  }

  // Eventos para las flechas
  document.getElementById("prev-tema")?.addEventListener("click", () => {
    if (temaActual > 1) {
      temaActual--;
      mostrarTema(temaActual);
    }
  });

  document.getElementById("next-tema")?.addEventListener("click", () => {
    if (temaActual < Object.keys(temas).length) {
      temaActual++;
      mostrarTema(temaActual);
    }
  });

  // Evento Check
 document.addEventListener("click", (e) => {
  if (e.target.classList.contains("check-button")) {
    const temaNum = e.target.dataset.tema;
    const ejercicios = temas[temaNum].ejercicios;

    let totalCorrectos = 0;

    document.querySelectorAll(`.ejercicio[data-tema="${temaNum}"]`).forEach((ejDiv, idx) => {
      const ejercicio = ejercicios[idx];
      let correcto = false;

      if (ejercicio.tipo === "completar") {
        const input = ejDiv.querySelector("input");
        if (input) {
          const userInput = input.value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

          if (Array.isArray(ejercicio.respuesta)) {
            // Ejercicio con múltiples palabras correctas (varios huecos)
            const userWords = userInput.split(" ");
            if (userWords.length === ejercicio.respuesta.length) {
              correcto = ejercicio.respuesta.every((resp, i) => {
                return userWords[i] && userWords[i].trim().toLowerCase() === resp.trim().toLowerCase();
              });
            }
          } else {
            // respuesta simple
            correcto = userInput === ejercicio.respuesta.trim().toLowerCase();
          }
        }
      }

      if (ejercicio.tipo === "seleccion") {
        const selected = ejDiv.querySelector("input[type='radio']:checked");
        if (selected && selected.value === ejercicio.respuesta) {
          correcto = true;
        }
      }

      ejDiv.classList.remove("correcto", "incorrecto");

      if (correcto) {
        ejDiv.classList.add("correcto");
        totalCorrectos++;
      } else {
        ejDiv.classList.add("incorrecto");
      }
    });

    mostrarScore(temaNum, totalCorrectos, ejercicios.length)
    mostrarBotonesPostCheck(temaNum);
  }

  if (e.target.id?.startsWith("show-answers")) {
    const temaNum = e.target.id.split("-").pop();
    mostrarRespuestasCorrectas(temaNum);
  }

  if (e.target.id?.startsWith("try-again")) {
    const temaNum = e.target.id.split("-").pop();
    mostrarTema(temaNum);
  }
});

  function mostrarBotonesPostCheck(temaNum) {
    const container = document.querySelector(`.ejercicios-container[data-tema="${temaNum}"]`);
    if (!container) return;

    if (!document.getElementById(`show-answers-${temaNum}`)) {
      container.insertAdjacentHTML("beforeend", `
        <button id="show-answers-${temaNum}">Show Correct Answers</button>
        <button id="try-again-${temaNum}">Try Again</button>
      `);
    }
  }

  function mostrarRespuestasCorrectas(temaNum) {
    const ejercicios = temas[temaNum].ejercicios;
    document.querySelectorAll(`.ejercicio[data-tema="${temaNum}"]`).forEach((ejDiv, idx) => {
      const ejercicio = ejercicios[idx];

      if (ejercicio.tipo === "completar") {
        const input = ejDiv.querySelector("input");
        if (input) {
          input.value = ejercicio.respuesta;
          input.classList.add("correcto");
        }
      }

      if (ejercicio.tipo === "seleccion") {
        const radios = ejDiv.querySelectorAll("input[type='radio']");
        radios.forEach(radio => {
          if (radio.value === ejercicio.respuesta) {
            radio.checked = true;
            radio.parentElement.classList.add("correcto");
          }
        });
      }
    });
  }

  function mostrarScore(temaNum, correctos, total) {
    const container = document.querySelector(`.ejercicios-container[data-tema="${temaNum}"]`);
    if (!container) return;

    const oldScore = container.querySelector(".score-result");
    if (oldScore) oldScore.remove();

    const scoreHTML = `
      <div 
        class="score-result" 
        role="status" 
        aria-live="assertive" 
        tabindex="-1"
      >
        ✅ Your score: <strong>${correctos} / ${total}</strong>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", scoreHTML);

    // Mueve el foco al score para que lo anuncie el lector de pantalla
    container.querySelector(".score-result").focus();
  }

  // Mostrar el primer tema
  mostrarTema(temaActual);
}
