const { pdfToPng } = require('pdf-to-png-converter');
(async () => {
  const pages = [1,2,10,18,19,20,28,38];
  const out = await pdfToPng('C:/Users/gambo/Documents/Git-Conflictos/Guia-Conflictos-Git.pdf', {
    pagesToProcess: pages,
    viewportScale: 1.6,
    outputFolder: 'C:/Users/gambo/Documents/Git-Conflictos/build/pdf-preview'
  });
  console.log('pages rendered:', out.length);
})();