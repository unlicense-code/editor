/**
 * A Userland Worker Implementation that always works as frames get its own global and context 
 * while they are relativ light weight we use postMessage like we would do with any worker
 * but they get additional Sugar Capabilitys like a own DOM where they can render and a own
 * document implementation instance they can write two that makes them flexible and Much
 * more powerfull then JS Workers controlled by the same frame. 
 */ 

export const createEmptyFrameOnSameUrl = (iframeElement, innerHTML) {
    iframeElement.src = "about:blank"; // Reset the document not the ECMAScript Context
    iframeElement.contentWindow.document.open();
    iframeElement.contentWindow.document.write(innerHTML);
    iframeElement.contentWindow.document.close();
}
// Complet rerender includes ECMAScript
export const nonePersistent = (frameEl, innerHTML="<html><head></head><body><div>Test_Div</div></body></html>") => {
  Object.assign(frameEl, { 
    src: URL.createObjectURL(new Blob([innerHTML], {type: "text/html; charset=utf-8"})),
  });
}
