 // FINAL EDIT 
    
 
    const textarea = document.querySelector("textarea");
    const voiceList = document.querySelector("select");
    const speechBtn = document.querySelector("button");
    const speedInput = document.querySelector("#speed");
    const fileInput = document.querySelector("#fileInput");
    const outputDiv = document.querySelector("#output");
    let synth = window.speechSynthesis;
    let isSpeaking = false;
    let pdfDoc = null;

    function populateVoiceList() {
      const voices = synth.getVoices();
      voiceList.innerHTML = '';
     
      for (let voice of voices) {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.setAttribute('value', voice.lang);
        voiceList.appendChild(option);
      }
    }

    function initializeVoices() {
      if (!synth) return;
      synth.addEventListener('voiceschanged', populateVoiceList);
      populateVoiceList();
    }

    initializeVoices();

    function textToSpeech(text) {
      if (synth.speaking) {
        synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = synth.getVoices().find(voice => voice.lang === voiceList.value);
      utterance.rate = parseFloat(speedInput.value);
      synth.speak(utterance);
    }

    function readPDF(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const typedArray = new Uint8Array(event.target.result);
        pdfjsLib.getDocument(typedArray).promise.then((pdf) => {
          pdfDoc = pdf;
          const numPages = pdf.numPages;
          let textContent = '';

          for (let i = 1; i <= numPages; i++) {
            pdf.getPage(i).then((page) => {
              page.getTextContent().then((content) => {
                const pageText = content.items.map(item => item.str).join(' ');
                textContent += pageText;

                if (i === numPages) {
                  textarea.value = textContent;
                  if (!synth.speaking) {
                    textToSpeech(textContent);
                    isSpeaking = true;
                    speechBtn.innerText = "Pause Speech";
                  }
                }
              });
            });
          }
        });
      };

      reader.readAsArrayBuffer(file);
    }

    fileInput.addEventListener("change", () => {
      const selectedFile = fileInput.files[0];
      if (selectedFile) {
        if (selectedFile.type === "application/pdf") {
          readPDF(selectedFile);
        } else {
          const reader = new FileReader();
          reader.onload = (event) => {
            const fileContent = event.target.result;
            textarea.value = fileContent;
            if (!synth.speaking) {
              textToSpeech(fileContent);
              isSpeaking = true;
              speechBtn.innerText = "Pause Speech";
            }
          };
          reader.readAsText(selectedFile);
        }
      }
    });

    speechBtn.addEventListener("click", (e) => {
      e.preventDefault();

      if (textarea.value !== "") {
        if (!synth.speaking) {
          textToSpeech(textarea.value);
          isSpeaking = true;
          speechBtn.innerText = "Pause Speech";
        } else {
          if (isSpeaking) {
            synth.pause();
            isSpeaking = false;
            speechBtn.innerText = "Resume Speech";
          } else {
            synth.resume();
            isSpeaking = true;
            speechBtn.innerText = "Pause Speech";
          }
        }
      }
    });

    speedInput.addEventListener("input", () => {
      if (synth.speaking) {
        synth.cancel();
        textToSpeech(textarea.value);
      }
    });

