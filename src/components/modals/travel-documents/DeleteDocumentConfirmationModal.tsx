import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Shield, FileText } from "lucide-react";

interface DeleteDocumentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentType: string;
}

const DeleteDocumentConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  documentType,
}: DeleteDocumentConfirmationModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 size={20} />
            <span>Eliminar Documento</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Shield className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-900 mb-1">
                  ¿Estás seguro de que quieres eliminar este documento?
                </p>
                <p className="text-red-700">
                  <strong>Tipo:</strong> {documentType}
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-start space-x-2">
                <FileText className="w-4 h-4 mt-0.5 text-gray-500" />
                <p>
                  Esta acción eliminará permanentemente el documento encriptado y su archivo asociado.
                </p>
              </div>
              <p className="pl-6 font-medium text-red-600">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 size={16} className="mr-2" />
            Eliminar Documento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDocumentConfirmationModal;