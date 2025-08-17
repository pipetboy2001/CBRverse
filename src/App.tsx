import React, { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "./comic-viewer.css";

declare global {
  interface Window {
    loadArchiveFormats?: (formats: string[], callback: () => void) => void;
    archiveOpenFile?: (file: File, password: string | null, callback: (archive: any, err: any) => void) => void;
    JSZip?: any;
  }
}

const App: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [currentPanel, setCurrentPanel] = useState<number>(0);
  const [showButtons, setShowButtons] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const loadExternalScripts = async () => {
      try {
        if (!window.JSZip) {
          await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = '/lib/jszip.js';
            script.onload = () => resolve(undefined);
            document.head.appendChild(script);
          });
        }

        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = '/lib/uncompress.js';
          script.onload = () => resolve(undefined);
          document.head.appendChild(script);
        });

        if (window.loadArchiveFormats) {
          window.loadArchiveFormats(['rar', 'zip'], () => {
            console.log('Archive formats loaded');
            setupDragAndDrop();
          });
        }
      } catch (error) {
        console.error('Error loading external scripts:', error);
      }
    };

    loadExternalScripts();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (images.length === 0) return;
      
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          if (currentPanel > 0) {
            const newPanel = currentPanel - 1;
            setCurrentPanel(newPanel);
            drawPanel(newPanel);
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          if (currentPanel < images.length - 1) {
            const newPanel = currentPanel + 1;
            setCurrentPanel(newPanel);
            drawPanel(newPanel);
          }
          break;
        case 'Home':
          e.preventDefault();
          setCurrentPanel(0);
          drawPanel(0);
          break;
        case 'End':
          e.preventDefault();
          const lastPanel = images.length - 1;
          setCurrentPanel(lastPanel);
          drawPanel(lastPanel);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentPanel, images]);

  const setupDragAndDrop = () => {
    const $document = $(document);
    
    $document.on("dragover", (e) => {
      e.preventDefault();
      if (e.originalEvent) {
        e.originalEvent.dataTransfer!.dropEffect = "move";
      }
    });

    $document.on("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!e.originalEvent?.dataTransfer?.files) return;
      const files = e.originalEvent.dataTransfer.files;
      
      if (files.length === 0) return;
      if (files.length > 1) {
        doError("You may only drop one file.");
        return;
      }
      
      handleFile(files[0]);
    });
  };

  const doError = (message: string) => {
    const errorHtml = `
      <div class='alert alert-block alert-error'>
        <button class="close" data-dismiss="alert">&times;</button>
        <p>${message}</p>
      </div>
    `;
    $("#alertArea").html(errorHtml);
  };

  const handleFile = (file: File) => {
    console.log('try to parse ' + file.name);

    setImages([]);
    setCurrentPanel(0);
    setShowButtons(false);
    setIsLoading(true);
    setLoadingProgress(0);

    $("#comicImg").attr("src", "");

    if (window.archiveOpenFile) {
      window.archiveOpenFile(file, null, (archive: any, err: any) => {
        if (archive) {
          console.info('Uncompressing ' + archive.archive_type + ' ...');
          
          const imageArchive = archive.entries.filter((e: any) => e.is_file);
          const newImages: string[] = [];
          let processedCount = 0;

          imageArchive.forEach((entry: any) => {
            entry.readData((data: ArrayBuffer, _error: any) => {
              if (data) {
                const url = URL.createObjectURL(new Blob([data]));
                newImages.push(url);
                processedCount++;

                const progress = Math.floor((processedCount / imageArchive.length) * 100);
                setLoadingProgress(progress);

                if (processedCount === imageArchive.length) {
                  setImages(newImages);
                  setIsLoading(false);
                  setShowButtons(true);
                  drawPanel(0, newImages);
                }
              }
            });
          });
        } else {
          console.error(err);
          doError(err);
          setIsLoading(false);
        }
      });
    }
  };

  const drawPanel = (num: number, imageArray: string[] = images) => {
    setCurrentPanel(num);
    $("#comicImg").attr("src", imageArray[num]);
    $("#panelCount").html(`Panel ${num + 1} out of ${imageArray.length}`);
    $("#panelCount1").html(`Panel ${num + 1} out of ${imageArray.length}`);
  };

  const prevPanel = () => {
    if (currentPanel > 0) {
      $('html, body').animate({ scrollTop: 550 }, 500);
      const newPanel = currentPanel - 1;
      setCurrentPanel(newPanel);
      drawPanel(newPanel);
    }
  };

  const nextPanel = () => {
    if (currentPanel + 1 < images.length) {
      $('html, body').animate({ scrollTop: 550 }, 500);
      const newPanel = currentPanel + 1;
      setCurrentPanel(newPanel);
      drawPanel(newPanel);
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div>
      <div className="container">
        <h1>
          📁 SELECCIONA TU ARCHIVO O ARRÁSTRALO A LA PANTALLA
        </h1>

        <input
          ref={fileInputRef}
          type="file"
          id="files"
          name="files[]"
          multiple
          onChange={handleFilesChange}
          accept=".cbr,.cbz,.zip,.rar"
          style={{ width: "100%", maxWidth: "500px" }}
        />

        {!showButtons && (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            borderRadius: '10px', 
            padding: '15px', 
            margin: '20px 0',
            textAlign: 'center',
            fontSize: '14px',
            color: '#666'
          }}>
            💡 <strong>Tip:</strong> Puedes arrastrar y soltar archivos CBR/CBZ directamente aquí
          </div>
        )}

        {showButtons && (
          <div style={{ 
            background: 'rgba(102, 126, 234, 0.1)', 
            borderRadius: '10px', 
            padding: '15px', 
            margin: '10px 0',
            textAlign: 'center',
            fontSize: '13px',
            color: '#667eea'
          }}>
            ⌨️ <strong>Atajos:</strong> ← → (flechas) | A D (teclas) | Home/End (inicio/final)
          </div>
        )}

        <output id="list"></output>
        <div id="alertArea"></div>

        {isLoading && (
          <div className="modal show" id="statusModal">
            <div className="modal-body">
              <div className="modal-header">
                <h3>Procesando Archivo</h3>
              </div>
              <p className="loading-text">Extrayendo y procesando imágenes...</p>
              <div className="progress">
                <div className="bar" style={{ width: `${loadingProgress}%` }}></div>
              </div>
              <small>{loadingProgress}% completado</small>
            </div>
          </div>
        )}

        {showButtons && (
          <div id="buttonArea" style={{ textAlign: "center" }}>
            <button 
              className="foton" 
              onClick={prevPanel}
              disabled={currentPanel === 0}
            >
              ⬅️ Anterior
            </button>
            <button 
              className="foton" 
              onClick={nextPanel}
              disabled={currentPanel >= images.length - 1}
            >
              Siguiente ➡️
            </button>
            <div>
              <span id="panelCount">
                📄 Página {currentPanel + 1} de {images.length}
              </span>
            </div>
          </div>
        )}

        <p>
          <img id="comicImg" alt="comic panel" style={{ width: "100%" }} />
        </p>

        {showButtons && (
          <div id="buttonArea1" style={{ textAlign: "center" }}>
            <div>
              <span id="panelCount1">
                📄 Página {currentPanel + 1} de {images.length}
              </span>
            </div>
            <button 
              className="foton" 
              onClick={prevPanel}
              disabled={currentPanel === 0}
            >
              ⬅️ Anterior
            </button>
            <button 
              className="foton" 
              onClick={nextPanel}
              disabled={currentPanel >= images.length - 1}
            >
              Siguiente ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
