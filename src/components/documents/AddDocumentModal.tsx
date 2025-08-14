import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useDocuments } from "@/contexts/UseContext";
import { Progress } from "@/components/ui/progress";
import { useErrorHandler } from "@/lib/errorHandler";

interface AddDocumentModalProps {
  children: React.ReactNode;
}

type LoadingStep = 'idle' | 'uploading' | 'processing' | 'saving' | 'success' | 'error';

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('idle');
  const [progress, setProgress] = useState(0);

  const { addDocument, categories } = useDocuments();
  const { toast } = useToast();
  const { showError, showSuccess } = useErrorHandler();

  const isLoading = loadingStep !== 'idle';
  const isProcessing = loadingStep === 'uploading' || loadingStep === 'processing' || loadingStep === 'saving';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name);
      }

      // Déterminer la catégorie basée sur le type de fichier
      const fileType = selectedFile.type;
      if (fileType.includes("pdf")) {
        setCategory("pdf");
      } else if (fileType.includes("image")) {
        setCategory("image");
      } else if (
        fileType.includes("presentation") ||
        fileType.includes("powerpoint")
      ) {
        setCategory("presentation");
      } else if (
        fileType.includes("spreadsheet") ||
        fileType.includes("excel")
      ) {
        setCategory("spreadsheet");
      } else if (fileType.includes("zip") || fileType.includes("rar")) {
        setCategory("archive");
      } else {
        setCategory("document");
      }
    }
  };

  const simulateProgress = (targetProgress: number, duration: number = 1000) => {
    return new Promise<void>((resolve) => {
      const startProgress = progress;
      const progressDiff = targetProgress - startProgress;
      const steps = 50;
      const stepSize = progressDiff / steps;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const newProgress = Math.min(startProgress + (stepSize * currentStep), targetProgress);
        setProgress(newProgress);
        
        if (currentStep >= steps || newProgress >= targetProgress) {
          clearInterval(interval);
          setProgress(targetProgress);
          resolve();
        }
      }, stepDuration);
    });
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setTags("");
    setFile(null);
    setLoadingStep('idle');
    setProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showError("Le nom du document est requis", "Validation échouée");
      return;
    }

    if (!category) {
      showError("Veuillez sélectionner une catégorie", "Validation échouée");
      return;
    }

    try {
      // Étape 1: Upload du fichier
      setLoadingStep('uploading');
      setProgress(0);
      await simulateProgress(30, 800);

      let base64File = "";
      let mimeType = "";

      if (file) {
        mimeType = file.type;
        base64File = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1] || "";
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      // Étape 2: Traitement
      setLoadingStep('processing');
      await simulateProgress(60, 500);

      const documentData = {
        name: name.trim(),
        type: category,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        category,
        description: description.trim() || undefined,
        base64File,
        mimeType,
      };

      // Étape 3: Sauvegarde
      setLoadingStep('saving');
      await simulateProgress(90, 300);

      await addDocument(documentData);

      // Étape 4: Succès
      setLoadingStep('success');
      await simulateProgress(100, 200);

      showSuccess("Document ajouté", `Le document "${name}" a été ajouté avec succès`);

      // Attendre un peu avant de fermer
      setTimeout(() => {
        resetForm();
        setOpen(false);
      }, 1000);

    } catch (error) {
      console.error("Erreur ajout document:", error);
      setLoadingStep('error');
      showError(error, "Échec de l'ajout du document");
      
      // Retour à l'état idle après 2 secondes
      setTimeout(() => {
        setLoadingStep('idle');
        setProgress(0);
      }, 2000);
    }
  };

  const getLoadingConfig = () => {
    switch (loadingStep) {
      case 'uploading':
        return {
          icon: Upload,
          text: 'Upload du fichier en cours...',
          description: 'Lecture et conversion du fichier'
        };
      case 'processing':
        return {
          icon: Upload,
          text: 'Traitement du document...',
          description: 'Analyse et validation des données'
        };
      case 'saving':
        return {
          icon: Upload,
          text: 'Sauvegarde en cours...',
          description: 'Enregistrement dans la base de données'
        };
      case 'success':
        return {
          icon: CheckCircle,
          text: 'Document ajouté avec succès !',
          description: 'Le document a été ajouté à votre collection'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Erreur lors de l\'ajout',
          description: 'Une erreur est survenue, veuillez réessayer'
        };
      default:
        return null;
    }
  };

  const loadingConfig = getLoadingConfig();

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!isProcessing) {
        setOpen(newOpen);
        if (!newOpen) {
          resetForm();
        }
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Ajouter un nouveau document</span>
          </DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau document à votre collection. Vous pouvez uploader
            un fichier ou créer une entrée manuellement.
          </DialogDescription>
        </DialogHeader>

        {/* Overlay de loading */}
        {isLoading && loadingConfig && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center space-y-4 p-6">
              <div className="flex justify-center">
                <loadingConfig.icon 
                  className={`w-12 h-12 ${
                    loadingStep === 'success' 
                      ? 'text-green-500' 
                      : loadingStep === 'error' 
                        ? 'text-red-500' 
                        : 'text-primary animate-pulse'
                  }`} 
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{loadingConfig.text}</h3>
                <p className="text-sm text-muted-foreground">{loadingConfig.description}</p>
              </div>
              {isProcessing && (
                <div className="space-y-2 w-64">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload de fichier */}
          <div className="space-y-2">
            <Label htmlFor="file">Fichier (optionnel)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground"
              />
              {file && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => {
                    setFile(null);
                    const fileInput = document.getElementById(
                      "file"
                    ) as HTMLInputElement;
                    if (fileInput) fileInput.value = "";
                  }}
                >
                  Supprimer
                </Button>
              )}
            </div>
          </div>

          {/* Nom du document */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du document *</Label>
            <Input
              id="name"
              placeholder="Ex: Rapport_mensuel.pdf"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label>Catégorie *</Label>
            <Select 
              value={category} 
              onValueChange={setCategory} 
              disabled={isProcessing}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description du document..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isProcessing}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="important, projet, 2024 (séparés par des virgules)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading}>
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {loadingConfig?.text.replace('...', '') || 'Traitement...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Ajouter le document
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
