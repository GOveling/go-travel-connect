import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCountryImageUpload } from "@/hooks/useCountryImageUpload";

export const CountryImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [countryName, setCountryName] = useState("");
  const { uploadCountryImage, loading } = useCountryImageUpload();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !countryName) {
      alert("Por favor selecciona una imagen y especifica el nombre del país");
      return;
    }

    try {
      await uploadCountryImage(countryName, selectedFile);
      setSelectedFile(null);
      setCountryName("");
      // Reset file input
      const fileInput = document.getElementById(
        "image-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Auto-upload Chile image
  const uploadChileImage = async () => {
    try {
      // Create a File object from the uploaded Chile image
      const response = await fetch(
        "/lovable-uploads/25930824-b9b0-4820-b883-a66e9dbef55e.png"
      );
      const blob = await response.blob();
      const file = new File([blob], "chile.png", { type: "image/png" });

      await uploadCountryImage("Chile", file);
    } catch (error) {
      console.error("Error uploading Chile image:", error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Subir Imagen de País</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="country-name">Nombre del País</Label>
          <Input
            id="country-name"
            type="text"
            value={countryName}
            onChange={(e) => setCountryName(e.target.value)}
            placeholder="Ej: Chile"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-upload">Imagen del País</Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !countryName || loading}
          className="w-full"
        >
          {loading ? "Subiendo..." : "Subir Imagen"}
        </Button>

        <Button
          onClick={uploadChileImage}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          {loading ? "Subiendo..." : "Subir Imagen de Chile"}
        </Button>
      </CardContent>
    </Card>
  );
};
