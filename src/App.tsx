import React, { useEffect, useState, useRef } from "react";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

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
  const [comicName, setComicName] = useState<string>("");
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
            $('html, body').animate({ scrollTop: window.innerHeight * 0.3 }, 400);
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
            $('html, body').animate({ scrollTop: window.innerHeight * 0.3 }, 400);
            const newPanel = currentPanel + 1;
            setCurrentPanel(newPanel);
            drawPanel(newPanel);
          }
          break;
        case 'Home':
          e.preventDefault();
          $('html, body').animate({ scrollTop: window.innerHeight * 0.3 }, 400);
          setCurrentPanel(0);
          drawPanel(0);
          break;
        case 'End':
          e.preventDefault();
          $('html, body').animate({ scrollTop: window.innerHeight * 0.3 }, 400);
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

    // Extraer nombre del archivo sin extensión
    const fileName = file.name.replace(/\.(cbr|cbz|zip|rar)$/i, '');
    setComicName(fileName);

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
  };

  const prevPanel = () => {
    if (currentPanel > 0) {
      // Scroll cerca del tope (10% desde arriba)
      $('html, body').animate({ scrollTop: window.innerHeight * 0.3 }, 400);
      const newPanel = currentPanel - 1;
      setCurrentPanel(newPanel);
      drawPanel(newPanel);
    }
  };

  const nextPanel = () => {
    if (currentPanel + 1 < images.length) {
      // Scroll cerca del tope (10% desde arriba)
      $('html, body').animate({ scrollTop: window.innerHeight * 0.3 }, 400);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const closeComic = () => {
    setImages([]);
    setCurrentPanel(0);
    setShowButtons(false);
    setComicName("");
    setIsLoading(false);
    setLoadingProgress(0);
    $("#comicImg").attr("src", "");
  };

  // Pantalla de bienvenida cuando no hay cómics cargados
  if (!showButtons && !isLoading) {
    return (
      <div className="welcome-screen">
        <div className="welcome-container">
          <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' }}>
            📖
          </div>
          <h1 className="text-shadow-lg" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 1rem 0', color: 'white' }}>
            CBRVerse
          </h1>
          <p className="text-shadow-sm" style={{ fontSize: '1rem', marginBottom: '1.5rem', opacity: 0.9 }}>
            Arrastra tu cómic o selecciona un archivo para empezar
          </p>
          
          <div className="upload-section">
            <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.8 }}>
              ⬆️
            </div>
            <h2 className="text-shadow-sm" style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
              Selecciona tu cómic
            </h2>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
              Soportamos archivos CBR, CBZ y PDF
            </p>
            
            <button className="btn-upload" onClick={triggerFileInput}>
              Examinar archivos
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFilesChange}
              accept=".cbr,.cbz,.zip,.rar,.pdf"
              style={{ display: 'none' }}
            />
            
            <div style={{ 
              padding: '0.8rem',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              💡 <span style={{ opacity: 0.8 }}>También puedes arrastrar archivos CBR/CBZ directamente aquí</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Navbar usando Bootstrap */}
      <nav className="navbar fixed-top navbar-custom">
        <div className="container-fluid">
          <div className="navbar-content">
            {/* Botón cerrar (X) */}
            <button 
              className="navbar-close-btn"
              onClick={closeComic}
              title="Cerrar cómic y seleccionar otro"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            {/* Nombre del cómic */}
            <div className="navbar-title">
              <span className="title-text">
                {comicName || "CBRVerse"}
              </span>
              {comicName && (
                <span className="page-info">
                  Página {currentPanel + 1} de {images.length}
                </span>
              )}
            </div>

            {/* Botón de configuración */}
            <button 
              className="navbar-config-btn"
              title="Configuración (próximamente)"
              disabled
            >
              <i className="bi bi-gear"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="pt-20 pb-footer">
        <div className="glass-container container mx-auto" style={{ maxWidth: '1200px' }}>
          

          {showButtons && (
            <div className="alert alert-info d-flex align-items-center justify-content-center text-center" style={{
              background: 'rgba(60, 60, 60, 0.6)',
              borderColor: 'rgba(100, 100, 100, 0.3)',
              color: '#c0c0c0',
              borderRadius: '10px',
              padding: '15px',
              margin: '10px 0',
              fontSize: '14px',
              border: '1px solid rgba(100, 100, 100, 0.3)'
            }}>
              <i className="bi bi-keyboard me-2"></i>
              <strong>Atajos:</strong> ← → (flechas) | A D (teclas) 
            </div>
          )}

          <output id="list"></output>
          <div id="alertArea"></div>

          {isLoading && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="mb-4">
                  <h3 className="text-shadow-lg" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0' }}>
                    <i className="bi bi-gear-fill me-2" style={{ animation: 'spin 1s linear infinite' }}></i>
                    Procesando Archivo
                  </h3>
                </div>
                <p className="text-shadow-sm" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                  Extrayendo y procesando imágenes...
                </p>
                <div className="progress-custom">
                  <div 
                    className="progress-bar-custom" 
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <small className="opacity-90">
                  <i className="bi bi-clock me-1"></i>
                  {loadingProgress}% completado
                </small>
              </div>
            </div>
          )}

          <div className="text-center mb-4">
            <img 
              id="comicImg" 
              alt="comic panel" 
              className="comic-image img-fluid"
            />
          </div>
        </div>
      </div>

      {/* Footer fijo con controles de navegación */}
      {showButtons && (
        <footer className="footer-fixed">
          <div className="footer-content">
            <div className="footer-controls">
              <button 
                className="btn footer-btn"
                onClick={prevPanel}
                disabled={currentPanel === 0}
              >
                <i className="bi bi-arrow-left me-1"></i> Anterior
              </button>
              
              <div className="footer-page-counter">
                <i className="bi bi-file-earmark-text me-1"></i>
                Página {currentPanel + 1} de {images.length}
              </div>
              
              <button 
                className="btn footer-btn"
                onClick={nextPanel}
                disabled={currentPanel >= images.length - 1}
              >
                Siguiente <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
