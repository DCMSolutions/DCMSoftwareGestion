"use client";

import { UploadButton } from "~/utils/uploadthing";
import { utapi } from "~/server/uploadthing";

export default async function Home() {
  const oneUrl = await utapi.getFileUrls(
    "fd638b3a-873b-4cfd-a09c-6f25583ae477-asln0v.png",
  );
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
    </main>
  );
}
