// Criar um novo painel nas DevTools
chrome.devtools.panels.create(
  "SelectorXpert",
  null,
  "panel.html",
  function (panel) {
    console.log("Painel criado");
  }
);
