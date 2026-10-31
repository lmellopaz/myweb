(function($) {
	"use strict";

	var projectFrame = document.getElementById('project-frame'),
		projectTabs = document.querySelectorAll('.project-tab'),
		reloadButton = document.querySelector('.project-reload'),
		projectLinks = document.querySelectorAll('[data-project-link]'),
		cameraDialog = document.getElementById('photo-with-vashito');

	if (cameraDialog) {
		var cameraVideo = cameraDialog.querySelector('.camera-source'),
			cameraCanvas = cameraDialog.querySelector('.camera-preview'),
			cameraCanvasContext = cameraCanvas.getContext('2d'),
			cameraStatus = cameraDialog.querySelector('#camera-status'),
			cameraStage = cameraDialog.querySelector('.photo-with-vashito-stage'),
			backgroundImage = cameraDialog.querySelector('.photo-background'),
			backgroundName = cameraDialog.querySelector('.photo-background-name'),
			foregroundImage = cameraDialog.querySelector('.photo-foreground'),
			subjectSelect = cameraDialog.querySelector('.photo-subject'),
			countdownSelect = cameraDialog.querySelector('.photo-countdown-duration'),
			captureButton = cameraDialog.querySelector('.photo-capture-button'),
			countdownDisplay = cameraDialog.querySelector('.camera-countdown'),
			capturedPreview = cameraDialog.querySelector('.photo-captured-preview'),
			captureControls = cameraDialog.querySelector('.photo-capture-controls'),
			backgroundControls = cameraDialog.querySelector('.photo-with-vashito-controls'),
			resultControls = cameraDialog.querySelector('.photo-result-controls'),
			downloadButton = cameraDialog.querySelector('.photo-download-button'),
			capturedPhotoUrl = null,
			cameraStream = null,
			selfieSegmentation = null,
			cameraFrameRequest = null,
			countdownTimer = null,
			backgroundIndex = 0,
			backgrounds = [
				{src: 'images/fotovashito/fondos/altar.jpg', name: 'Altar'},
				{src: 'images/fotovashito/fondos/basura.webp', name: 'Basura'},
				{src: 'images/fotovashito/fondos/concentracion.jfif', name: 'Concentración'},
				{src: 'images/fotovashito/fondos/epstein.webp', name: 'Isla'},
				{src: 'images/fotovashito/fondos/luna.webp', name: 'Luna'},
				{src: 'images/fotovashito/fondos/sistema digestivo.jpg', name: 'Sistema digestivo'}
			],
			subjects = {
				vashito: {src: 'images/fotovashito/vashito.png', name: 'Vashito'},
				bts: {src: 'images/fotovashito/fondos/bts.png', name: 'BTS'},
				epstein: {src: 'images/fotovashito/fondos/epstein.png', name: 'Epstein'}
			};

		function selectBackground(index) {
			backgroundIndex = (index + backgrounds.length) % backgrounds.length;
			backgroundImage.src = backgrounds[backgroundIndex].src;
			backgroundName.textContent = backgrounds[backgroundIndex].name;
		}

		function selectSubject(subject) {
			var selectedSubject = subjects[subject];

			foregroundImage.src = selectedSubject.src;
			foregroundImage.alt = selectedSubject.name + ' en la foto';
		}

		function stopCamera() {
			if (countdownTimer !== null) {
				window.clearInterval(countdownTimer);
				countdownTimer = null;
			}

			countdownDisplay.textContent = '';
			countdownDisplay.classList.remove('is-visible');
			captureButton.disabled = true;
			captureButton.textContent = 'Tomar foto (' + countdownSelect.value + ' s)';

			if (cameraFrameRequest !== null) {
				window.cancelAnimationFrame(cameraFrameRequest);
				cameraFrameRequest = null;
			}

			if (cameraStream) {
				cameraStream.getTracks().forEach(function(track) {
					track.stop();
				});
				cameraStream = null;
			}

			cameraVideo.srcObject = null;
			cameraCanvasContext.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
			cameraStage.classList.remove('is-camera-ready');
			resetCapturedPhoto();
		}

		function resetCapturedPhoto() {
			if (capturedPhotoUrl) {
				URL.revokeObjectURL(capturedPhotoUrl);
				capturedPhotoUrl = null;
			}

			capturedPreview.removeAttribute('src');
			cameraStage.classList.remove('has-captured-photo');
			captureControls.classList.remove('is-hidden');
			backgroundControls.classList.remove('is-hidden');
			resultControls.hidden = true;
		}

		function renderCameraFrame(results) {
			if (!cameraStream || !cameraDialog.open) {
				return;
			}

			if (cameraCanvas.width !== cameraVideo.videoWidth || cameraCanvas.height !== cameraVideo.videoHeight) {
				cameraCanvas.width = cameraVideo.videoWidth;
				cameraCanvas.height = cameraVideo.videoHeight;
			}

			cameraCanvasContext.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
			cameraCanvasContext.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
			cameraCanvasContext.globalCompositeOperation = 'destination-in';
			cameraCanvasContext.drawImage(results.segmentationMask, 0, 0, cameraCanvas.width, cameraCanvas.height);
			cameraCanvasContext.globalCompositeOperation = 'source-over';
			cameraStage.classList.add('is-camera-ready');
			captureButton.disabled = false;
		}

		function drawCover(context, source, sourceWidth, sourceHeight, targetWidth, targetHeight) {
			var scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight),
				drawWidth = sourceWidth * scale,
				drawHeight = sourceHeight * scale;

			context.drawImage(
				source,
				(targetWidth - drawWidth) / 2,
				(targetHeight - drawHeight) / 2,
				drawWidth,
				drawHeight
			);
		}

		function drawContain(context, source, sourceWidth, sourceHeight, targetWidth, targetHeight) {
			var scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight),
				drawWidth = sourceWidth * scale,
				drawHeight = sourceHeight * scale;

			context.drawImage(
				source,
				(targetWidth - drawWidth) / 2,
				targetHeight - drawHeight,
				drawWidth,
				drawHeight
			);
		}

		async function createPhotoBlob() {
			await Promise.all([backgroundImage.decode(), foregroundImage.decode()]);

			return new Promise(function(resolve, reject) {
				var outputCanvas = document.createElement('canvas'),
					outputContext,
					width = 1200,
					height = Math.round(width * cameraStage.clientHeight / cameraStage.clientWidth);

				outputCanvas.width = width;
				outputCanvas.height = height;
				outputContext = outputCanvas.getContext('2d');

				if (!outputContext || !cameraCanvas.width || !cameraCanvas.height ||
					!backgroundImage.complete || !backgroundImage.naturalWidth) {
					reject(new Error('La vista previa todavía no está lista.'));
					return;
				}

				drawCover(
					outputContext,
					backgroundImage,
					backgroundImage.naturalWidth,
					backgroundImage.naturalHeight,
					width,
					height
				);

				drawContain(
					outputContext,
					foregroundImage,
					foregroundImage.naturalWidth,
					foregroundImage.naturalHeight,
					width,
					height
				);

				outputContext.save();
				outputContext.translate(width, 0);
				outputContext.scale(-1, 1);
				drawCover(outputContext, cameraCanvas, cameraCanvas.width, cameraCanvas.height, width, height);
				outputContext.restore();

				outputCanvas.toBlob(function(blob) {
					if (blob) {
						resolve(blob);
					} else {
						reject(new Error('No se pudo preparar la foto para descargar.'));
					}
				}, 'image/png');
			});
		}

		async function capturePhoto() {
			captureButton.disabled = true;
			captureButton.textContent = 'Preparando foto...';

			try {
				var photoBlob = await createPhotoBlob();

				if (!cameraDialog.open) {
					return;
				}

				capturedPhotoUrl = URL.createObjectURL(photoBlob);
				capturedPreview.src = capturedPhotoUrl;
				downloadButton.href = capturedPhotoUrl;
				cameraStage.classList.add('has-captured-photo');
				captureControls.classList.add('is-hidden');
				backgroundControls.classList.add('is-hidden');
				resultControls.hidden = false;
				cameraStatus.textContent = '¡Foto lista! Puedes descargarla o volver a tomarla.';
			} catch (error) {
				cameraStatus.textContent = error.message;
			} finally {
				if (cameraDialog.open && cameraStream) {
					captureButton.disabled = false;
					captureButton.textContent = 'Tomar foto (' + countdownSelect.value + ' s)';
				}
			}
		}

		function startCountdown() {
			var seconds = Number(countdownSelect.value);

			if (!cameraStream || captureButton.disabled || countdownTimer !== null) {
				return;
			}

			captureButton.disabled = true;
			countdownDisplay.textContent = String(seconds);
			countdownDisplay.classList.add('is-visible');
			cameraStatus.textContent = 'La foto se tomará en ' + seconds + ' segundos.';

			countdownTimer = window.setInterval(function() {
				seconds -= 1;

				if (seconds <= 0) {
					window.clearInterval(countdownTimer);
					countdownTimer = null;
					countdownDisplay.textContent = '';
					countdownDisplay.classList.remove('is-visible');
					capturePhoto();
					return;
				}

				countdownDisplay.textContent = String(seconds);
				cameraStatus.textContent = 'La foto se tomará en ' + seconds + ' segundos.';
			}, 1000);
		}

		function processCameraFrame() {
			if (!cameraStream || !cameraDialog.open || cameraVideo.readyState < 2) {
				return;
			}

			selfieSegmentation.send({image: cameraVideo}).then(function() {
				if (cameraStream && cameraDialog.open) {
					cameraFrameRequest = window.requestAnimationFrame(processCameraFrame);
				}
			}).catch(function() {
				stopCamera();
				cameraStatus.textContent = 'No se pudo separar el fondo de la cámara. Cierra la ventana e inténtalo de nuevo.';
			});
		}

		function initializeSegmentation() {
			if (selfieSegmentation) {
				return Promise.resolve();
			}

			if (typeof window.SelfieSegmentation !== 'function') {
				return Promise.reject(new Error('El módulo de recorte no está disponible.'));
			}

			selfieSegmentation = new window.SelfieSegmentation({
				locateFile: function(file) {
					return 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/' + file;
				}
			});
			selfieSegmentation.setOptions({modelSelection: 1});
			selfieSegmentation.onResults(renderCameraFrame);

			return selfieSegmentation.initialize();
		}

		cameraDialog.querySelector('.photo-background-previous').addEventListener('click', function() {
			selectBackground(backgroundIndex - 1);
		});

		cameraDialog.querySelector('.photo-background-next').addEventListener('click', function() {
			selectBackground(backgroundIndex + 1);
		});

		subjectSelect.addEventListener('change', function() {
			selectSubject(subjectSelect.value);
		});

		countdownSelect.addEventListener('change', function() {
			captureButton.textContent = 'Tomar foto (' + countdownSelect.value + ' s)';
		});

		captureButton.addEventListener('click', startCountdown);

		cameraDialog.querySelector('.photo-retake-button').addEventListener('click', function() {
			resetCapturedPhoto();
			cameraStatus.textContent = 'Cámara activa. Colócate en el espacio libre de la foto.';
		});

		cameraDialog.querySelector('.photo-with-vashito-close').addEventListener('click', function() {
			cameraDialog.close();
		});

		cameraDialog.addEventListener('click', function(event) {
			if (event.target === cameraDialog) {
				cameraDialog.close();
			}
		});

		cameraDialog.addEventListener('close', stopCamera);

		document.querySelector('.photo-with-vashito-open').addEventListener('click', async function() {
			cameraDialog.showModal();
			cameraStatus.textContent = 'Solicitando acceso a la cámara...';

			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				cameraStatus.textContent = 'Este navegador no permite usar la cámara aquí. Abre el sitio mediante HTTPS y vuelve a intentarlo.';
				return;
			}

			try {
				cameraStream = await navigator.mediaDevices.getUserMedia({
					audio: false,
					video: {facingMode: 'user'}
				});

				if (!cameraDialog.open) {
					stopCamera();
					return;
				}

				cameraVideo.srcObject = cameraStream;
				await cameraVideo.play();
				cameraStatus.textContent = 'Preparando el recorte de fondo...';
				await initializeSegmentation();

				if (!cameraDialog.open) {
					stopCamera();
					return;
				}

				cameraStatus.textContent = 'Cámara activa. Colócate en el espacio libre de la foto.';
				processCameraFrame();
			} catch (error) {
				stopCamera();
				if (error.name === 'NotAllowedError') {
					cameraStatus.textContent = 'No se concedió permiso para usar la cámara. Puedes habilitarlo en los permisos del navegador.';
				} else if (error.name === 'NotFoundError') {
					cameraStatus.textContent = 'No se encontró una cámara disponible en este dispositivo.';
				} else {
					cameraStatus.textContent = error.message === 'El módulo de recorte no está disponible.'
						? 'No se pudo cargar el recorte de fondo. Comprueba tu conexión e inténtalo de nuevo.'
						: 'No se pudo iniciar la cámara o separar el fondo. Comprueba los permisos y la conexión.';
				}
			}
		});
	}

	if (!projectFrame) {
		return;
	}

	projectTabs.forEach(function(tab) {
		tab.addEventListener('click', function() {
			projectTabs.forEach(function(projectTab) {
				projectTab.classList.remove('is-active');
				projectTab.setAttribute('aria-pressed', 'false');
			});

			tab.classList.add('is-active');
			tab.setAttribute('aria-pressed', 'true');
			projectFrame.src = tab.getAttribute('data-project-src');
		});
	});

	reloadButton.addEventListener('click', function() {
		var activeTab = document.querySelector('.project-tab.is-active');

		if (activeTab) {
			projectFrame.src = activeTab.getAttribute('data-project-src');
		}
	});

	projectLinks.forEach(function(link) {
		link.addEventListener('click', function(event) {
			if (link.getAttribute('href') === '#') {
				event.preventDefault();
			}
		});
	});
}(jQuery));
