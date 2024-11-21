// Referência ao painel de logs
const logsPanel = document.getElementById("logs");

// Função para adicionar log ao painel
function addLog(message, type = "info", selector = null) {
  const template = document.getElementById("log-template");
  const logItem = template.content.cloneNode(true).querySelector(".log-item");

  logItem.classList.add(type);
  logItem.querySelector(".log-message").textContent = message;

  if (selector) {
    const removeButton = logItem.querySelector(".remove-selector");
    const showTextButton = logItem.querySelector(".show-text");
    const showCountButton = logItem.querySelector(".show-count");

    removeButton.addEventListener("click", () => removeSelectorStyle(selector));
    showTextButton.addEventListener("click", () => showSelectorText(selector));
    showCountButton.addEventListener("click", () =>
      showSelectorCount(selector)
    );
  } else {
    logItem.querySelector(".log-buttons").style.display = "none";
  }

  logsPanel.insertBefore(logItem, logsPanel.firstChild);
}

function removeSelectorStyle(selector) {
  executeInPage((sel) => {
    const elements = document.querySelectorAll(sel);
    elements.forEach((el) => {
      if (el.hasAttribute("data-original-style")) {
        el.style.cssText = el.getAttribute("data-original-style");
        el.removeAttribute("data-original-style");
      }
    });
    return elements.length;
  }, selector).then((count) => {
    // addLog(
    //   `Estilos removidos de ${count} elementos para o selector: ${selector}`,
    //   "success"
    // );
  });
}

function showSelectorText(selector) {
  executeInPage((sel) => {
    const elements = document.querySelectorAll(sel);
    return Array.from(elements).map((el) => el.innerText.trim());
  }, selector).then((texts) => {
    // addLog(`Textos para o selector ${selector}:`, "info");
    texts.forEach((text, index) => {
      // addLog(`  ${index + 1}: ${text}`, "info");
    });
  });
}

function showSelectorCount(selector) {
  executeInPage((sel) => {
    return document.querySelectorAll(sel).length;
  }, selector).then((count) => {
    // addLog(
    //   `Quantidade de elementos para o selector ${selector}: ${count}`,
    //   "info"
    // );
  });
}

// Função para executar código no contexto da página
function executeInPage(func, ...args) {
  return new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(
      `(${func.toString()})(...${JSON.stringify(args)})`,
      (result, isException) => {
        if (isException) {
          // addLog(`Error: ${isException.value}`, "error");
          reject(new Error(isException.value));
        } else {
          resolve(result);
        }
      }
    );
  });
}

// Funções de estilo que serão executadas no contexto da página
const applyCustomPreview = (selector) => {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) {
    console.log("Nenhum elemento encontrado");
    return;
  }

  elements.forEach((el, index) => {
    if (!el.hasAttribute("data-original-style")) {
      el.setAttribute("data-original-style", el.style.cssText);
    }

    el.style.backgroundColor = "lightyellow";
    el.style.border = "2px solid yellow";
    el.style.margin = "2px";

    console.log(`Elemento ${index + 1} texto:`, el.innerText.trim());
    console.log(`Elemento ${index + 1} HTML:`, el.outerHTML);
  });

  console.log(`Total de elementos encontrados: ${elements.length}`);
  return elements.length;
};

const applyStyle = (selector, property, value) => {
  const elements = document.querySelectorAll(selector);
  if (elements.length === 0) {
    console.log("Nenhum elemento encontrado");
    return 0;
  }

  elements.forEach((el) => {
    if (!el.hasAttribute("data-original-style")) {
      el.setAttribute("data-original-style", el.style.cssText);
    }
    el.style[property] = value;
  });

  console.log(`Estilo aplicado a ${elements.length} elementos`);
  return elements.length;
};

const removeStyles = () => {
  const elements = document.querySelectorAll("[data-original-style]");

  elements.forEach((el) => {
    el.style.cssText = el.getAttribute("data-original-style");
    el.removeAttribute("data-original-style");
  });

  return elements.length;
};

// Event Listeners
document.getElementById("preview").addEventListener("click", () => {
  const selector = document.getElementById("selector").value;

  if (!selector) {
    // addLog("Por favor insira um seletor CSS", "error");
    return;
  }

  executeInPage(applyCustomPreview, selector).then((numElements) => {
    if (numElements > 0) {
      addLog(
        `Preview aplicado a ${numElements} elementos. Verifique o console para detalhes.`,
        "success",
        selector
      );
    } else {
      // addLog("Nenhum elemento encontrado com este seletor", "error");
    }
  });
});

// document.getElementById("apply").addEventListener("click", () => {
//   const selector = document.getElementById("selector").value;
//   const property = document.getElementById("property").value;
//   const value = document.getElementById("value").value;

//   if (!selector || !property || !value) {
//     addLog("Por favor preencha todos os campos", "error");
//     return;
//   }

//   executeInPage(applyStyle, selector, property, value).then((numElements) => {
//     if (numElements > 0) {
//       addLog(
//         `Estilo ${property}: ${value} aplicado a ${numElements} elementos`,
//         "success"
//       );
//     } else {
//       addLog("Nenhum elemento encontrado com este seletor", "error");
//     }
//   });
// });

document.getElementById("remove").addEventListener("click", () => {
  executeInPage(removeStyles).then((numElements) => {
    if (numElements > 0) {
      // addLog(`Estilos removidos de ${numElements} elementos`, "success");
    } else {
      // addLog("Nenhum elemento com estilos para remover", "info");
    }
  });
});

// Log inicial
// addLog("SelectorXpert iniciado", "info");
