const workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';
const pdfjs = await import('pdfjs-dist/build/pdf');
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
import { useState } from "react";
import * as pdfjsLib from 'pdfjs-dist';



export default function Converter(){
    const [file, setFile] = useState(null);
    const saveForm = (file) => {
        if (file) {
            convertPdfToImages(file).then((images) => {
                const zip = new JSZip();
                images.forEach((imgData, index) => {
                    const imgName = `page-${index + 1}.jpg`;
                    zip.file(imgName, imgData.split(',')[1], {base64: true});
                });
                zip.generateAsync({ type: "blob" }).then((content) => {
                    saveAs(content, "pdf-images.zip");
                });
            });
        }
    }
    
    
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
        } else {
            alert("Please select a valid PDF file.");
        }
    };
    

    const readFileData = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
            resolve(e.target.result);
            };
            reader.onerror = (err) => {
            reject(err);
            };
            reader.readAsDataURL(file);
        });
    };
    
    //param: file -> the input file (e.g. event.target.files[0])
    //return: images -> an array of images encoded in base64 
    const convertPdfToImages = async (file) => {
        const images = [];
        const data = await readFileData(file);
        const pdf = await pdfjsLib.getDocument(data).promise;
        const canvas = document.createElement("canvas");
        for (let i = 0; i < pdf.numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const viewport = page.getViewport({ scale: 1 });
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            images.push(canvas.toDataURL("image/jpeg"));
        }
        canvas.remove();
        return images;
    }
    return (
        <div>
            <h1>PDF to Image Converter</h1>
            <p>Select a PDF file to convert it to images.</p>
            <input type="file" name="pdfile" id="pdfile" onChange={handleFileChange}/>
            <button onClick={() => {saveForm(file)}}>Save</button>
        </div>
        
    );
}