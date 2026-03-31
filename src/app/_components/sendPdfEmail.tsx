import { useRef } from "react";
import generatePDF, { Margin, Options, Resolution, usePDF } from "react-to-pdf";
import { api } from "~/trpc/react";

export default function Component() {
  const targetRef = useRef<HTMLDivElement>(null); // Asegúrate de especificar el tipo de referencia
  const targetRef2 = useRef<HTMLDivElement>(null); // Asegúrate de especificar el tipo de referencia
  const { toPDF } = usePDF();

  async function generateBase64PDF() {
    try {
      toPDF({
        method: "build",
        resolution: 2,
        page: {
          format: "A4",
          margin: 10,
          orientation: "portrait",
        },
        canvas: {
          useCORS: true,
          logging: true,
          mimeType: "image/jpeg",
          qualityRatio: 1,
        },
      });

      const pdfInstance = await generatePDF(targetRef, {
        method: "build",
        resolution: 2,
        page: {
          format: "A4",
          margin: 10,
          orientation: "portrait",
        },
        canvas: {
          useCORS: true,
          logging: true,
          mimeType: "image/jpeg",
          qualityRatio: 1,
        },
      });

      const pdfBase64 = pdfInstance.output("datauristring");

      //con este base64 lo mando a attachments en sendgrip
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  }

  return (
    <div>
      <button onClick={generateBase64PDF}>Download PDF</button>
      <div ref={targetRef}>
        <h1>Test</h1>
      </div>
    </div>
  );
}
